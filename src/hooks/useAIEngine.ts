import { useRef, useEffect } from 'react';
import { useInterviewStore } from '@/lib/store';
import { Job, Message, Evaluation } from '@/lib/types';

export function useAIEngine(job: Job, onFinish: (transcript: Message[], evaluation: Evaluation) => void) {
  const { 
    messages, setState, setError, setReasoning, addMessage 
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
    if (!text) {
      setState('IDLE');
      return;
    }
    
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      
      const finalize = () => {
        if (useInterviewStore.getState().state === 'AI_SPEAKING') {
          setState('IDLE');
        }
      };

      utterance.onend = finalize;
      utterance.onerror = finalize;
      
      // Safety net: Force IDLE state after text length * factor (roughly)
      const estimatedDuration = (text.length * 100) + 2000;
      setTimeout(finalize, estimatedDuration);

      setTimeout(() => {
        synthRef.current?.speak(utterance);
      }, 500);
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
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Signal lost with AI core');
      }

      const data = await res.json();
      
      if (!data.question) {
        throw new Error('Incomplete data received from AI');
      }

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
      console.error("AI Engine Error:", err);
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
    setError(null);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: messages, jobTitle: job.title }),
      });

      if (!res.ok) throw new Error('Evaluation signal failed');

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
