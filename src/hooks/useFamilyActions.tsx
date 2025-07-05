
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useFamilyActions = () => {
  const { user } = useAuth();

  const createFamily = async () => {
    if (!user) return { error: 'No user found' };

    console.log('=== CREATING FAMILY ===');

    try {
      // Generate family code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_family_code');

      if (codeError) {
        console.error('Error generating family code:', codeError);
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
        console.error('Error creating family:', familyError);
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
        console.error('Error adding parent to family_members:', memberError);
        return { error: memberError.message };
      }

      console.log('Family created successfully');
      return { data: familyData };
    } catch (error) {
      console.error('Error creating family:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const joinFamily = async (familyCode: string) => {
    if (!user) return { error: 'No user found' };

    console.log('=== JOINING FAMILY ===');
    console.log('Family code:', familyCode);

    try {
      // Find family by code
      const { data: familyData, error: familyError } = await supabase
        .rpc('find_family_by_code', { code_param: familyCode.trim() })
        .maybeSingle();

      if (familyError || !familyData) {
        console.error('Family not found:', familyError);
        return { error: 'Invalid family code - no family found' };
      }

      // Check if already a member
      const { data: existingMember, error: checkError } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyData.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking membership:', checkError);
        return { error: 'Error checking family membership' };
      }

      if (existingMember) {
        console.log('Already a member');
        return { data: familyData };
      }

      // Join family
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: familyData.id,
          user_id: user.id
        });

      if (memberError) {
        console.error('Error joining family:', memberError);
        return { error: 'Failed to join family: ' + memberError.message };
      }

      console.log('Successfully joined family');
      return { data: familyData };
    } catch (error) {
      console.error('Error joining family:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  return {
    createFamily,
    joinFamily
  };
};
