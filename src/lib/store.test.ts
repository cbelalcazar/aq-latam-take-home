import { describe, it, expect, beforeEach } from 'vitest';
import { useInterviewStore } from './store';
import { Message } from './types';

describe('InterviewStore', () => {
  beforeEach(() => {
    useInterviewStore.getState().reset();
  });

  it('should initialize with IDLE state and empty messages', () => {
    const state = useInterviewStore.getState();
    expect(state.state).toBe('IDLE');
    expect(state.messages).toHaveLength(0);
  });

  it('should add messages correctly', () => {
    const newMessage: Message = {
      role: 'candidate',
      content: 'Hello World',
      timestamp: new Date().toISOString()
    };

    useInterviewStore.getState().addMessage(newMessage);
    
    const messages = useInterviewStore.getState().messages;
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe('Hello World');
  });

  it('should reset to initial state', () => {
    useInterviewStore.getState().setState('AI_THINKING');
    useInterviewStore.getState().addMessage({
      role: 'interviewer',
      content: 'Question',
      timestamp: '...'
    });

    useInterviewStore.getState().reset();

    const state = useInterviewStore.getState();
    expect(state.state).toBe('IDLE');
    expect(state.messages).toHaveLength(0);
  });
});
