import { HistorySession, Message } from '@/lib/types';
import { Calendar, Clock, BarChart3, User, Cpu, ChevronLeft, ArrowRight, Play, RotateCcw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HistoryViewProps {
  sessions: HistorySession[];
  onBack: () => void;
  onReplay: (session: HistorySession) => void;
}

export function HistoryView({ sessions, onBack, onReplay }: HistoryViewProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-slide-up pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-black pb-12 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-0.5 bg-black" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Intelligence Archives</span>
          </div>
          <h2 className="text-6xl font-black text-black tracking-tight-heading uppercase leading-[0.9]">
            Session <br/> History.
          </h2>
        </div>
        
        <button 
          onClick={onBack}
          className="px-10 py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-800 transition-all flex items-center gap-3"
        >
          <ChevronLeft size={14} />
          Back to Benchmarks
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
           <RotateCcw size={48} className="text-black" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">No historical data found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {sessions.map((session) => (
            <div 
              key={session.id}
              className="editorial-card p-10 rounded-sm hover:shadow-2xl transition-all group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Info */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="flex items-center gap-3 text-[#94A3B8] text-[10px] font-bold uppercase tracking-widest">
                    <Calendar size={12} />
                    {new Date(session.timestamp).toLocaleDateString()}
                  </div>
                  <h3 className="text-2xl font-black text-black uppercase tracking-tight-heading">{session.jobTitle}</h3>
                  <div className="pt-4 flex items-center gap-6">
                    <div className="flex flex-col">
                       <span className="text-2xl font-black text-black">{session.overallScore}</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Score</span>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="flex flex-col">
                       <span className="text-2xl font-black text-black">{session.duration}</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Duration</span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <BarChart3 size={10} /> Talk Ratio
                      </span>
                      <div className="h-1 bg-slate-100 w-full overflow-hidden">
                         <div className="h-full bg-[#6366F1]" style={{ width: `${session.talkRatio}%` }} />
                      </div>
                      <p className="text-[10px] font-bold text-black uppercase">{session.talkRatio}% Candidate</p>
                   </div>
                   <div className="space-y-3">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <Cpu size={10} /> Coverage
                      </span>
                      <div className="h-1 bg-slate-100 w-full overflow-hidden">
                         <div className="h-full bg-black" style={{ width: `${session.topicCoverage}%` }} />
                      </div>
                      <p className="text-[10px] font-bold text-black uppercase">{session.topicCoverage}% Topics</p>
                   </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-3 flex justify-end">
                   <button 
                     onClick={() => onReplay(session)}
                     className="flex items-center gap-3 px-8 py-4 border-2 border-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all group-hover:scale-105"
                   >
                     Replay Session
                     <ArrowRight size={14} />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
