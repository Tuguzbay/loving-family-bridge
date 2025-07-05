
import type { Family, FamilyMember, ConversationCompletion } from '@/types/profile';

export interface FamilyContextType {
  family: Family | null;
  familyMembers: FamilyMember[];
  conversationCompletion: ConversationCompletion | null;
  loading: boolean;
  createFamily: () => Promise<{ error?: string; data?: any }>;
  joinFamily: (familyCode: string) => Promise<{ error?: string; data?: any }>;
  refreshFamilyData: () => Promise<void>;
}
