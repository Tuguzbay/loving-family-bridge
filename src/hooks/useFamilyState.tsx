
import { useState } from 'react';
import type { Family, FamilyMember, ConversationCompletion } from '@/types/profile';

export const useFamilyState = () => {
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [conversationCompletion, setConversationCompletion] = useState<ConversationCompletion | null>(null);
  const [loading, setLoading] = useState(true);

  const resetFamilyState = () => {
    setFamily(null);
    setFamilyMembers([]);
    setConversationCompletion(null);
    setLoading(false);
  };

  return {
    family,
    familyMembers,
    conversationCompletion,
    loading,
    setFamily,
    setFamilyMembers,
    setConversationCompletion,
    setLoading,
    resetFamilyState
  };
};
