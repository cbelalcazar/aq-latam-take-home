'use client';

import { useState } from 'react';
import { SAMPLE_JOBS, Job, Message, Evaluation } from '@/lib/types';
import { useInterviewStore } from '@/lib/store';
import { JobCard } from '@/components/JobCard';
import { InterviewRoom } from '@/components/InterviewRoom';
import { EvaluationView } from '@/components/EvaluationView';
import { Zap, ShieldCheck, Cpu } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AppState = 'selecting' | 'interviewing' | 'evaluating';

export default function Home() {
  const [state, setState] = useState<AppState>('selecting');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setState('interviewing');
  };

  const handleFinishInterview = (finalTranscript: Message[], finalEvaluation: Evaluation) => {
    setTranscript(finalTranscript);
    setEvaluation(finalEvaluation);
    setState('evaluating');
  };

  const handleRestart = () => {
    useInterviewStore.getState().reset();
    setState('selecting');
    setSelectedJob(null);
    setTranscript([]);
    setEvaluation(null);
  };

  return (
    <main className="min-h-screen bg-[#F9F9F7] text-[#000000] selection:bg-black/5 overflow-x-hidden font-sans">
      {/* Navigation / Header */}
      <header className="border-b border-[#EDEDEB] bg-[#F9F9F7]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
          <div 
            onClick={handleRestart}
            className="flex items-center gap-6 cursor-pointer group"
          >
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-[0.1em] text-black leading-none">AfterQuery</span>
              <div className="h-0.5 w-full bg-black mt-1 group-hover:h-1 transition-all" />
            </div>
            <span className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] border-l border-slate-200 pl-6">Infrastructure Intelligence</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-12 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            <span className="hover:text-black transition-colors cursor-default">Verified</span>
            <span className="hover:text-black transition-colors cursor-default">Low Latency</span>
            <span className="hover:text-black transition-colors cursor-default">Agentic</span>
          </div>
        </div>
      </header>

      <div className="py-20 px-8 max-w-7xl mx-auto">
        {state === 'selecting' && (
          <div className="space-y-20 animate-slide-up">
            <div className="max-w-4xl space-y-8">
              <h1 className="text-7xl md:text-8xl font-black text-black tracking-tight-heading leading-[0.85] uppercase">
                The AI <br/> Benchmark.
              </h1>
              <div className="h-1 w-24 bg-black" />
              <p className="text-[#6B6B6B] text-xl md:text-2xl font-medium leading-relaxed max-w-2xl text-balance">
                Bridging the gap between generalist AI and professional automation through reasoning traces.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {SAMPLE_JOBS.map((job) => (
                <JobCard key={job.id} job={job} onSelect={handleSelectJob} />
              ))}
            </div>

            {/* Scientific Footer Info */}
            <div className="pt-32 border-t border-[#EDEDEB] grid grid-cols-1 md:grid-cols-3 gap-20">
              {[
                { title: "Epistemological Research", desc: "Reducing economic friction by scaling elite expertise to near-zero marginal cost." },
                { title: "Chain-of-thought", desc: "Capturing the hidden decision architecture between textbook definitions." },
                { title: "Professional Alignment", desc: "Granular reward signals based on reasoning trajectories, not just binary outputs." }
              ].map((f, i) => (
                <div key={i} className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-black pb-4 border-b border-black/10">{f.title}</h4>
                  <p className="text-[#6B6B6B] text-sm leading-relaxed font-medium">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {state === 'interviewing' && selectedJob && (
          <div className="animate-slide-up">
            <InterviewRoom job={selectedJob} onFinish={handleFinishInterview} />
          </div>
        )}

        {state === 'evaluating' && evaluation && (
          <EvaluationView 
            transcript={transcript} 
            evaluation={evaluation} 
            onRestart={handleRestart} 
          />
        )}
      </div>

      {/* Footer Branding */}
      <footer className="mt-64 py-20 border-t border-[#EDEDEB] bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col gap-4">
            <span className="font-black text-xl tracking-[0.1em] text-black">AfterQuery</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">© 2026 Applied Research Lab</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
               <div className="w-1 h-4 bg-black/10" />
               <div className="w-1 h-4 bg-black/20" />
               <div className="w-1 h-4 bg-black/40" />
               <div className="w-1 h-4 bg-black" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black">System Nominal</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
