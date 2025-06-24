
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
    console.log('User ID:', user.id);
    
    try {
      // First, check if user is a family member
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select(`
          id,
          family_id,
          user_id,
          joined_at
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Member data query result:', memberData, memberError);

      if (memberError) {
        console.error('Error fetching family membership:', memberError);
        return;
      }

      if (!memberData) {
        console.log('User is not a member of any family');
        setFamily(null);
        setFamilyMembers([]);
        setConversationCompletion(null);
        return;
      }

      console.log('User is a family member:', memberData);

      // Try to fetch the family details using direct query first
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', memberData.family_id)
        .maybeSingle();

      console.log('Direct family query result:', familyData, familyError);

      if (familyError) {
        console.error('Error fetching family details:', familyError);
        return;
      }

      if (!familyData) {
        console.log('Family not found via direct query, trying RPC function...');
        
        // Try using the RPC function as a fallback
        const { data: rpcFamilyData, error: rpcError } = await supabase
          .rpc('find_family_by_code', { code_param: '' })
          .eq('id', memberData.family_id);

        if (rpcError || !rpcFamilyData || rpcFamilyData.length === 0) {
          console.error('Family not found even with RPC, cleaning up orphaned record');
          
          // Clean up the orphaned family_member record
          const { error: deleteError } = await supabase
            .from('family_members')
            .delete()
            .eq('user_id', user.id);
          
          if (deleteError) {
            console.error('Error cleaning up orphaned family_member record:', deleteError);
          } else {
            console.log('Successfully cleaned up orphaned family_member record');
          }
          
          setFamily(null);
          setFamilyMembers([]);
          setConversationCompletion(null);
          return;
        }

        // Use the RPC result
        setFamily(rpcFamilyData[0] as Family);
        console.log('Family found via RPC:', rpcFamilyData[0]);
      } else {
        setFamily(familyData as Family);
        console.log('Family found via direct query:', familyData);
      }
      
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
        .eq('family_id', memberData.family_id);

      if (allMembersError) {
        console.error('Error fetching family members:', allMembersError);
        setFamilyMembers([]);
      } else {
        console.log('All family members fetched successfully:', allMembers);
        setFamilyMembers(allMembers || []);
      }
      
      // Fetch conversation completion status
      await fetchConversationCompletion(memberData.family_id);
      
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
