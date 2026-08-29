import { Link } from 'react-router-dom';
import { MapPin, Building2, Calendar, Clock, Globe, Landmark, Type, ExternalLink, Mail, Phone, MapPin as MapPinIcon, ChevronRight, Share2, Briefcase } from 'lucide-react';
import { type Job, formatCleanCompany } from '../lib/supabase';
import { Badge } from './NoticeBadge';
import SaveJobButton from './SaveJobButton';

interface TextNoticeCardProps {
  job: Job;
}

export default function TextNoticeCard({ job }: TextNoticeCardProps) {
  const closing = new Date(job.closing_date);
  const isExpired = closing < new Date();
  const hasApplyUrl = job.apply_method === 'online' && job.apply_url;

  const postedDateRaw = job.posted_date || job.created_at;
  const postedDateFormatted = postedDateRaw && !isNaN(new Date(postedDateRaw).getTime())
    ? new Date(postedDateRaw).toLocaleDateString()
    : 'Recently';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
      {job.thumbnail_url && (
        <div className="aspect-[16/9] bg-slate-900 overflow-hidden relative shrink-0">
          <div 
            className="absolute inset-0 bg-cover bg-center blur-xl opacity-50 dark:opacity-40 scale-125"
            style={{ backgroundImage: `url(${job.thumbnail_url})` }}
          />
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
          <img src={job.thumbnail_url} alt={job.title} className="w-full h-full object-contain relative z-10 drop-shadow-md" />
        </div>
      )}
      <div className="p-4 md:p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {job.is_government && <Badge icon={<Landmark className="w-3 h-3" />} text="Government" color="blue" />}
          {job.is_overseas && <Badge icon={<Globe className="w-3 h-3" />} text="Overseas" color="teal" />}
          {!job.is_government && !job.is_overseas && <Badge icon={<Briefcase className="w-3 h-3" />} text="Private Sector" color="indigo" />}
        </div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg leading-snug">{job.title}</h3>
          <SaveJobButton jobId={job.id} className="shrink-0 -mt-1 -mr-1" />
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-3">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{formatCleanCompany(job.company)}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-3">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.countries?.name || (job.location && job.location.length < 30 ? job.location : 'Sri Lanka')}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Posted {postedDateFormatted}</span>
          <span className={`flex items-center gap-1 ${isExpired ? 'text-red-500' : ''}`}>
            <Clock className="w-3.5 h-3.5" /> {isExpired ? 'Closed' : `Closes ${closing.toLocaleDateString()}`}
          </span>
          {job.categories?.name && <span className="flex items-center gap-1"><Type className="w-3.5 h-3.5" /> {job.categories.name}</span>}
        </div>
        {job.description && (
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            {job.description}
          </p>
        )}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shrink-0">
            Notice <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {/* Details Button */}
          <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-xs font-bold rounded-lg transition-colors shadow-sm shrink-0">
            Details <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          {/* Sleek Share Icon Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const shareUrl = `${window.location.origin}/jobs/${job.id}`;
              const shareText = `🔍 Job Notice: ${job.title}${job.company ? ' at ' + job.company : ''}\n\nApply now via JobNews.lk:`;
              if (navigator.share) {
                navigator.share({ title: job.title, text: shareText, url: shareUrl }).catch(() => {});
              } else {
                navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard! 📋');
              }
            }}
            className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800 shrink-0 ml-auto"
            title="Share Vacancy"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
