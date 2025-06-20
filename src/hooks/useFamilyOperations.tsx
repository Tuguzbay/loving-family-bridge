
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Family, FamilyMember, ConversationCompletion, Profile } from '@/types/profile';

export const useFamilyOperations = () => {
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
        .maybeSingle();

      if (memberError) {
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

  const createFamily = async () => {
    if (!user) {
      console.error('No user found');
      return { error: 'No user found' };
    }

    console.log('=== Creating Family ===');
    console.log('User:', user.id);

    try {
      // Generate family code using the RPC function
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_family_code');

      if (codeError) {
        console.error('Error generating family code:', codeError);
        return { error: codeError.message };
      }

      console.log('Generated family code:', codeData);

      // Create family
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .insert({
          family_code: codeData,
          parent_id: user.id
        })
        .select()
        .single();

      if (familyError) {
        console.error('Error creating family:', familyError);
        return { error: familyError.message };
      }

      console.log('Family created:', familyData);

      // Add parent to family_members
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: familyData.id,
          user_id: user.id
        });

      if (memberError) {
        console.error('Error adding parent to family_members:', memberError);
        return { error: memberError.message };
      }

      console.log('Parent added to family_members successfully');

      // Refresh family data
      await fetchFamilyData();
      return { data: familyData };
    } catch (error) {
      console.error('Unexpected error creating family:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const joinFamily = async (familyCode: string) => {
    if (!user) return { error: 'No user found' };

    console.log('=== Joining Family ===');
    console.log('Family code:', familyCode);
    console.log('User ID:', user.id);

    try {
      // Use the new RPC function to find family by code (bypasses RLS)
      const { data: familyData, error: familyError } = await supabase
        .rpc('find_family_by_code', { code_param: familyCode.trim() });

      console.log('Family lookup result:', { data: familyData, error: familyError });

      if (familyError) {
        console.error('Error finding family:', familyError);
        return { error: 'Error finding family: ' + familyError.message };
      }

      if (!familyData || familyData.length === 0) {
        console.error('No family found with code:', familyCode);
        return { error: 'Invalid family code - no family found' };
      }

      const family = familyData[0];
      console.log('Family found:', family);

      // Check if user is already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', family.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing membership:', checkError);
        return { error: 'Error checking family membership' };
      }

      if (existingMember) {
        console.log('User is already a member of this family');
        await fetchFamilyData();
        return { data: family };
      }

      // Add user to family
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: user.id
        });

      if (memberError) {
        console.error('Error adding user to family:', memberError);
        return { error: 'Failed to join family: ' + memberError.message };
      }

      console.log('Successfully joined family!');
      await fetchFamilyData();
      return { data: family };
    } catch (error) {
      console.error('Unexpected error joining family:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  return {
    family,
    familyMembers,
    conversationCompletion,
    setFamily,
    setFamilyMembers,
    setConversationCompletion,
    fetchFamilyData,
    fetchConversationCompletion,
    createFamily,
    joinFamily
  };
};
