import { Heart } from 'lucide-react';
import { useSavedJobs } from '../hooks/useSavedJobs';

interface SaveJobButtonProps {
  jobId: string;
  className?: string;
}

export default function SaveJobButton({ jobId, className = '' }: SaveJobButtonProps) {
  const { isSaved, toggleSavedJob } = useSavedJobs();
  const saved = isSaved(jobId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSavedJob(jobId);
      }}
      className={`p-2 rounded-full transition-all active:scale-95 ${
        saved
          ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400'
          : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700'
      } ${className}`}
      title={saved ? 'Remove from saved jobs' : 'Save this job'}
    >
      <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
    </button>
  );
}
