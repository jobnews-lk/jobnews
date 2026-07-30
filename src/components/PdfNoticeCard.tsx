import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Globe, Landmark, FileText, X, Eye, Download, ExternalLink, ChevronRight, Mail, Phone, MapPin as MapPinIcon } from 'lucide-react';
import type { Job } from '../lib/supabase';
import { Badge } from './NoticeBadge';
import SaveJobButton from './SaveJobButton';

interface PdfNoticeCardProps {
  job: Job;
}

export default function PdfNoticeCard({ job }: PdfNoticeCardProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const pdfs = job.job_pdfs || [];
  const pdf = pdfs[0];
  const pdfUrl = job.official_pdf_url || (pdf ? pdf.url : null);
  const closing = new Date(job.closing_date);
  const isExpired = closing < new Date();
  const hasApplyUrl = job.apply_method === 'online' && job.apply_url;

  const thumbnail = job.thumbnail_url || (job.job_images && job.job_images.length > 1 ? job.job_images[1].url : null);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      {thumbnail ? (
        <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden relative shrink-0">
          <img src={thumbnail} alt={job.title} className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 flex items-center gap-1 text-xs font-medium text-white bg-red-500/80 px-2 py-1 rounded-full">
            <FileText className="w-3 h-3" /> PDF
          </div>
        </div>
      ) : null}

      <div className="p-4 md:p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {job.is_government && <Badge icon={<Landmark className="w-3 h-3" />} text="Government" color="blue" />}
          {job.is_overseas && <Badge icon={<Globe className="w-3 h-3" />} text="Overseas" color="teal" />}
          <Badge icon={<FileText className="w-3 h-3" />} text="PDF Notice" color="red" />
        </div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-base md:text-lg leading-snug">{job.title}</h3>
          <SaveJobButton jobId={job.id} className="shrink-0 -mt-1 -mr-1" />
        </div>

        {/* PDF Preview Card */}
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 p-3 mb-4">
          <div className="w-12 h-14 bg-white dark:bg-slate-800 rounded-lg border border-red-100 dark:border-red-900/50 flex items-center justify-center shrink-0 shadow-sm">
            <FileText className="w-6 h-6 text-red-500 dark:text-red-400" />
          </div>
          <div className="flex-1 min-w-1">
            <p className="font-semibold text-slate-900 dark:text-white text-xs md:text-sm truncate">{pdf?.filename || 'Official Notice PDF'}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {pdf?.page_count && <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {pdf.page_count} pages</span>}
              <span>PDF Document</span>
            </div>
          </div>
          <button
            onClick={() => { if (pdfUrl) setViewerOpen(true); }}
            disabled={!pdfUrl}
            className="shrink-0 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs md:text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" /> View
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-4">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.countries?.name || job.location || 'N/A'}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Posted {new Date(job.posted_date).toLocaleDateString()}</span>
          <span className={`flex items-center gap-1 ${isExpired ? 'text-red-500' : ''}`}>
            <Clock className="w-3.5 h-3.5" /> {isExpired ? 'Closed' : `Closes ${closing.toLocaleDateString()}`}
          </span>
        </div>
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
          <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold rounded-lg transition-colors">
            <Eye className="w-3.5 h-3.5" /> Notice
          </Link>
          {hasApplyUrl && (
            <a href={job.apply_url!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs md:text-sm font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Apply
            </a>
          )}
          {job.apply_method === 'email' && job.apply_email && (
            <a href={`mailto:${job.apply_email}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs md:text-sm font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Apply by Email
            </a>
          )}
          {job.apply_method === 'phone' && job.apply_phone && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs md:text-sm font-medium rounded-lg">
              <ExternalLink className="w-3.5 h-3.5" /> {job.apply_phone}
            </span>
          )}
          {job.apply_method === 'in_person' && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs md:text-sm font-medium rounded-lg">
              <MapPinIcon className="w-3.5 h-3.5" /> Apply In Person
            </span>
          )}
          {pdfUrl && (
            <a href={pdfUrl} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs md:text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          )}
          <Link to={`/jobs/${job.id}`} className="inline-flex items-center gap-1 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-xs md:text-sm font-semibold rounded-lg transition-colors shadow-sm ml-auto">
            Details <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {viewerOpen && pdfUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl h-[95vh] md:h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-slate-200 bg-white shrink-0">
              <div className="min-w-0 mr-3">
                <h3 className="font-semibold text-slate-900 text-sm truncate">{job.title}</h3>
                <p className="text-xs text-slate-500">PDF Viewer</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={pdfUrl} download target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                  <Download className="w-4 h-4" /> Download
                </a>
                <button onClick={() => setViewerOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-slate-100">
              <iframe src={pdfUrl} className="w-full h-full border-0" title="PDF Viewer" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
