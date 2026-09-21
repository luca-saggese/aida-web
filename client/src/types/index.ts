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

export type EvaluateResponse = {
  provider: SystemOneResponse;
  meta: {
    requestedModel: string;
    roundTripMs: number;
    providerMs?: number;
    overheadMs: number;
    runAt: string;
    spendUsd: number;
  };
};

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
}

export interface SessionOrganization {
  id: string;
  name: string;
}

export interface Session {
  user: SessionUser;
  organization: SessionOrganization | null;
}

export type ApiKeyStatus = 'active' | 'revoked';

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  last4: string;
  status: ApiKeyStatus;
  createdBy: string;
  createdAt: string;
  revokedAt: string | null;
  lastUsedAt: string | null;
}

export interface UsageSeriesPoint {
  date: string;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  spendUsd: number;
}

export interface UsageResponse {
  totals: {
    tokens: number;
    inputTokens: number;
    outputTokens: number;
    requests: number;
    spendUsd: number;
  };
  series: UsageSeriesPoint[];
}