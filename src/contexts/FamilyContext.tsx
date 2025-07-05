
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFamilyState } from '@/hooks/useFamilyState';
import { useFamilyDataFetching } from '@/hooks/useFamilyDataFetching';
import { useFamilyActions } from '@/hooks/useFamilyActions';
import type { FamilyContextType } from './types';

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const {
    family,
    familyMembers,
    conversationCompletion,
    loading,
    setFamily,
    setFamilyMembers,
    setConversationCompletion,
    setLoading,
    resetFamilyState
  } = useFamilyState();

  const { fetchFamilyData } = useFamilyDataFetching();
  const { createFamily: createFamilyAction, joinFamily: joinFamilyAction } = useFamilyActions();

  const refreshFamilyData = async () => {
    console.log('FamilyContext: Manually refreshing family data...');
    await fetchFamilyData(setFamily, setFamilyMembers, setConversationCompletion, setLoading);
  };

  const createFamily = async () => {
    const result = await createFamilyAction();
    
    if (result.data) {
      console.log('FamilyContext: Family created, refreshing data...');
      // Immediately refresh data
      await refreshFamilyData();
    }
    
    return result;
  };

  const joinFamily = async (familyCode: string) => {
    console.log('FamilyContext: Joining family with code:', familyCode);
    const result = await joinFamilyAction(familyCode);
    
    if (result.data) {
      console.log('FamilyContext: Successfully joined family, refreshing data...');
      // Update the family state immediately with the joined family
      setFamily(result.data);
      
      // Then refresh all data
      await refreshFamilyData();
    }
    
    return result;
  };

  // Initial load when user changes
  useEffect(() => {
    if (!user) {
      resetFamilyState();
      return;
    }
    
    console.log('FamilyContext: User changed, fetching family data...');
    fetchFamilyData(setFamily, setFamilyMembers, setConversationCompletion, setLoading);
  }, [user]);

  // Add debugging to track state changes
  useEffect(() => {
    console.log('Family state updated:', {
      family: family?.family_code,
      loading,
      familyMembers: familyMembers.length,
      user: user?.id
    });
  }, [family, loading, familyMembers, user]);

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
