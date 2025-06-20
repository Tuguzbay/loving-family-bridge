
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useFamilyJoining = () => {
  const { user } = useAuth();

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
      return { data: family };
    } catch (error) {
      console.error('Unexpected error joining family:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  return { joinFamily };
};
