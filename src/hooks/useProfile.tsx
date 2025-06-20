
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

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchFamily();
    } else {
      setProfile(null);
      setFamily(null);
      setFamilyMembers([]);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    console.log('Fetching profile for user:', user.id);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      console.log('Profile fetched:', data);
      setProfile(data);
    }
  };

  const fetchFamily = async () => {
    if (!user) return;

    console.log('Fetching family for user:', user.id);
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
      console.log('User not in any family yet');
      setLoading(false);
      return;
    }

    if (memberData?.families) {
      console.log('Family found:', memberData.families);
      setFamily(memberData.families as Family);
      
      // Fetch all family members
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
        console.log('Family members fetched:', allMembers);
        setFamilyMembers(allMembers || []);
      }
    }
    
    setLoading(false);
  };

  const createFamily = async () => {
    if (!user || !profile) {
      console.error('No user or profile found');
      return { error: 'No user or profile found' };
    }

    console.log('Creating family for user:', user.id);

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

      console.log('Parent added to family_members');

      // Refresh family data
      await fetchFamily();
      return { data: familyData };
    } catch (error) {
      console.error('Unexpected error creating family:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const joinFamily = async (familyCode: string) => {
    if (!user) return { error: 'No user found' };

    console.log('Attempting to join family with code:', familyCode);

    try {
      // Find family by code
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('family_code', familyCode)
        .single();

      if (familyError) {
        console.error('Error finding family:', familyError);
        return { error: 'Invalid family code' };
      }

      console.log('Family found:', familyData);

      // Check if user is already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyData.id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        console.log('User is already a member of this family');
        await fetchFamily();
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
        return { error: memberError.message };
      }

      console.log('Successfully joined family');
      await fetchFamily();
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
    loading,
    createFamily,
    joinFamily,
    refetch: fetchFamily
  };
};
