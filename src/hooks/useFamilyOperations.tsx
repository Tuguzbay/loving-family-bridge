
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
    
    if (result.data) {
      // Force a longer delay to ensure database consistency before fetching
      setTimeout(async () => {
        console.log('Refetching family data after successful join...');
        await fetchFamilyData();
      }, 2000);
    }
    
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
