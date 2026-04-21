import { useEffect, useRef, useCallback } from 'react';
import { useInterviewStore } from '@/lib/store';

export function useVoiceInput() {
  const { 
    setState, setCapturedText, setError 
  } = useInterviewStore();

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Already stopped
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Use continuous to avoid early cut-offs by browser
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            finalTranscript += event.results[i][0].transcript;
          }
          
          if (finalTranscript) {
            setCapturedText(finalTranscript);
          }

          // Manual silence detection (more reliable)
          silenceTimerRef.current = setTimeout(() => {
            const currentState = useInterviewStore.getState().state;
            if (currentState === 'CANDIDATE_LISTENING') {
              stopRecognition();
              setState('CANDIDATE_REVIEWING');
            }
          }, 2000); // 2 seconds of silence
        };

        recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            console.error("Speech Recognition Error:", event.error);
            setError(`Microphone error: ${event.error}`);
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      stopRecognition();
    };
  }, [setCapturedText, setError, setState, stopRecognition]);

  const startListening = () => {
    setCapturedText("");
    setError(null);
    setState('CANDIDATE_LISTENING');
    try {
      recognitionRef.current?.start();
    } catch (e) {
      // Re-initialize if it crashed
      console.warn("Recognition start failed, re-initializing...");
    }
  };

  const stopListening = () => {
    stopRecognition();
    setState('CANDIDATE_REVIEWING');
  };

  return { startListening, stopListening };
}
