import { create } from 'zustand';
import { Message, Evaluation } from './types';

export type InterviewState = 
  | 'IDLE' 
  | 'INITIALIZING' 
  | 'AI_THINKING' 
  | 'AI_SPEAKING' 
  | 'CANDIDATE_LISTENING' 
  | 'CANDIDATE_REVIEWING' 
  | 'EVALUATING' 
  | 'COMPLETED';

interface InterviewStore {
  state: InterviewState;
  messages: Message[];
  currentReasoning: Message['reasoningTrace'] | null;
  capturedText: string;
  error: string | null;
  
  // Actions
  setState: (state: InterviewState) => void;
  setCapturedText: (text: string) => void;
  setError: (error: string | null) => void;
  addMessage: (message: Message) => void;
  setReasoning: (reasoning: Message['reasoningTrace']) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewStore>((set) => ({
  state: 'IDLE',
  messages: [],
  currentReasoning: null,
  capturedText: "",
  error: null,

  setState: (state) => {
    console.log(`[FSM Transition] -> ${state}`);
    set({ state });
  },
  setCapturedText: (capturedText) => set({ capturedText }),
  setError: (error) => {
    if (error) console.error(`[System Error] ${error}`);
    set({ error });
  },
  setReasoning: (currentReasoning) => set({ currentReasoning }),
  addMessage: (message) => {
    console.log(`[Message Log] ${message.role.toUpperCase()}: ${message.content.substring(0, 30)}...`);
    set((s) => ({ messages: [...s.messages, message] }));
  },
  
  reset: () => {
    console.log(`[Store Reset] Clearing all data`);
    set({
      state: 'IDLE',
      messages: [],
      currentReasoning: null,
      capturedText: "",
      error: null,
    });
  },
}));
