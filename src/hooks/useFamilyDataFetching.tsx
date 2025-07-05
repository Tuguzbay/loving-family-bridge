
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Family, FamilyMember, ConversationCompletion } from '@/types/profile';

export const useFamilyDataFetching = () => {
  const { user } = useAuth();

  const fetchFamilyData = async (
    setFamily: (family: Family | null) => void,
    setFamilyMembers: (members: FamilyMember[]) => void,
    setConversationCompletion: (completion: ConversationCompletion | null) => void,
    setLoading: (loading: boolean) => void
  ) => {
    setLoading(true);
    
    try {
      if (!user) {
        console.log('No user, clearing family data');
        setFamily(null);
        setFamilyMembers([]);
        setConversationCompletion(null);
        return;
      }

      console.log('=== FETCHING FAMILY DATA ===');

      // Check if user is a member of any family
      const { data: membershipData, error: membershipError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('Membership check:', { membershipData, membershipError });

      if (membershipError || !membershipData) {
        console.log('User is not a member of any family');
        setFamily(null);
        setFamilyMembers([]);
        setConversationCompletion(null);
        return;
      }

      const familyId = membershipData.family_id;

      // Try direct family query first
      const { data: directFamilyData, error: directFamilyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', familyId)
        .maybeSingle();

      console.log('Direct family query result:', { directFamilyData, directFamilyError });

      let familyData = directFamilyData;

      // If direct query fails due to RLS, try to get all families and filter
      if (directFamilyError || !directFamilyData) {
        console.log('Direct query failed, trying RPC fallback');
        
        // Get all families the user has access to via find_family_by_code
        const { data: allFamiliesData, error: allFamiliesError } = await supabase
          .rpc('find_family_by_code', { code_param: '' });

        console.log('RPC fallback result:', { allFamiliesData, allFamiliesError });

        if (allFamiliesData && Array.isArray(allFamiliesData) && allFamiliesData.length > 0) {
          // Find the family by matching with our membership
          familyData = allFamiliesData.find(f => f.id === familyId) || null;
        }
      }

      if (!familyData) {
        console.log('Could not find family data for ID:', familyId);
        // Clean up orphaned membership
        await supabase
          .from('family_members')
          .delete()
          .eq('user_id', user.id)
          .eq('family_id', familyId);
        
        setFamily(null);
        setFamilyMembers([]);
        setConversationCompletion(null);
        return;
      }

      console.log('Found family data:', familyData);
      setFamily(familyData);

      // Fetch family members
      const { data: membersData, error: membersError } = await supabase
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
        .eq('family_id', familyId);

      console.log('Members data:', { membersData, membersError });

      if (membersError) {
        console.error('Error fetching family members:', membersError);
        setFamilyMembers([]);
      } else {
        setFamilyMembers(membersData || []);
      }

      // Fetch conversation completion
      const { data: completionData, error: completionError } = await supabase
        .from('conversation_completions')
        .select('*')
        .eq('user_id', user.id)
        .eq('family_id', familyId)
        .maybeSingle();

      if (!completionError && completionData) {
        setConversationCompletion(completionData);
      } else {
        setConversationCompletion(null);
      }

      console.log('=== FAMILY DATA LOADED ===');
      console.log('Family:', familyData.family_code);
      console.log('Members:', membersData?.length || 0);

    } catch (error) {
      console.error('Error in fetchFamilyData:', error);
      setFamily(null);
      setFamilyMembers([]);
      setConversationCompletion(null);
    } finally {
      setLoading(false);
    }
  };

  return { fetchFamilyData };
};
