import { Job, SAMPLE_JOBS } from '@/lib/types';
import { Briefcase, ChevronRight } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
}

export function JobCard({ job, onSelect }: JobCardProps) {
  return (
    <div 
      onClick={() => onSelect(job)}
      className="group editorial-card p-8 rounded-sm cursor-pointer animate-slide-up"
    >
      <div className="flex flex-col h-full space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-0.5 bg-black opacity-100 group-hover:w-20 transition-all duration-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Position 0{SAMPLE_JOBS.indexOf(job) + 1}</span>
          </div>
          <h3 className="font-bold text-2xl text-black tracking-tight-heading leading-tight">{job.title}</h3>
          <p className="text-[#6B6B6B] text-sm leading-relaxed font-medium">{job.description}</p>
        </div>
        
        <div className="pt-6 border-t border-[#EDEDEB] flex flex-wrap gap-x-4 gap-y-2">
          {job.requirements.map((req) => (
            <span 
              key={req} 
              className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 group-hover:text-black transition-colors"
            >
              {req}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
