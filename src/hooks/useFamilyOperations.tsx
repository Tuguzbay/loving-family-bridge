
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
    
    if (result.data) {
      console.log('Join successful, refreshing family data...');
      // Force a refresh of family data
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to ensure DB consistency
      await fetchFamilyData();
    }
    
    return result;
  };

  const createFamilyWithRefresh = async () => {
    console.log('=== CREATE FAMILY OPERATION ===');
    const result = await createFamily();
    
    console.log('Create result:', result);
    
    if (result.data) {
      console.log('Create successful, refreshing family data...');
      // Force a refresh of family data
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to ensure DB consistency
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
