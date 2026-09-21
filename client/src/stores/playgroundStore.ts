import { create } from 'zustand';
import type { Question, EvaluateResponse } from '../types';

export type ValidationIssue = {
  questionKey: string;
  message: string;
  path?: string;
};

const DEFAULT_STATE_VALUE: Record<string, unknown> = {
  example_state: 'Add context for GoTraxx to evaluate',
};

const DEFAULT_QUESTIONS_VALUE: Record<string, Question> = {};

function serialize(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export interface PlaygroundState {
  stateText: string;
  stateValue: unknown;
  lastValidState: unknown;

  questionsText: string;
  questionsValue: Record<string, Question>;
  lastValidQuestions: Record<string, Question>;

  requestView: 'structured' | 'json';
  responseView: 'structured' | 'json';

  workspaceLayout: 'default' | 'alternate';

  selectedModels: string[];

  validationIssues: ValidationIssue[];

  runStatus: 'idle' | 'running' | 'success' | 'error';
  response: EvaluateResponse | null;
  runError: string | null;

  examplesOpen: boolean;
  expandedAnswerIds: Set<string>;

  // actions
  setStateText: (text: string) => void;
  setStateValue: (value: unknown) => void;
  setQuestionsText: (text: string) => void;
  setQuestionsValue: (value: Record<string, Question>) => void;
  setRequestView: (v: 'structured' | 'json') => void;
  setResponseView: (v: 'structured' | 'json') => void;
  setWorkspaceLayout: (v: 'default' | 'alternate') => void;
  setSelectedModels: (models: string[]) => void;
  setValidationIssues: (issues: ValidationIssue[]) => void;
  setRunning: () => void;
  setResponse: (r: EvaluateResponse | null) => void;
  setRunError: (e: string | null) => void;
  setExamplesOpen: (v: boolean) => void;
  toggleExpanded: (id: string) => void;
  clearAll: () => void;
  loadPreset: (state: unknown, questions: Record<string, Question>) => void;
  addQuestion: (key: string, q: Question) => void;
  removeQuestion: (key: string) => void;
}

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
  stateText: serialize(DEFAULT_STATE_VALUE),
  stateValue: DEFAULT_STATE_VALUE,
  lastValidState: DEFAULT_STATE_VALUE,

  questionsText: '{}',
  questionsValue: DEFAULT_QUESTIONS_VALUE,
  lastValidQuestions: DEFAULT_QUESTIONS_VALUE,

  requestView: 'structured',
  responseView: 'structured',

  workspaceLayout: 'default',

  selectedModels: ['aida-latest'],

  validationIssues: [],

  runStatus: 'idle',
  response: null,
  runError: null,

  examplesOpen: true,
  expandedAnswerIds: new Set<string>(),

  setStateText(text) {
    let value: unknown = get().stateValue;
    try {
      value = JSON.parse(text);
      set({ stateText: text, stateValue: value, lastValidState: value });
    } catch {
      set({ stateText: text });
    }
  },

  setStateValue(value) {
    set({ stateValue: value, lastValidState: value, stateText: serialize(value) });
  },

  setQuestionsText(text) {
    let questions: Record<string, Question> = get().questionsValue;
    try {
      questions = JSON.parse(text) as Record<string, Question>;
      set({ questionsText: text, questionsValue: questions, lastValidQuestions: questions });
    } catch {
      set({ questionsText: text });
    }
  },

  setQuestionsValue(value) {
    set({ questionsValue: value, lastValidQuestions: value, questionsText: serialize(value) });
  },

  setRequestView(v) {
    set({ requestView: v });
  },

  setResponseView(v) {
    set({ responseView: v });
  },

  setWorkspaceLayout(v) {
    set({ workspaceLayout: v });
  },

  setSelectedModels(models) {
    set({ selectedModels: models });
  },

  setValidationIssues(issues) {
    set({ validationIssues: issues });
  },

  setRunning() {
    set({ runStatus: 'running', runError: null });
  },

  setResponse(r) {
    set({ response: r, runStatus: r ? 'success' : 'idle', runError: null });
  },

  setRunError(e) {
    set({ runError: e, runStatus: 'error' });
  },

  setExamplesOpen(v) {
    set({ examplesOpen: v });
  },

  toggleExpanded(id) {
    const next = new Set(get().expandedAnswerIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ expandedAnswerIds: next });
  },

  clearAll() {
    set({
      stateText: serialize(DEFAULT_STATE_VALUE),
      stateValue: DEFAULT_STATE_VALUE,
      lastValidState: DEFAULT_STATE_VALUE,
      questionsText: '{}',
      questionsValue: {},
      lastValidQuestions: {},
      validationIssues: [],
      runStatus: 'idle',
      response: null,
      runError: null,
      expandedAnswerIds: new Set(),
    });
  },

  loadPreset(state, questions) {
    set({
      stateValue: state,
      lastValidState: state,
      stateText: serialize(state),
      questionsValue: questions,
      lastValidQuestions: questions,
      questionsText: serialize(questions),
      runStatus: 'idle',
      response: null,
      runError: null,
      expandedAnswerIds: new Set(),
      validationIssues: [],
    });
  },

  addQuestion(key, q) {
    const questions = { ...get().questionsValue, [key]: q };
    set({ questionsValue: questions, lastValidQuestions: questions, questionsText: serialize(questions) });
  },

  removeQuestion(key) {
    const questions = { ...get().questionsValue };
    delete questions[key];
    set({ questionsValue: questions, lastValidQuestions: questions, questionsText: serialize(questions) });
  },
}));