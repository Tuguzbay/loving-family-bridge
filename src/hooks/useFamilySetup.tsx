
import { useAuth } from './useAuth';
import type { Profile } from '@/types/profile';

interface UseFamilySetupProps {
  profile: Profile | null;
  fetchFamilyData: () => Promise<void>;
  joinFamily: (familyCode: string) => Promise<{ error?: string; data?: any }>;
}

export const useFamilySetup = ({ profile, fetchFamilyData, joinFamily }: UseFamilySetupProps) => {
  const { user } = useAuth();

  const handleFamilyOperations = async () => {
    if (!user || !profile) return;

    console.log('=== FAMILY SETUP OPERATIONS ===');
    console.log('User type:', profile.user_type);
    console.log('User ID:', user.id);

    try {
      if (profile.user_type === 'child') {
        await handleChildFamilySetup();
      } else {
        // For parents, just fetch existing family data
        await fetchFamilyData();
      }
    } catch (error) {
      console.error('Error in family operations:', error);
    }
  };

  const handleChildFamilySetup = async () => {
    if (!user) return;

    console.log('--- Child Family Setup ---');
    
    // Try to join family using code from metadata
    const familyCode = user.user_metadata?.family_code;
    console.log('Family code from metadata:', familyCode);

    if (familyCode) {
      console.log('Attempting to join family with code:', familyCode);
      const result = await joinFamily(familyCode);
      if (result.error) {
        console.error('Failed to join family:', result.error);
      } else {
        console.log('Successfully joined family');
      }
    } else {
      console.log('No family code in metadata, just fetching existing data');
      await fetchFamilyData();
    }
  };

  return {
    handleFamilyOperations
  };
};
