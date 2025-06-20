import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  full_name: string;
  user_type: 'parent' | 'child';
  age?: number;
  created_at: string;
  updated_at: string;
}

interface Family {
  id: string;
  family_code: string;
  parent_id: string;
  created_at: string;
}

interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  joined_at: string;
  profiles: Profile;
}

interface ConversationCompletion {
  id: string;
  user_id: string;
  family_id: string;
  completed_at: string;
  total_questions: number;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [conversationCompletion, setConversationCompletion] = useState<ConversationCompletion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log('User logged in, starting profile fetch for:', user.id);
      console.log('User metadata:', user.user_metadata);
      fetchProfile();
    } else {
      console.log('No user, resetting state');
      setProfile(null);
      setFamily(null);
      setFamilyMembers([]);
      setConversationCompletion(null);
      setLoading(false);
    }
  }, [user]);

  // Handle family operations after profile is loaded
  useEffect(() => {
    if (user && profile) {
      console.log('Profile loaded, starting family operations for:', profile.user_type);
      handleFamilyOperations();
    }
  }, [user, profile]);

  const fetchProfile = async () => {
    if (!user) return;
    
    console.log('Fetching profile for user:', user.id);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
      return;
    }

    if (!data) {
      console.log('No profile found, creating one from user metadata');
      await createProfileFromMetadata();
      return;
    }

    console.log('Profile fetched successfully:', data);
    setProfile(data);
  };

  const createProfileFromMetadata = async () => {
    if (!user) return;

    console.log('Creating profile from user metadata:', user.user_metadata);
    
    const profileData = {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email || 'User',
      user_type: (user.user_metadata?.user_type as 'parent' | 'child') || 'parent',
      age: user.user_metadata?.age ? parseInt(user.user_metadata.age) : null,
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      setLoading(false);
      return;
    }

    console.log('Profile created successfully:', data);
    setProfile(data);
  };

  const handleFamilyOperations = async () => {
    if (!user || !profile) return;

    console.log('=== FAMILY OPERATIONS START ===');
    console.log('User type:', profile.user_type);
    console.log('User ID:', user.id);
    console.log('User metadata:', user.user_metadata);

    try {
      if (profile.user_type === 'child') {
        await handleChildFamilySetup();
      } else if (profile.user_type === 'parent') {
        await handleParentFamilySetup();
      }
    } catch (error) {
      console.error('Error in family operations:', error);
      setLoading(false);
    }
  };

  const handleChildFamilySetup = async () => {
    if (!user) return;

    console.log('--- Child Family Setup ---');
    
    // Check if child is already in a family
    const { data: existingMember, error: memberError } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError) {
      console.error('Error checking existing membership:', memberError);
      setLoading(false);
      return;
    }

    if (existingMember) {
      console.log('Child is already a family member:', existingMember);
      await fetchFamilyData();
      return;
    }

    // Child is not in a family, try to join using family code from metadata
    const familyCode = user.user_metadata?.family_code;
    console.log('Family code from metadata:', familyCode);

    if (familyCode) {
      console.log('Attempting to join family with code:', familyCode);
      const result = await joinFamily(familyCode);
      if (result.error) {
        console.error('Failed to join family:', result.error);
        setLoading(false);
      }
      // If successful, joinFamily will call fetchFamilyData
    } else {
      console.log('No family code found in metadata');
      setLoading(false);
    }
  };

  const handleParentFamilySetup = async () => {
    console.log('--- Parent Family Setup ---');
    await fetchFamilyData();
  };

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
        setLoading(false);
        return;
      }

      if (!memberData || !memberData.families) {
        console.log('User is not a member of any family');
        setLoading(false);
        return;
      }

      console.log('Family found:', memberData.families);
      setFamily(memberData.families as Family);
      
      // Fetch all family members with profiles
      const { data: allMembers, error: allMembersError } = await supabase
        .from('family_members')
        .select(`
          *,
          profiles (*)
        `)
        .eq('family_id', memberData.families.id);

      if (allMembersError) {
        console.error('Error fetching family members:', allMembersError);
      } else {
        console.log('All family members fetched successfully:', allMembers);
        setFamilyMembers(allMembers || []);
      }
      
      // Fetch conversation completion status
      await fetchConversationCompletion(memberData.families.id);
      
      setLoading(false);
      
    } catch (error) {
      console.error('Unexpected error in fetchFamilyData:', error);
      setLoading(false);
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
    if (!user || !profile) {
      console.error('No user or profile found');
      return { error: 'No user or profile found' };
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
      // Find family by code
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('family_code', familyCode)
        .maybeSingle();

      if (familyError) {
        console.error('Error finding family:', familyError);
        return { error: 'Error finding family: ' + familyError.message };
      }

      if (!familyData) {
        console.error('No family found with code:', familyCode);
        return { error: 'Invalid family code' };
      }

      console.log('Family found:', familyData);

      // Check if user is already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyData.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing membership:', checkError);
        return { error: 'Error checking family membership' };
      }

      if (existingMember) {
        console.log('User is already a member of this family');
        await fetchFamilyData();
        return { data: familyData };
      }

      // Add user to family
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: familyData.id,
          user_id: user.id
        });

      if (memberError) {
        console.error('Error adding user to family:', memberError);
        return { error: 'Failed to join family: ' + memberError.message };
      }

      console.log('Successfully joined family!');
      await fetchFamilyData();
      return { data: familyData };
    } catch (error) {
      console.error('Unexpected error joining family:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  return {
    profile,
    family,
    familyMembers,
    conversationCompletion,
    loading,
    createFamily,
    joinFamily,
    refetch: fetchFamilyData
  };
};
