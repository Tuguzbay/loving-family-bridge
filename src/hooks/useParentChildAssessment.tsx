
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { ParentChildAssessment } from '@/types/profile';

interface AssessmentResponses {
  short: string[];
  long: string[];
}

interface AIAnalysis {
  childProfile?: string;
  parentProfile?: string;
  childQuestion?: string;
  parentQuestion?: string;
  childConclusion?: string;
  parentConclusion?: string;
  error?: string;
}

// Type guard to check if a Json value is AssessmentResponses
const isAssessmentResponses = (value: any): value is AssessmentResponses => {
  return (
    value &&
    typeof value === 'object' &&
    Array.isArray(value.short) &&
    Array.isArray(value.long) &&
    value.short.every((item: any) => typeof item === 'string') &&
    value.long.every((item: any) => typeof item === 'string')
  );
};

export const useParentChildAssessment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const saveParentResponses = async (
    familyId: string,
    childId: string,
    responses: AssessmentResponses
  ) => {
    if (!user) return { error: 'No user found' };
    
    setLoading(true);
    
    try {
      // First get child's conversation responses
      const { data: childConversationResponses } = await supabase
        .from('conversation_responses')
        .select('*')
        .eq('user_id', childId)
        .eq('family_id', familyId);

      // Convert conversation responses to assessment format
      let childResponses: AssessmentResponses = { short: [], long: [] };
      if (childConversationResponses && childConversationResponses.length > 0) {
        childResponses.short = childConversationResponses
          .filter(r => r.question_type === 'short')
          .sort((a, b) => a.question_id - b.question_id)
          .map(r => r.response);
        childResponses.long = childConversationResponses
          .filter(r => r.question_type === 'long')
          .sort((a, b) => a.question_id - b.question_id)
          .map(r => r.response);
      }

      // Check if assessment already exists
      const { data: existingAssessment } = await supabase
        .from('parent_child_assessments')
        .select('*')
        .eq('parent_id', user.id)
        .eq('child_id', childId)
        .maybeSingle();

      if (existingAssessment) {
        // Update existing assessment with parent responses and child responses
        const { data, error } = await supabase
          .from('parent_child_assessments')
          .update({
            parent_responses: responses as any,
            child_responses: childResponses as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAssessment.id)
          .select()
          .single();

        if (error) throw error;

        // Trigger AI analysis if both have responses
        if (childResponses.short.length > 0 && childResponses.long.length > 0) {
          await triggerAIAnalysis(data.id, responses, childResponses);
        }

        return { data };
      } else {
        // Create new assessment with both responses
        const { data, error } = await supabase
          .from('parent_child_assessments')
          .insert({
            family_id: familyId,
            parent_id: user.id,
            child_id: childId,
            parent_responses: responses as any,
            child_responses: childResponses as any
          })
          .select()
          .single();

        if (error) throw error;

        // Trigger AI analysis if both have responses
        if (childResponses.short.length > 0 && childResponses.long.length > 0) {
          await triggerAIAnalysis(data.id, responses, childResponses);
        }

        return { data };
      }
    } catch (error) {
      console.error('Error saving parent responses:', error);
      return { error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const triggerAIAnalysis = async (
    assessmentId: string,
    parentResponses: AssessmentResponses,
    childResponses: AssessmentResponses
  ) => {
    setAnalysisStatus('loading');
    try {
      // Validate responses before sending
      if (parentResponses.short.length === 0 || childResponses.short.length === 0) {
        throw new Error('Incomplete responses for analysis');
      }

      console.log('Triggering AI analysis with:', {
        assessmentId,
        parentResponsesCount: parentResponses.short.length + parentResponses.long.length,
        childResponsesCount: childResponses.short.length + childResponses.long.length
      });

      const { data: analysisResult, error } = await supabase.functions.invoke(
        'analyze-parent-child-relationship',
        {
          body: { 
            parentResponses,
            childResponses 
          }
        }
      );

      console.log('Supabase function raw result:', analysisResult);
      console.log('Supabase function error:', error);

      if (error) throw error;
      if (!analysisResult) throw new Error('No analysis result returned');

      // Validate and store the analysis
      const validatedAnalysis: AIAnalysis = analysisResult.error
        ? { error: analysisResult.error }
        : {
            childProfile: analysisResult.childProfile || undefined,
            parentProfile: analysisResult.parentProfile || undefined,
            childQuestion: analysisResult.childQuestion || undefined,
            parentQuestion: analysisResult.parentQuestion || undefined,
            childConclusion: analysisResult.childConclusion || undefined,
            parentConclusion: analysisResult.parentConclusion || undefined
          };

      console.log('Storing validated analysis:', validatedAnalysis);

      const { data: updateData, error: updateError } = await supabase
        .from('parent_child_assessments')
        .update({
          ai_analysis: validatedAnalysis as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId)
        .select();

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      console.log('AI analysis stored successfully:', updateData);
      setAnalysisStatus('success');
      return validatedAnalysis;
    } catch (error) {
      console.error('Error with AI analysis:', error);
      setAnalysisStatus('error');
      toast({
        title: "Analysis Failed",
        description: error.message || "Couldn't generate insights",
        variant: "destructive"
      });
      return { error: error.message };
    }
  };

  const getAssessment = useCallback(async (childId: string): Promise<ParentChildAssessment | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('parent_child_assessments')
        .select('*')
        .eq('parent_id', user.id)
        .eq('child_id', childId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Return structured AI analysis
      return {
        ...data,
        parent_responses: isAssessmentResponses(data.parent_responses) 
          ? data.parent_responses 
          : { short: [], long: [] },
        child_responses: isAssessmentResponses(data.child_responses) 
          ? data.child_responses 
          : { short: [], long: [] },
        ai_analysis: data.ai_analysis || null // Keep as object
      };
    } catch (error) {
      console.error('Error fetching assessment:', error);
      return null;
    }
  }, [user]);

  const getAssessmentsForFamily = useCallback(async (familyId: string): Promise<ParentChildAssessment[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('parent_child_assessments')
        .select('*')
        .eq('family_id', familyId);

      if (error) throw error;
      if (!data) return [];

      // Convert the database responses to our expected type
      return data.map(item => ({
        ...item,
        parent_responses: isAssessmentResponses(item.parent_responses) 
          ? item.parent_responses 
          : { short: [], long: [] },
        child_responses: isAssessmentResponses(item.child_responses) 
          ? item.child_responses 
          : { short: [], long: [] },
        ai_analysis: item.ai_analysis || null // Keep as object
      }));
    } catch (error) {
      console.error('Error fetching family assessments:', error);
      return [];
    }
  }, [user]);

  return {
    loading,
    analysisStatus,
    saveParentResponses,
    getAssessment,
    getAssessmentsForFamily
  };
};
