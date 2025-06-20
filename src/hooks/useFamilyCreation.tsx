
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useFamilyCreation = () => {
  const { user } = useAuth();

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
      return { data: familyData };
    } catch (error) {
      console.error('Unexpected error creating family:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  return { createFamily };
};
