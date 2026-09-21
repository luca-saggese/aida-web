export type NoulQuestion = {
  type: 'noul';
  instructions?: unknown;
  criteria?: { true?: unknown; false?: unknown };
};

export type ChoiceQuestion = {
  type: 'choice';
  instructions?: unknown;
  criteria: Record<string, unknown>;
};

export type ScoreQuestion = {
  type: 'score';
  instructions?: unknown;
  criteria: Array<unknown>;
};

export type Question = NoulQuestion | ChoiceQuestion | ScoreQuestion;

export type SystemOneRequest = {
  state: unknown;
  model: string;
  questions: Record<string, Question>;
};

export type NoulAnswer = { type: 'noul'; noul: number };
export type ChoiceAnswer = {
  type: 'choice';
  choice: string;
  probabilities: Record<string, number>;
  confidence: number;
};
export type ScoreAnswer = {
  type: 'score';
  score: number;
  legend: Record<string, unknown>;
  probabilities: Record<string, number>;
  confidence: number;
};

export type Answer = NoulAnswer | ChoiceAnswer | ScoreAnswer;

export type SystemOneResponse = {
  model: string;
  answers: Record<string, Answer>;
  usage: { input_tokens: number; output_tokens: number };
};