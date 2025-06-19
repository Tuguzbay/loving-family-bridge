
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
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
  };

  const fetchFamily = async () => {
    if (!user) return;

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
        setFamilyMembers(allMembers || []);
      }
    }
    
    setLoading(false);
  };

  const createFamily = async () => {
    if (!user || !profile) return { error: 'No user or profile found' };

    // Generate family code
    const { data: codeData, error: codeError } = await supabase
      .rpc('generate_family_code');

    if (codeError) {
      return { error: codeError.message };
    }

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
      return { error: familyError.message };
    }

    // Add parent to family_members
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: familyData.id,
        user_id: user.id
      });

    if (memberError) {
      return { error: memberError.message };
    }

    await fetchFamily();
    return { data: familyData };
  };

  const joinFamily = async (familyCode: string) => {
    if (!user) return { error: 'No user found' };

    // Find family by code
    const { data: familyData, error: familyError } = await supabase
      .from('families')
      .select('*')
      .eq('family_code', familyCode)
      .single();

    if (familyError) {
      return { error: 'Invalid family code' };
    }

    // Add user to family
    const { error: memberError } = await supabase
      .from('family_members')
      .insert({
        family_id: familyData.id,
        user_id: user.id
      });

    if (memberError) {
      return { error: memberError.message };
    }

    await fetchFamily();
    return { data: familyData };
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
