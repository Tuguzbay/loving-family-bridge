
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { ParentChildAssessment } from '@/types/profile';

interface AssessmentResponses {
  short: string[];
  long: string[];
}

export const useParentChildAssessment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const saveParentResponses = async (
    familyId: string,
    childId: string,
    responses: AssessmentResponses
  ) => {
    if (!user) return { error: 'No user found' };
    
    setLoading(true);
    
    try {
      // First check if child has completed their responses
      const { data: existingAssessment } = await supabase
        .from('parent_child_assessments')
        .select('*')
        .eq('parent_id', user.id)
        .eq('child_id', childId)
        .maybeSingle();

      if (existingAssessment) {
        // Update existing assessment with parent responses
        const { data, error } = await supabase
          .from('parent_child_assessments')
          .update({
            parent_responses: responses as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAssessment.id)
          .select()
          .single();

        if (error) throw error;

        // If both parent and child have responses, trigger AI analysis
        const childResponses = existingAssessment.child_responses as AssessmentResponses;
        if (childResponses && childResponses.short && childResponses.short.length > 0) {
          await triggerAIAnalysis(data.id, responses, childResponses);
        }

        return { data };
      } else {
        // Create new assessment with parent responses
        const { data, error } = await supabase
          .from('parent_child_assessments')
          .insert({
            family_id: familyId,
            parent_id: user.id,
            child_id: childId,
            parent_responses: responses as any,
            child_responses: { short: [], long: [] } as any // Empty child responses initially
          })
          .select()
          .single();

        if (error) throw error;
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
    try {
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke(
        'analyze-parent-child-relationship',
        {
          body: { parentResponses, childResponses }
        }
      );

      if (analysisError) throw analysisError;

      // Save the AI analysis back to the database
      await supabase
        .from('parent_child_assessments')
        .update({
          ai_analysis: { analysis: analysisResult.analysis } as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId);

    } catch (error) {
      console.error('Error with AI analysis:', error);
    }
  };

  const getAssessment = async (childId: string): Promise<ParentChildAssessment | null> => {
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

      // Convert the database response to our expected type
      return {
        ...data,
        parent_responses: data.parent_responses as AssessmentResponses,
        child_responses: data.child_responses as AssessmentResponses,
        ai_analysis: data.ai_analysis ? (data.ai_analysis as any).analysis : undefined
      };
    } catch (error) {
      console.error('Error fetching assessment:', error);
      return null;
    }
  };

  const getAssessmentsForFamily = async (familyId: string): Promise<ParentChildAssessment[]> => {
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
        parent_responses: item.parent_responses as AssessmentResponses,
        child_responses: item.child_responses as AssessmentResponses,
        ai_analysis: item.ai_analysis ? (item.ai_analysis as any).analysis : undefined
      }));
    } catch (error) {
      console.error('Error fetching family assessments:', error);
      return [];
    }
  };

  return {
    loading,
    saveParentResponses,
    getAssessment,
    getAssessmentsForFamily
  };
};
