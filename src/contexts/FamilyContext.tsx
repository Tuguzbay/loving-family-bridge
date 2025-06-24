
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Family, FamilyMember, ConversationCompletion } from '@/types/profile';

interface FamilyContextType {
  family: Family | null;
  familyMembers: FamilyMember[];
  conversationCompletion: ConversationCompletion | null;
  loading: boolean;
  createFamily: () => Promise<{ error?: string; data?: any }>;
  joinFamily: (familyCode: string) => Promise<{ error?: string; data?: any }>;
  refreshFamilyData: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [conversationCompletion, setConversationCompletion] = useState<ConversationCompletion | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFamilyData = async () => {
    if (!user) {
      console.log('No user, clearing family data');
      setFamily(null);
      setFamilyMembers([]);
      setConversationCompletion(null);
      setLoading(false);
      return;
    }

    console.log('=== FETCHING FAMILY DATA ===');
    setLoading(true);

    try {
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
        setLoading(false);
        return;
      }

      const familyId = membershipData.family_id;

      // Fetch family using RPC to bypass RLS
      const { data: familyData, error: familyError } = await supabase
        .rpc('find_family_by_code', { code_param: '' })
        .eq('id', familyId)
        .maybeSingle();

      console.log('Family data:', { familyData, familyError });

      if (familyError || !familyData) {
        console.error('Could not fetch family data');
        setFamily(null);
        setFamilyMembers([]);
        setConversationCompletion(null);
        setLoading(false);
        return;
      }

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
      
      // Immediately refresh data
      await fetchFamilyData();
      
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
        await fetchFamilyData();
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
      
      // Immediately refresh data
      await fetchFamilyData();
      
      return { data: familyData };
    } catch (error) {
      console.error('Error joining family:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const refreshFamilyData = async () => {
    console.log('Manually refreshing family data...');
    await fetchFamilyData();
  };

  // Initial load when user changes
  useEffect(() => {
    fetchFamilyData();
  }, [user]);

  return (
    <FamilyContext.Provider value={{
      family,
      familyMembers,
      conversationCompletion,
      loading,
      createFamily,
      joinFamily,
      refreshFamilyData
    }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};
