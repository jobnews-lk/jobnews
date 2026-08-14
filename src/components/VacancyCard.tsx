import { Link } from 'react-router-dom';
import { MapPin, Building2, Calendar, FileText, ImageIcon, Type, Clock, Globe, Landmark, ChevronRight, FileDown, Share2 } from 'lucide-react';
import type { Job } from '../lib/supabase';

interface VacancyCardProps {
  job: Job;
}

export default function VacancyCard({ job }: VacancyCardProps) {
  const closing = new Date(job.closing_date);
  const isExpired = closing < new Date();
  const daysLeft = Math.ceil((closing.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const getThumbnail = () => {
    if (job.thumbnail_url) return job.thumbnail_url;
    if (job.job_images && job.job_images.length > 0) return job.job_images[0].url;
    return null;
  };

  const thumbnail = getThumbnail();

  const getPostTypeBadge = () => {
    if (job.post_type === 'image') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <ImageIcon className="w-3 h-3" /> Image
        </span>
      );
    }
    if (job.post_type === 'pdf') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
          <FileText className="w-3 h-3" /> PDF
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
        <Type className="w-3 h-3" /> Text
      </span>
    );
  };

  return (
    <Link to={`/jobs/${job.id}`} className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Thumbnail */}
      {thumbnail ? (
        <div className="aspect-[16/9] bg-slate-900 overflow-hidden relative shrink-0">
          {/* Blurred Background to letterbox banners naturally without cropping */}
          <div 
            className="absolute inset-0 bg-cover bg-center blur-xl opacity-50 dark:opacity-40 scale-125"
            style={{ backgroundImage: `url(${thumbnail})` }}
          />
          <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
          <img 
            src={thumbnail} 
            alt={job.title} 
            className="w-full h-full object-contain relative z-10 drop-shadow-md group-hover:scale-105 transition-transform duration-500" 
          />
          {job.post_type === 'image' && job.job_images && job.job_images.length > 1 && (
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1 text-xs font-medium text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-full">
              <ImageIcon className="w-3 h-3" /> {job.job_images.length}
            </div>
          )}
          {job.official_pdf_url && (
            <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 text-xs font-medium text-white bg-red-500/90 backdrop-blur-md px-2 py-1 rounded-full">
              <FileDown className="w-3 h-3" /> PDF
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center relative">
          {job.post_type === 'image' ? (
            <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          ) : job.post_type === 'pdf' ? (
            <FileText className="w-12 h-12 text-red-300 dark:text-red-900/50" />
          ) : (
            <Type className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          )}
          {job.post_type === 'pdf' && (
            <div className="absolute bottom-2 left-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                <FileText className="w-3 h-3" /> PDF Notice
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        {/* Flags */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {job.is_government && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              <Landmark className="w-3 h-3" /> Government
            </span>
          )}
          {job.is_overseas && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
              <Globe className="w-3 h-3" /> Overseas
            </span>
          )}
          {getPostTypeBadge()}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {job.title}
        </h3>

        {/* Meta */}
        <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.company}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{job.location || job.countries?.name || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className={isExpired ? 'text-red-500 dark:text-red-400 font-medium' : ''}>
              {isExpired ? 'Expired' : `Closes ${closing.toLocaleDateString()} · ${daysLeft}d left`}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">{job.categories?.name || 'General'}</span>
          <div className="flex items-center gap-2">
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
              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Share Vacancy"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-all shadow-sm">
              View Details <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
