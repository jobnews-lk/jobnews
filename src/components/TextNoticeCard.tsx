import { Link } from 'react-router-dom';
import { MapPin, Building2, Calendar, Clock, Globe, Landmark, Type, ExternalLink, Mail, Phone, MapPin as MapPinIcon, ChevronRight, ImageIcon } from 'lucide-react';
import type { Job } from '../lib/supabase';
import { Badge } from './NoticeBadge';
import SaveJobButton from './SaveJobButton';

interface TextNoticeCardProps {
  job: Job;
}

export default function TextNoticeCard({ job }: TextNoticeCardProps) {
  const closing = new Date(job.closing_date);
  const isExpired = closing < new Date();
  const hasApplyUrl = job.apply_method === 'online' && job.apply_url;

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
          <Badge icon={<Type className="w-3 h-3" />} text="Text Notice" color="slate" />
        </div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg leading-snug">{job.title}</h3>
          <SaveJobButton jobId={job.id} className="shrink-0 -mt-1 -mr-1" />
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-3">
          <Building2 className="w-3.5 h-3.5" />
          <span className="font-medium text-slate-700 dark:text-slate-300">{job.company}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-3">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.countries?.name || job.location || 'N/A'}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Posted {new Date(job.posted_date).toLocaleDateString()}</span>
          <span className={`flex items-center gap-1 ${isExpired ? 'text-red-500' : ''}`}>
            <Clock className="w-3.5 h-3.5" /> {isExpired ? 'Closed' : `Closes ${closing.toLocaleDateString()}`}
          </span>
          {job.categories?.name && <span className="flex items-center gap-1"><Type className="w-3.5 h-3.5" /> {job.categories.name}</span>}
        </div>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">{job.description}</p>
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
          <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold rounded-lg transition-colors">
            Notice <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          {hasApplyUrl && (
            <a href={job.apply_url!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs md:text-sm font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Apply
            </a>
          )}
          {job.apply_method === 'email' && job.apply_email && (
            <a href={`mailto:${job.apply_email}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs md:text-sm font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
              <Mail className="w-3.5 h-3.5" /> Apply by Email
            </a>
          )}
          {job.apply_method === 'phone' && job.apply_phone && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs md:text-sm font-medium rounded-lg">
              <Phone className="w-3.5 h-3.5" /> {job.apply_phone}
            </span>
          )}
          {job.apply_method === 'in_person' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs md:text-sm font-medium rounded-lg">
              <MapPinIcon className="w-3.5 h-3.5" /> Apply In Person
            </span>
          )}
          <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-1 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-xs md:text-sm font-semibold rounded-lg transition-colors shadow-sm ml-auto">
            Details <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
