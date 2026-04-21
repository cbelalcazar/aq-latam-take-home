import { Message, Evaluation } from '@/lib/types';
import { Award, AlertCircle, MessageSquare, Download, ChevronRight, TrendingUp } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EvaluationViewProps {
  transcript: Message[];
  evaluation: Evaluation;
  onRestart: () => void;
}

export function EvaluationView({ transcript, evaluation, onRestart }: EvaluationViewProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-24 animate-slide-up pb-32">
      {/* Header / Executive Summary */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-16 border-b-2 border-black pb-12">
        <div className="flex-1 space-y-8">
          <div className="flex items-center gap-3">
             <div className="w-12 h-0.5 bg-black" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Post-Session Evaluation</span>
          </div>
          <h2 className="text-6xl font-black text-black tracking-tight-heading uppercase leading-[0.9]">
            Benchmark <br/> Analysis.
          </h2>
          <p className="text-xl text-[#6B6B6B] font-medium leading-relaxed max-w-xl text-balance">
            {evaluation.summary}
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-8 shrink-0">
          <div className="relative group">
             <div className="absolute -inset-4 bg-black/5 rounded-full blur-xl group-hover:bg-black/10 transition-all" />
             <div className="relative w-48 h-48 flex flex-col items-center justify-center border-4 border-black rounded-full bg-white shadow-2xl">
                <span className="text-6xl font-black text-black tracking-tighter">{evaluation.overallScore}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Aggregate</span>
             </div>
          </div>
          <button 
            onClick={onRestart}
            className="w-full px-10 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3"
          >
            Start New Benchmark
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Core Strengths */}
        <div className="md:col-span-7 bg-white border border-[#EDEDEB] p-10 rounded-sm space-y-8 shadow-sm">
          <div className="flex items-center gap-4">
             <TrendingUp className="text-black" size={20} />
             <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black">Primary Strengths</h3>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {evaluation.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-6 group">
                <span className="text-xs font-black text-black border-b border-black pb-1">0{i+1}</span>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Areas */}
        <div className="md:col-span-5 bg-[#EDEDEB]/30 border border-[#EDEDEB] p-10 rounded-sm space-y-8">
          <div className="flex items-center gap-4">
             <AlertCircle className="text-black" size={20} />
             <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-black">Areas for Calibration</h3>
          </div>
          <ul className="space-y-6">
            {evaluation.concerns.map((c, i) => (
              <li key={i} className="text-sm text-slate-500 font-medium leading-relaxed italic border-l-2 border-black/10 pl-6">
                "{c}"
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="border-t-2 border-black pt-8 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Technical Proficiency</span>
            <div className="flex items-end justify-between">
               <span className="text-4xl font-black text-black tracking-tighter">{evaluation.technicalProficiency}%</span>
               <div className="flex-1 mx-8 h-1 bg-slate-100 mb-2">
                  <div className="h-full bg-black transition-all duration-1000" style={{ width: `${evaluation.technicalProficiency}%` }} />
               </div>
            </div>
         </div>
         <div className="border-t-2 border-black pt-8 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Communication Signal</span>
            <div className="flex items-end justify-between">
               <span className="text-4xl font-black text-black tracking-tighter">{evaluation.communicationSkills}%</span>
               <div className="flex-1 mx-8 h-1 bg-slate-100 mb-2">
                  <div className="h-full bg-black transition-all duration-1000" style={{ width: `${evaluation.communicationSkills}%` }} />
               </div>
            </div>
         </div>
      </div>

      {/* Transcript Log */}
      <div className="space-y-12 pt-12">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black shrink-0">Historical Raw Data</span>
          <div className="h-[1px] w-full bg-[#EDEDEB]" />
        </div>

        <div className="space-y-4 bg-white border border-[#EDEDEB] rounded-sm divide-y divide-[#EDEDEB]">
          {transcript.map((m, i) => (
            <div key={i} className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8 hover:bg-[#F9F9F7] transition-colors">
              <div className="md:col-span-2">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.3em]",
                  m.role === 'interviewer' ? "text-slate-400" : "text-black underline decoration-2 underline-offset-4"
                )}>
                  {m.role === 'interviewer' ? "Protocol" : "Subject"}
                </span>
              </div>
              <div className="md:col-span-10">
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{m.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-12">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
          Generated by AfterQuery Intelligence Core
        </p>
      </div>
    </div>
  );
}
