
import { useFamilyData } from './useFamilyData';
import { useFamilyCreation } from './useFamilyCreation';
import { useFamilyJoining } from './useFamilyJoining';

export const useFamilyOperations = () => {
  const {
    family,
    familyMembers,
    conversationCompletion,
    setFamily,
    setFamilyMembers,
    setConversationCompletion,
    fetchFamilyData,
    fetchConversationCompletion
  } = useFamilyData();

  const { createFamily } = useFamilyCreation();
  const { joinFamily: joinFamilyBase } = useFamilyJoining();

  const joinFamily = async (familyCode: string) => {
    const result = await joinFamilyBase(familyCode);
    
    // Always refresh family data after join attempt, regardless of result
    console.log('Refreshing family data after join attempt...');
    await fetchFamilyData();
    
    return result;
  };

  const createFamilyWithRefresh = async () => {
    const result = await createFamily();
    
    if (result.data) {
      // Refresh family data after successful creation
      await fetchFamilyData();
    }
    
    return result;
  };

  return {
    family,
    familyMembers,
    conversationCompletion,
    setFamily,
    setFamilyMembers,
    setConversationCompletion,
    fetchFamilyData,
    fetchConversationCompletion,
    createFamily: createFamilyWithRefresh,
    joinFamily
  };
};
