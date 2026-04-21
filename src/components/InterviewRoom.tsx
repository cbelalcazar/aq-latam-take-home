'use client';

import { useEffect, useRef, useState } from 'react';
import { Job, Message, Evaluation } from '@/lib/types';
import { useInterviewStore } from '@/lib/store';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useAIEngine } from '@/hooks/useAIEngine';
import { Mic, MicOff, Volume2, History, CheckCircle2, Loader2, PlayCircle, Send, RotateCcw, Cpu, Video, VideoOff } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InterviewRoomProps {
  job: Job;
  onFinish: (transcript: Message[], evaluation: Evaluation) => void;
}

export function InterviewRoom({ job, onFinish }: InterviewRoomProps) {
  const { 
    state, messages, currentReasoning, capturedText, error, setCapturedText, addMessage, setError 
  } = useInterviewStore();

  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 1. Hooks especializados
  const { startListening, stopListening } = useVoiceInput();
  const { startInterview, finishInterview, fetchNextQuestion } = useAIEngine(job, onFinish);

  // Helpers derivados
  const isProcessing = state === 'INITIALIZING' || state === 'AI_THINKING' || state === 'EVALUATING';
  const isListening = state === 'CANDIDATE_LISTENING';
  const isAiSpeaking = state === 'AI_SPEAKING';
  const isReviewing = state === 'CANDIDATE_REVIEWING';
  const isEvaluating = state === 'EVALUATING';

  const handleToggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const handleToggleVideo = async () => {
    if (isVideoEnabled) {
      streamRef.current?.getTracks().forEach(track => track.stop());
      setIsVideoEnabled(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        streamRef.current = stream;
        setIsVideoEnabled(true);
      } catch (err) {
        setError("Camera access denied.");
      }
    }
  };

  // Cleanup video on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleSubmitAnswer = async () => {
    if (isProcessing || capturedText.trim().length < 2) return;
    const textToSend = capturedText;
    setCapturedText(""); 
    const newMessage: Message = {
      role: 'candidate',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };
    addMessage(newMessage);
    await fetchNextQuestion([...messages, newMessage]);
  };

  const questionCount = messages.filter(m => m.role === 'interviewer').length;
  const canFinish = questionCount >= 6;

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-slide-up pb-20 font-sans text-black px-4">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-black pb-8 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-2 h-2 rounded-full", isProcessing ? "bg-[#6366F1] animate-pulse" : "bg-black")} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">
              {state.replace('_', ' ')} Mode
            </span>
          </div>
          <h2 className="text-4xl font-black text-black tracking-tight-heading uppercase leading-none">
            {job.title}
          </h2>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Benchmarking</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div key={s} className={cn("w-6 h-1 transition-all", questionCount >= s ? "bg-black" : "bg-slate-200")} />
              ))}
            </div>
          </div>
          
          {state === 'IDLE' && messages.length === 0 ? (
            <button 
              onClick={startInterview}
              disabled={isProcessing}
              className="px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg"
            >
              Begin Session
            </button>
          ) : (
            <button 
              onClick={finishInterview}
              disabled={isEvaluating || !canFinish}
              className={cn(
                "px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2",
                canFinish 
                  ? "bg-black text-white border-black hover:bg-slate-800 pulse-signal" 
                  : "bg-transparent text-slate-300 border-slate-100 cursor-not-allowed"
              )}
            >
              {isEvaluating ? "Processing Signal..." : "Conclude Benchmark"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Interaction Column */}
        <div className="lg:col-span-8 space-y-12">
          <div className={cn(
            "aspect-[16/10] border border-[#EDEDEB] rounded-sm relative shadow-sm group overflow-hidden transition-all duration-700",
            isVideoEnabled ? "bg-black" : "bg-white p-12"
          )}>
             {/* 1. Camera Feed (Stretch Goal #3) */}
             {isVideoEnabled && (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale-[30%] blur-[2px] hover:blur-0 transition-all duration-700"
                />
             )}

             {/* 2. Visual Overlays (Always visible or adaptive) */}
             <div className={cn(
               "relative h-full flex flex-col items-center justify-between z-10 pointer-events-none",
               isVideoEnabled && "p-12 bg-gradient-to-t from-black/80 via-transparent to-black/40"
             )}>
                {/* Top: Minimalist Waveform */}
                <div className="flex items-center justify-center h-16 shrink-0">
                  <div className="flex items-end gap-1.5 h-full">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-1 rounded-full transition-all duration-300",
                          isListening ? "animate-wave bg-[#6366F1]" : isAiSpeaking ? "animate-wave bg-white" : "h-1 bg-black opacity-10",
                          isVideoEnabled && !isListening && !isAiSpeaking && "bg-white opacity-40"
                        )}
                        style={{ animationDelay: `${i * 0.1}s`, height: (isListening || isAiSpeaking) ? '100%' : '4px' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Middle: The Question */}
                <div className="flex-1 flex items-center justify-center px-8 w-full">
                  <div className="text-center space-y-4 max-w-2xl">
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-[0.3em]",
                      isVideoEnabled ? "text-white/60" : "text-slate-400"
                    )}>
                      {isListening ? "Neural Input Active" : isProcessing ? "Core Decoding" : isAiSpeaking ? "Broadcasting Question" : "Interviewer Protocol"}
                    </p>
                    <h3 className={cn(
                      "text-3xl font-bold leading-tight tracking-tight-heading transition-all duration-500",
                      capturedText ? "text-[#6366F1] italic" : isVideoEnabled ? "text-white drop-shadow-2xl" : "text-black"
                    )}>
                      {state === 'IDLE' && messages.length === 0
                        ? "Ready to initiate research protocol?" 
                        : isProcessing 
                          ? "Decoding reasoning traces..." 
                          : capturedText 
                            ? `"${capturedText}"`
                            : messages[messages.length - 1]?.role === 'interviewer' 
                              ? messages[messages.length - 1].content 
                              : "Waiting for signal..."}
                    </h3>
                  </div>
                </div>

                {/* Bottom: Dedicated Control Section (Buttons are pointer-events-auto) */}
                <div className="pt-8 h-32 flex flex-col items-center justify-center shrink-0 w-full pointer-events-auto">
                  <div className="flex items-center gap-6">
                    {/* Microphone Action */}
                    {!capturedText && !isProcessing && messages.length > 0 && (
                      <button
                        onClick={handleToggleListening}
                        className={cn(
                          "w-16 h-16 rounded-full transition-all flex items-center justify-center border-2 shadow-2xl",
                          isListening ? "bg-[#6366F1] border-[#6366F1] pulse-signal scale-110" : isVideoEnabled ? "bg-white/10 border-white/20 text-white backdrop-blur-md hover:bg-white/20" : "bg-white border-black hover:border-[#6366F1] hover:text-[#6366F1]"
                        )}
                      >
                        {isListening ? <MicOff size={24} className="text-white" /> : <Mic size={24} />}
                      </button>
                    )}

                    {/* Camera Action (Stretch Goal #3) */}
                    {!isProcessing && messages.length > 0 && (
                      <button
                        onClick={handleToggleVideo}
                        className={cn(
                          "w-16 h-16 rounded-full transition-all flex items-center justify-center border-2",
                          isVideoEnabled ? "bg-white border-white text-black" : "bg-transparent border-black/10 text-black/40 hover:border-black hover:text-black"
                        )}
                        title="Toggle Video Mode"
                      >
                        {isVideoEnabled ? <VideoOff size={24} /> : <Video size={24} />}
                      </button>
                    )}
                  </div>

                  {isReviewing && !isProcessing && (
                    <div className="flex gap-4 animate-in fade-in zoom-in duration-500">
                      <button
                        onClick={handleToggleListening}
                        className="flex items-center gap-3 px-8 py-4 bg-[#EDEDEB] hover:bg-slate-200 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-sm transition-all shadow-xl"
                      >
                        <RotateCcw size={16} />
                        Reset Input
                      </button>
                      <button
                        onClick={handleSubmitAnswer}
                        className="flex items-center gap-3 px-10 py-4 bg-black hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm transition-all shadow-xl shadow-black/20"
                      >
                        <Send size={16} />
                        Commit Answer
                      </button>
                    </div>
                  )}
                </div>
             </div>
          </div>

          {/* Minimalist History */}
          <div className="space-y-6 text-black">
             <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black shrink-0">Historical Log</span>
                <div className="h-[1px] w-full bg-[#EDEDEB]" />
             </div>
             <div className="space-y-8 opacity-80">
                {messages.slice(-3).map((m, i) => (
                  <div key={i} className="flex gap-8 group">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.2em] w-20 shrink-0 pt-1",
                      m.role === 'interviewer' ? "text-slate-400" : "text-black"
                    )}>
                      {m.role === 'interviewer' ? "PROTOCOL" : "SUBJECT"}
                    </span>
                    <p className="text-sm text-[#6B6B6B] font-medium leading-relaxed">{m.content}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Reasoning Panel Column */}
        <div className="lg:col-span-4 text-black">
          <div className="sticky top-32 space-y-12">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black shrink-0">Reasoning Core</span>
                <div className="h-[1px] w-full bg-[#EDEDEB]" />
              </div>
              
              {currentReasoning ? (
                <div className="space-y-10">
                  <div className="space-y-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Detected Signals</p>
                    <div className="flex flex-wrap gap-2">
                      {currentReasoning.skills_detected?.map(s => (
                        <span key={s} className="px-3 py-1.5 bg-black text-white text-[9px] font-bold uppercase tracking-wider rounded-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Knowledge Gaps</p>
                    <p className="text-sm text-black leading-relaxed font-serif italic text-balance leading-relaxed">"{currentReasoning.current_gap}"</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Heuristic Intent</p>
                    <div className="p-6 bg-[#EDEDEB]/50 border-l-2 border-black text-[11px] text-slate-600 leading-relaxed font-mono italic text-balance">
                      {currentReasoning.intent}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                  <Cpu size={48} className="text-black" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting Data Flow</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-8 right-8 p-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl animate-slide-up border-l-4 border-[#6366F1] z-50">
          System Alert: {error}
        </div>
      )}
    </div>
  );
}
