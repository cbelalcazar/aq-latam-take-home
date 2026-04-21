import { useRef, useEffect } from 'react';
import { useInterviewStore } from '@/lib/store';
import { Job, Message, Evaluation } from '@/lib/types';

export function useAIEngine(job: Job, onFinish: (transcript: Message[], evaluation: Evaluation) => void) {
  const { 
    state, messages, setState, setError, setReasoning, addMessage 
  } = useInterviewStore();

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => synthRef.current?.cancel();
  }, []);

  const speak = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setState('IDLE');
      setTimeout(() => synthRef.current?.speak(utterance), 500);
    } else {
      setState('IDLE');
    }
  };

  const fetchNextQuestion = async (history: Message[]) => {
    const currentQuestionCount = history.filter(m => m.role === 'interviewer').length;
    if (currentQuestionCount >= 6 || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setState('AI_THINKING');
    setError(null);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, jobTitle: job.title, jobDescription: job.description }),
      });
      
      const data = await res.json();
      const aiMessage: Message = {
        role: 'interviewer',
        content: data.question,
        timestamp: new Date().toISOString(),
        reasoningTrace: data.reasoningTrace,
      };

      addMessage(aiMessage);
      setReasoning(data.reasoningTrace);
      setState('AI_SPEAKING');
      speak(data.question);
    } catch (err: any) {
      setError(err.message);
      setState('IDLE');
    } finally {
      isFetchingRef.current = false;
    }
  };

  const startInterview = async () => {
    setState('INITIALIZING');
    await fetchNextQuestion([]);
  };

  const finishInterview = async () => {
    setState('EVALUATING');
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: messages, jobTitle: job.title }),
      });
      const evaluation = await res.json();
      onFinish(messages, evaluation);
      setState('COMPLETED');
    } catch (err: any) {
      setError(err.message);
      setState('IDLE');
    }
  };

  return { startInterview, finishInterview, fetchNextQuestion };
}
