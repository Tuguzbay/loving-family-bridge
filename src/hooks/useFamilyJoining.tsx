
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useFamilyJoining = () => {
  const { user } = useAuth();

  const joinFamily = async (familyCode: string) => {
    if (!user) return { error: 'No user found' };

    console.log('=== JOINING FAMILY ===');
    console.log('Family code:', familyCode);
    console.log('User ID:', user.id);

    try {
      // Step 1: Find family by code
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('family_code', familyCode.trim())
        .maybeSingle();

      console.log('Family lookup result:', { familyData, familyError });

      if (familyError) {
        console.error('Error finding family:', familyError);
        return { error: 'Error finding family: ' + familyError.message };
      }

      if (!familyData) {
        console.error('No family found with code:', familyCode);
        return { error: 'Invalid family code - no family found' };
      }

      console.log('Family found:', familyData);

      // Step 2: Check if user is already a member
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
        return { data: familyData };
      }

      // Step 3: Add user to family
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
      return { data: familyData };
    } catch (error) {
      console.error('Unexpected error joining family:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  return { joinFamily };
};
