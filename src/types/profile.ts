
export interface Profile {
  id: string;
  full_name: string;
  user_type: 'parent' | 'child';
  age?: number;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  family_code: string;
  parent_id: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  joined_at: string;
  profiles: Profile;
}

export interface ConversationCompletion {
  id: string;
  user_id: string;
  family_id: string;
  completed_at: string;
  total_questions: number;
}

export interface ParentChildAssessment {
  id: string;
  family_id: string;
  parent_id: string;
  child_id: string;
  parent_responses: {
    short: string[];
    long: string[];
  };
  child_responses: {
    short: string[];
    long: string[];
  };
  ai_analysis?: {
    analysis: string;
  };
  created_at: string;
  updated_at: string;
}
