
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
    childResponses: AssessmentResponses,
    retryCount = 0
  ) => {
    setAnalysisStatus('loading');
    try {
      // Validate responses before sending
      if (
        parentResponses.short.length === 0 ||
        parentResponses.long.length === 0 ||
        childResponses.short.length === 0 ||
        childResponses.long.length === 0
      ) {
        throw new Error('Both parent and child must complete all short and long responses for analysis.');
      }

      // Build prompts (reuse your system/user prompt logic as before)
      // JSON structure for LM Studio prompt (copy this into LM Studio for reference):
      // {
      //   "childProfile": "...",
      //   "parentProfile": "...",
      //   "childQuestion": "...",
      //   "parentQuestion": "...",
      //   "childConclusion": "...",
      //   "parentConclusion": "..."
      // }

      const systemPrompt = `
You are an emotionally intelligent AI family relationship expert. 
Analyze the parent and child assessment responses and provide insights to help them understand each other better.

Return ONLY valid JSON with ALL of these fields, even if you have to leave some empty:

{
  "childProfile": "...",
  "parentProfile": "...",
  "childQuestion": "...",
  "parentQuestion": "...",
  "childConclusion": "...",
  "parentConclusion": "..."
}

Do not include any extra text, explanations, or comments. Do not use < or > in the keys. Only output the JSON object.`;
      console.log('Starting AI analysis with data:', {
        parentResponsesLength: parentResponses.short.length + parentResponses.long.length,
        childResponsesLength: childResponses.short.length + childResponses.long.length
      });

      // Call Supabase Edge Function using OpenRouter
      console.log('Calling Supabase Edge Function...');
      const { data: analysisResult, error: functionError } = await supabase.functions.invoke(
        'analyze-parent-child-relationship',
        {
          body: {
            parentResponses,
            childResponses
          }
        }
      );

      console.log('Edge Function response:', { analysisResult, functionError });

      if (functionError) {
        throw new Error(`Function error: ${functionError.message}`);
      }

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
      if (retryCount < 2) {
        console.log('Retrying AI analysis, attempt', retryCount + 1);
        return await triggerAIAnalysis(assessmentId, parentResponses, childResponses, retryCount + 1);
      }
      toast({
        title: "Analysis Failed",
        description: error.message || "Couldn't generate insights",
        variant: "destructive"
      });
      return { error: error.message, canRetry: true };
    }
  };

  // Retry function for UI
  const retryAnalysis = async (assessmentId: string, parentResponses: AssessmentResponses, childResponses: AssessmentResponses) => {
    return await triggerAIAnalysis(assessmentId, parentResponses, childResponses, 0);
  };

  const getAssessment = useCallback(async (childId: string): Promise<ParentChildAssessment | null> => {
    try {
      const { data, error } = await supabase
        .from('parent_child_assessments')
        .select('*')
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
  }, []);

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

  const refreshAndLinkChildResponses = async (childId: string, familyId: string) => {
    if (!user) return { error: 'No user found' };
    try {
      console.log('Linking child responses for:', childId);
      // Get child's conversation responses
      const { data: childConversationResponses, error: responseError } = await supabase
        .from('conversation_responses')
        .select('*')
        .eq('user_id', childId)
        .eq('family_id', familyId);
      if (responseError) {
        console.error('Error fetching child responses:', responseError);
        return { error: responseError.message };
      }
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
      // Check if assessment exists and get it
      const { data: existingAssessment, error: assessmentError } = await supabase
        .from('parent_child_assessments')
        .select('*')
        .eq('child_id', childId)
        .eq('family_id', familyId)
        .maybeSingle();
      if (assessmentError) {
        console.error('Error fetching assessment:', assessmentError);
        return { error: assessmentError.message };
      }
      if (!existingAssessment) {
        return { error: 'No parent assessment found for this child' };
      }
      // Update the assessment with child responses
      const { data: updatedAssessment, error: updateError } = await supabase
        .from('parent_child_assessments')
        .update({
          child_responses: childResponses as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAssessment.id)
        .select()
        .maybeSingle();
      if (updateError) {
        console.error('Error updating assessment:', updateError);
        return { error: updateError.message };
      }
      // Now trigger AI analysis if both have responses
      const parentResponses = existingAssessment.parent_responses;
      if (
        childResponses.short.length > 0 &&
        childResponses.long.length > 0 &&
        parentResponses && isAssessmentResponses(parentResponses) &&
        parentResponses.short.length > 0 &&
        parentResponses.long.length > 0 &&
        !existingAssessment.ai_analysis
      ) {
        console.log('Triggering AI analysis with data:', {
          assessmentId: existingAssessment.id,
          childResponsesCount: childResponses.short.length + childResponses.long.length,
          parentResponsesCount: parentResponses.short.length + parentResponses.long.length
        });
        await triggerAIAnalysis(existingAssessment.id, parentResponses, childResponses);
      } else {
        console.log('AI analysis conditions not met or already exists, skipping trigger', {
          hasChildResponses: childResponses.short.length > 0,
          hasParentResponses: parentResponses && isAssessmentResponses(parentResponses) && parentResponses.short.length > 0,
          aiAnalysisExists: !!existingAssessment.ai_analysis
        });
      }
      // Always re-fetch the latest assessment and return it
      const latest = await getAssessment(childId);
      return { data: latest };
    } catch (error) {
      console.error('Error in refreshAndLinkChildResponses:', error);
      return { error: error.message };
    }
  };

  return {
    loading,
    analysisStatus,
    saveParentResponses,
    getAssessment,
    getAssessmentsForFamily,
    refreshAndLinkChildResponses
  };
};
