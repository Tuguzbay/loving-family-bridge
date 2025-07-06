
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { ParentChildAssessment } from '@/types/profile';

interface AssessmentResponses {
  short: string[];
  long: string[];
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
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke(
        'analyze-parent-child-relationship',
        {
          body: { parentResponses, childResponses }
        }
      );

      if (analysisError) throw analysisError;

      // Store AI analysis as a JSON object with structured data
      await supabase
        .from('parent_child_assessments')
        .update({
          ai_analysis: analysisResult, // Store the entire response
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId);

      setAnalysisStatus('success');
    } catch (error) {
      console.error('Error with AI analysis:', error);
      setAnalysisStatus('error');
      // Add error notification for the user
      toast({
        title: "AI Analysis Failed",
        description: "We couldn't generate insights. Please try again later.",
        variant: "destructive"
      });
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
