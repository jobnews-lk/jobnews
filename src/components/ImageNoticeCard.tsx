import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Globe, Landmark, ChevronLeft, ChevronRight, X, ZoomIn, ImageIcon, ExternalLink, MapPin as MapPinIcon, Share2 } from 'lucide-react';
import type { Job } from '../lib/supabase';
import { Badge } from './NoticeBadge';
import SaveJobButton from './SaveJobButton';

interface ImageNoticeCardProps {
  job: Job;
}

export default function ImageNoticeCard({ job }: ImageNoticeCardProps) {
  const images = job.job_images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef(0);

  const closing = new Date(job.closing_date);
  const isExpired = closing < new Date();
  const hasApplyUrl = job.apply_method === 'online' && job.apply_url;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < images.length - 1) setCurrentIndex((i) => i + 1);
      else if (diff < 0 && currentIndex > 0) setCurrentIndex((i) => i - 1);
    }
  };

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(images.length - 1, i + 1));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="relative bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0 transition-colors" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {/* Blurred Background to fill letterboxing naturally */}
          <div 
            className="absolute inset-0 bg-cover bg-center blur-xl opacity-60 dark:opacity-40 scale-125 transition-all duration-300"
            style={{ backgroundImage: `url(${images[currentIndex].url})` }}
          />
          {/* Subtle overlay for better contrast */}
          <div className="absolute inset-0 bg-white/20 dark:bg-black/30" />
          
          <div className="aspect-[4/3] relative z-10 cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
            <img src={images[currentIndex].url} alt={`${job.title} - ${currentIndex + 1}`} className="w-full h-full object-contain drop-shadow-lg transition-transform duration-300" />
            <div className="absolute top-3 right-3 w-9 h-9 bg-black/40 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors">
              <ZoomIn className="w-4 h-4" />
            </div>
          </div>
          {images.length > 1 && (
            <>
              <button onClick={prev} className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-slate-700 hover:bg-white shadow-sm transition-all ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={next} className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-slate-700 hover:bg-white shadow-sm transition-all ${currentIndex === images.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-medium">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
          {images.length > 1 && (
            <div className="flex gap-1.5 p-2 bg-slate-900/50 overflow-x-auto">
              {images.map((img, idx) => (
                <button key={img.id} onClick={() => setCurrentIndex(idx)} className={`shrink-0 w-14 h-10 rounded overflow-hidden border-2 transition-colors ${idx === currentIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="p-4 md:p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {job.is_government && <Badge icon={<Landmark className="w-3 h-3" />} text="Government" color="blue" />}
          {job.is_overseas && <Badge icon={<Globe className="w-3 h-3" />} text="Overseas" color="teal" />}
          <Badge icon={<ImageIcon className="w-3 h-3" />} text="Image Notice" color="emerald" />
        </div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg leading-snug">{job.title}</h3>
          <SaveJobButton jobId={job.id} className="shrink-0 -mt-1 -mr-1" />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-4">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.countries?.name || job.location || 'N/A'}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Posted {new Date(job.posted_date).toLocaleDateString()}</span>
          <span className={`flex items-center gap-1 ${isExpired ? 'text-red-500' : ''}`}>
            <Clock className="w-3.5 h-3.5" /> {isExpired ? 'Closed' : `Closes ${closing.toLocaleDateString()}`}
          </span>
          {job.categories?.name && <span className="flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> {job.categories.name}</span>}
        </div>
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <button onClick={() => setLightboxOpen(true)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shrink-0">
              <ZoomIn className="w-3.5 h-3.5" /> Notice
            </button>
            {hasApplyUrl && (
              <a href={job.apply_url!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shrink-0">
                <ExternalLink className="w-3.5 h-3.5" /> Apply
              </a>
            )}
            {job.apply_method === 'email' && job.apply_email && (
              <a href={`mailto:${job.apply_email}`} className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shrink-0">
                <ExternalLink className="w-3.5 h-3.5" /> Email
              </a>
            )}
            {job.apply_method === 'phone' && job.apply_phone && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg shrink-0">
                <ExternalLink className="w-3.5 h-3.5" /> {job.apply_phone}
              </span>
            )}
            {job.apply_method === 'in_person' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg shrink-0">
                <MapPinIcon className="w-3.5 h-3.5" /> In Person
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {/* Details Button in exact position */}
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
              className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-800 shrink-0"
              title="Share Vacancy"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors" onClick={() => setLightboxOpen(false)}>
            <X className="w-5 h-5" />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setCurrentIndex((i) => (i > 0 ? i - 1 : images.length - 1)); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setCurrentIndex((i) => (i < images.length - 1 ? i + 1 : 0)); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div className="max-w-5xl max-h-[90vh] w-full px-4 flex flex-col items-center" onClick={(e) => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <div className={`relative overflow-hidden rounded-lg ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`} onClick={() => setZoomed(!zoomed)}>
              <img src={images[currentIndex].url} alt={`${job.title} - ${currentIndex + 1}`} className={`max-w-full max-h-[80vh] object-contain transition-transform duration-300 ${zoomed ? 'scale-150' : 'scale-100'}`} style={{ transformOrigin: 'center center' }} />
            </div>
            <div className="text-white text-sm mt-3 font-medium">{currentIndex + 1} / {images.length} — {job.title}</div>
          </div>
        </div>
      )}
    </div>
  );
}
