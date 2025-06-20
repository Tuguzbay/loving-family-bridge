
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Family, FamilyMember, ConversationCompletion } from '@/types/profile';

export const useFamilyData = () => {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [conversationCompletion, setConversationCompletion] = useState<ConversationCompletion | null>(null);

  const fetchFamilyData = async () => {
    if (!user) return;

    console.log('--- Fetching Family Data ---');
    
    try {
      // First, check if user is a family member
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select(`
          *,
          families (*)
        `)
        .eq('user_id', user.id)
        .single();

      if (memberError) {
        if (memberError.code === 'PGRST116') {
          console.log('User is not a member of any family');
          return;
        }
        console.error('Error fetching family membership:', memberError);
        return;
      }

      if (!memberData || !memberData.families) {
        console.log('User is not a member of any family');
        return;
      }

      console.log('Family found:', memberData.families);
      setFamily(memberData.families as Family);
      
      // Fetch all family members with profiles
      const { data: allMembers, error: allMembersError } = await supabase
        .from('family_members')
        .select(`
          id,
          family_id,
          user_id,
          joined_at,
          profiles!inner (
            id,
            full_name,
            user_type,
            age,
            created_at,
            updated_at
          )
        `)
        .eq('family_id', memberData.families.id);

      if (allMembersError) {
        console.error('Error fetching family members:', allMembersError);
        setFamilyMembers([]);
      } else {
        console.log('All family members fetched successfully:', allMembers);
        setFamilyMembers(allMembers || []);
      }
      
      // Fetch conversation completion status
      await fetchConversationCompletion(memberData.families.id);
      
    } catch (error) {
      console.error('Unexpected error in fetchFamilyData:', error);
    }
  };

  const fetchConversationCompletion = async (familyId: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversation_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('family_id', familyId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching conversation completion:', error);
      return;
    }

    console.log('Conversation completion status:', data);
    setConversationCompletion(data);
  };

  return {
    family,
    familyMembers,
    conversationCompletion,
    setFamily,
    setFamilyMembers,
    setConversationCompletion,
    fetchFamilyData,
    fetchConversationCompletion
  };
};
