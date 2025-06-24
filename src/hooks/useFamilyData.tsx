
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
    if (!user) {
      console.log('No user, resetting family data');
      setFamily(null);
      setFamilyMembers([]);
      setConversationCompletion(null);
      return;
    }

    console.log('=== FETCHING FAMILY DATA ===');
    console.log('User ID:', user.id);
    
    try {
      // Step 1: Check if user is a member of any family
      const { data: membershipData, error: membershipError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Membership check result:', { membershipData, membershipError });

      if (membershipError) {
        console.error('Error checking family membership:', membershipError);
        return;
      }

      if (!membershipData) {
        console.log('User is not a member of any family');
        setFamily(null);
        setFamilyMembers([]);
        setConversationCompletion(null);
        return;
      }

      const familyId = membershipData.family_id;
      console.log('User is member of family:', familyId);

      // Step 2: Fetch family details
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', familyId)
        .single();

      console.log('Family data result:', { familyData, familyError });

      if (familyError || !familyData) {
        console.error('Family not found, cleaning up membership:', familyError);
        // Clean up orphaned membership
        await supabase
          .from('family_members')
          .delete()
          .eq('user_id', user.id);
        
        setFamily(null);
        setFamilyMembers([]);
        setConversationCompletion(null);
        return;
      }

      // Step 3: Fetch all family members
      const { data: membersData, error: membersError } = await supabase
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
        .eq('family_id', familyId);

      console.log('Family members result:', { membersData, membersError });

      // Set the data
      setFamily(familyData);
      setFamilyMembers(membersData || []);

      // Step 4: Fetch conversation completion
      const { data: completionData, error: completionError } = await supabase
        .from('conversation_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('family_id', familyId)
        .maybeSingle();

      if (!completionError) {
        setConversationCompletion(completionData);
      }

      console.log('=== FAMILY DATA FETCH COMPLETE ===');
      console.log('Family:', familyData);
      console.log('Members count:', membersData?.length || 0);
      
    } catch (error) {
      console.error('Unexpected error in fetchFamilyData:', error);
      setFamily(null);
      setFamilyMembers([]);
      setConversationCompletion(null);
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
