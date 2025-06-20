
import { useAuth } from './useAuth';
import type { Profile } from '@/types/profile';
import { supabase } from '@/integrations/supabase/client';

interface UseFamilySetupProps {
  profile: Profile | null;
  fetchFamilyData: () => Promise<void>;
  joinFamily: (familyCode: string) => Promise<{ error?: string; data?: any }>;
}

export const useFamilySetup = ({ profile, fetchFamilyData, joinFamily }: UseFamilySetupProps) => {
  const { user } = useAuth();

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
      }
      // If successful, joinFamily will call fetchFamilyData
    } else {
      console.log('No family code found in metadata');
    }
  };

  const handleParentFamilySetup = async () => {
    console.log('--- Parent Family Setup ---');
    await fetchFamilyData();
  };

  return {
    handleFamilyOperations
  };
};
