
export interface ShortAnswerQuestion {
  id: number;
  question: string;
  type: 'short';
}

export interface LongAnswerQuestion {
  id: number;
  question: string;
  type: 'long';
}

export type ConversationQuestion = ShortAnswerQuestion | LongAnswerQuestion;

export const shortAnswerQuestions: ShortAnswerQuestion[] = [
  {
    id: 1,
    question: "I feel comfortable being honest in our conversations.",
    type: 'short'
  },
  {
    id: 2,
    question: "We don't talk about the things that really matter.",
    type: 'short'
  },
  {
    id: 3,
    question: "I often feel misunderstood in our relationship.",
    type: 'short'
  },
  {
    id: 4,
    question: "I hold back from saying things because it's easier than explaining.",
    type: 'short'
  },
  {
    id: 5,
    question: "I sometimes feel judged when I speak honestly.",
    type: 'short'
  },
  {
    id: 6,
    question: "I'm not sure they truly understand what I'm going through.",
    type: 'short'
  },
  {
    id: 7,
    question: "I avoid certain topics because they usually lead to conflict.",
    type: 'short'
  },
  {
    id: 8,
    question: "We often talk, but don't really listen to each other.",
    type: 'short'
  },
  {
    id: 9,
    question: "Our connection feels more distant than it used to.",
    type: 'short'
  },
  {
    id: 10,
    question: "I think we both want a better relationship, but something blocks us.",
    type: 'short'
  }
];

export const longAnswerQuestions: LongAnswerQuestion[] = [
  {
    id: 11,
    question: "What do you wish they understood about you?",
    type: 'long'
  },
  {
    id: 12,
    question: "What usually gets in the way when you try to connect or talk?",
    type: 'long'
  },
  {
    id: 13,
    question: "If your relationship could improve, what would you hope for?",
    type: 'long'
  }
];

export const allQuestions: ConversationQuestion[] = [
  ...shortAnswerQuestions,
  ...longAnswerQuestions
];

export const shortAnswerOptions = [
  { value: 'agree', label: 'Agree' },
  { value: 'disagree', label: 'Disagree' },
  { value: 'neutral', label: 'Neutral' }
];
