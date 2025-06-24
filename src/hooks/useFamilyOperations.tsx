
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
    console.log('=== JOIN FAMILY OPERATION ===');
    const result = await joinFamilyBase(familyCode);
    
    console.log('Join result:', result);
    
    // Always refresh family data after join attempt
    console.log('Refreshing family data...');
    await fetchFamilyData();
    
    return result;
  };

  const createFamilyWithRefresh = async () => {
    console.log('=== CREATE FAMILY OPERATION ===');
    const result = await createFamily();
    
    console.log('Create result:', result);
    
    if (result.data) {
      console.log('Refreshing family data after creation...');
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
