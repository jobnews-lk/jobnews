import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, Calendar, FileText, ImageIcon, Type, Clock, Globe, Landmark, Download, ExternalLink, Mail, Phone, ChevronLeft, ChevronRight, X, ZoomIn, Eye } from 'lucide-react';
import { supabase, type Job } from '../lib/supabase';
import SaveJobButton from '../components/SaveJobButton';
import { useAuth } from '../context/AuthContext';

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const isPreviewParam = searchParams.get('preview') === 'true';

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  const formatContent = (text: string | null | undefined, forceBullets: boolean = false) => {
    if (!text) return null;
    return text.split('\n').filter(line => line.trim() !== '').map((line, i) => {
      const trimmed = line.trim();
      const isBullet = forceBullets || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•');
      if (isBullet) {
        return (
          <div key={i} className="flex gap-2 items-start mt-2">
            <span className="text-blue-500 font-bold mt-0.5">•</span>
            <span className="leading-relaxed">{trimmed.replace(/^[-*•]\s*/, '')}</span>
          </div>
        );
      }
      return <div key={i} className={i > 0 ? "mt-3 leading-relaxed" : "leading-relaxed"}>{line}</div>;
    });
  };

  useEffect(() => {
    async function loadJob() {
      if (!id) return;
      let query = supabase
        .from('jobs')
        .select('*, countries(*), categories(*), job_images(*), job_pdfs(*)')
        .eq('id', id);

      // Only filter by published status if NOT in admin preview mode
      if (!isAdmin && !isPreviewParam) {
        query = query.eq('status', 'published');
      }

      const { data } = await query.maybeSingle();
      if (data) setJob(data as Job);
      setLoading(false);
    }
    loadJob();
  }, [id, isAdmin, isPreviewParam]);

  if (loading) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-3/4 bg-slate-200 rounded mb-4" />
            <div className="h-4 w-1/2 bg-slate-200 rounded mb-8" />
            <div className="h-32 w-full bg-slate-200 rounded mb-4" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-20 px-4 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Notice Not Found</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">The job announcement you are looking for does not exist or has been removed.</p>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>
    );
  }

  const closing = new Date(job.closing_date);
  const isExpired = closing < new Date();
  const daysLeft = Math.ceil((closing.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const images = job.job_images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const pdfs = job.job_pdfs || [];

  const allImages = [
    ...(job.thumbnail_url ? [{ id: 'thumbnail', url: job.thumbnail_url, sort_order: -1 }] : []),
    ...images,
  ];

  const hasPdf = job.official_pdf_url || pdfs.length > 0;
  const pdfUrl = job.official_pdf_url || (pdfs[0]?.url || null);
  const pdfFilename = pdfs[0]?.filename || 'Official Notice.pdf';

  return (
    <div className="py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Admin Preview Mode Alert Banner */}
        {job.status === 'draft' && (
          <div className="bg-amber-500 text-white font-semibold text-sm px-4 py-3 rounded-xl mb-6 flex items-center justify-between shadow-md animate-pulse">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <span>ADMIN PREVIEW MODE — This job is currently a DRAFT and NOT visible to public users.</span>
            </div>
            <span className="bg-white/20 text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">Draft Preview</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <SaveJobButton jobId={job.id} />
        </div>

        {/* Thumbnail / Hero Image */}
        {allImages.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 transition-colors">
            <div className="relative">
              <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
                {/* Blurred Background */}
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-2xl opacity-60 dark:opacity-40 scale-125"
                  style={{ backgroundImage: `url(${allImages[0].url})` }}
                />
                <div className="absolute inset-0 bg-white/20 dark:bg-black/30" />
                <img
                  src={allImages[0].url}
                  alt={job.title}
                  className="w-full h-full object-contain relative z-10 drop-shadow-lg"
                />
              </div>
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                  {allImages.length} images
                </div>
              )}
              {hasPdf && (
                <div className="absolute bottom-3 right-3">
                  <button
                    onClick={() => { if (pdfUrl) { setSelectedPdf(pdfUrl); setPdfViewerOpen(true); } }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg shadow-lg transition-colors"
                  >
                    <Download className="w-4 h-4" /> View Official PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 transition-colors">
          <div className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                {job.post_type === 'image' && <ImageIcon className="w-7 h-7" />}
                {job.post_type === 'pdf' && <FileText className="w-7 h-7" />}
                {job.post_type === 'text' && <Type className="w-7 h-7" />}
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-2 flex-wrap mb-1">
                  {job.is_government && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                      <Landmark className="w-3 h-3" /> Government
                    </span>
                  )}
                  {job.is_overseas && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full">
                      <Globe className="w-3 h-3" /> Overseas
                    </span>
                  )}
                  {job.is_private_sector && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      <Building2 className="w-3 h-3" /> Private Sector
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">{job.title}</h1>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mt-1">
                  <Building2 className="w-4 h-4" />
                  <span className="font-medium">{job.company}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{job.location || job.countries?.name || 'N/A'}</span>
              </div>
              {job.salary && (
                <div className="flex items-center gap-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{job.salary}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Posted {new Date(job.posted_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className={isExpired ? 'text-red-500 dark:text-red-400 font-medium' : ''}>
                  {isExpired ? 'Application Closed' : `Closes ${closing.toLocaleDateString()} (${daysLeft} day${daysLeft !== 1 ? 's' : ''} left)`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Based on Post Type */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 transition-colors">
          {/* TEXT POST */}
          {job.post_type === 'text' && (
            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Description</h2>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed">{formatContent(job.description)}</div>
              </div>
              {job.requirements && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Requirements</h2>
                  <div className="text-slate-600 dark:text-slate-300">{formatContent(job.requirements, true)}</div>
                </div>
              )}
              {/* Official PDF attachment */}
              {job.official_pdf_url && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Official Notice PDF</h2>
                  <div className="flex items-center gap-4 bg-red-50 dark:bg-red-950 rounded-xl border border-red-200 dark:border-red-900 p-4">
                    <div className="w-14 h-18 bg-red-50 dark:bg-red-950 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-8 h-8 text-red-500 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">Official Notice</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>PDF Document</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { setSelectedPdf(job.official_pdf_url!); setPdfViewerOpen(true); }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                        View PDF
                      </button>
                      <a href={job.official_pdf_url} download target="_blank" rel="noopener noreferrer"
                        className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white hover:text-blue-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* IMAGE POST */}
          {job.post_type === 'image' && (
            <div className="p-6 md:p-8">
              {/* Gallery */}
              {allImages.length > 1 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-3">Image Gallery</h2>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allImages.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setImageIndex(idx)}
                        className={`shrink-0 w-24 h-16 rounded-lg border-2 overflow-hidden ${idx === imageIndex ? 'border-blue-500' : 'border-slate-200'}`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main image viewer */}
              {allImages.length > 0 && (
                <div className="mb-6">
                  <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950">
                    {/* Blurred Background */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center blur-2xl opacity-60 dark:opacity-40 scale-125 transition-all duration-300"
                      style={{ backgroundImage: `url(${allImages[imageIndex].url})` }}
                    />
                    <div className="absolute inset-0 bg-white/20 dark:bg-black/30" />
                    <div className="aspect-[4/3] relative z-10 flex items-center justify-center cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
                      <img src={allImages[imageIndex].url} alt={`Notice ${imageIndex + 1}`} className="max-w-full max-h-full object-contain drop-shadow-lg transition-transform duration-300" />
                    </div>
                    {allImages.length > 1 && (
                      <>
                        <button onClick={() => setImageIndex(i => i > 0 ? i - 1 : allImages.length - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-slate-700 hover:bg-white shadow-sm transition-colors">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => setImageIndex(i => i < allImages.length - 1 ? i + 1 : 0)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-slate-700 hover:bg-white shadow-sm transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                          {imageIndex + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                    <button onClick={() => setLightboxOpen(true)} className="absolute top-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-slate-700 hover:bg-white shadow-sm transition-colors">
                      <ZoomIn className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Official PDF & Attachments */}
              {(job.official_pdf_url || (pdfs && pdfs.length > 0)) && (
                <div className="mb-6 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-500" /> Official Documents & Attachments
                  </h2>

                  {/* Primary PDF */}
                  {job.official_pdf_url && (
                    <div className="flex items-center gap-4 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/60 p-4">
                      <div className="w-12 h-14 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-7 h-7 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">Official PDF Notice</p>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Primary PDF Document</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => { setSelectedPdf(job.official_pdf_url!); setPdfViewerOpen(true); }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          View PDF
                        </button>
                        <a
                          href={job.official_pdf_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Additional PDF Attachments with Custom Hints */}
                  {pdfs.map((pdfItem, idx) => (
                    <div key={pdfItem.id || idx} className="flex items-center gap-4 bg-red-50/60 dark:bg-red-950/30 rounded-xl border border-red-200/80 dark:border-red-900/40 p-4">
                      <div className="w-12 h-14 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-7 h-7 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm truncate" title={pdfItem.filename || `Document ${idx + 1}`}>
                          {pdfItem.filename || `Document ${idx + 1}`}
                        </p>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Application Document</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => { setSelectedPdf(pdfItem.url); setPdfViewerOpen(true); }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          View
                        </button>
                        <a
                          href={pdfItem.url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {job.description && (
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Additional Information</h2>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed">{formatContent(job.description)}</div>
                </div>
              )}
              {job.requirements && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Requirements</h2>
                  <div className="text-slate-600 dark:text-slate-300">{formatContent(job.requirements, true)}</div>
                </div>
              )}
            </div>
          )}

          {/* PDF POST */}
          {job.post_type === 'pdf' && (
            <div className="p-6 md:p-8">
              {/* Official PDF */}
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 mb-3">Official Notice PDF</h2>
                {pdfUrl && (
                  <div className="flex items-center gap-4 bg-red-50 rounded-xl border border-red-200 p-4">
                    <div className="w-14 h-18 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{pdfFilename}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        {pdfs[0]?.page_count && <span>{pdfs[0].page_count} pages</span>}
                        <span>PDF Document</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { setSelectedPdf(pdfUrl); setPdfViewerOpen(true); }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                        View PDF
                      </button>
                      <a href={pdfUrl} download target="_blank" rel="noopener noreferrer"
                        className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white hover:text-blue-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Gallery images */}
              {images.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-3">Related Images</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img) => (
                      <div key={img.id} className="aspect-square rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {job.description && (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-2">Additional Information</h2>
                  <div className="text-slate-600 leading-relaxed">{formatContent(job.description)}</div>
                </div>
              )}
              {job.requirements && (
                <div className="mt-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-2">Requirements</h2>
                  <div className="text-slate-600">{formatContent(job.requirements, true)}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* How to Apply */}
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-900/30 p-6 md:p-8 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">How to Apply</h2>
          <div className="space-y-3">
            {job.apply_method === 'online' && job.apply_url && (
              <div>
                <p className="text-slate-600 dark:text-slate-400 mb-3">Apply online through the official application portal.</p>
                <a href={job.apply_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                  <ExternalLink className="w-4 h-4" /> Apply Online
                </a>
              </div>
            )}
            {job.apply_method === 'email' && job.apply_email && (
              <div>
                <p className="text-slate-600 dark:text-slate-400 mb-3">Send your application via email to the address below.</p>
                <div className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-xl text-blue-700 dark:text-blue-400 font-semibold transition-colors">
                  <Mail className="w-5 h-5" /> {job.apply_email}
                </div>
                <a href={`mailto:${job.apply_email}`}
                  className="inline-flex items-center gap-2 ml-3 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                  <Mail className="w-4 h-4" /> Send Email
                </a>
              </div>
            )}
            {job.apply_method === 'phone' && job.apply_phone && (
              <div>
                <p className="text-slate-600 dark:text-slate-400 mb-3">Contact the organization via phone for application details.</p>
                <div className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-xl text-blue-700 dark:text-blue-400 font-semibold transition-colors">
                  <Phone className="w-5 h-5" /> {job.apply_phone}
                </div>
              </div>
            )}
            {job.apply_method === 'in_person' && (
              <div>
                <p className="text-slate-600 dark:text-slate-400 mb-3">Submit your application in person at the specified location.</p>
                <div className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-xl text-blue-700 dark:text-blue-400 font-semibold transition-colors">
                  <MapPin className="w-5 h-5" /> {job.location || job.countries?.name || 'See notice for details'}
                </div>
              </div>
            )}
            {!job.apply_url && !job.apply_email && !job.apply_phone && job.apply_method === 'online' && (
              <div className="text-slate-600 dark:text-slate-400">Please refer to the official notice for application instructions.</div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors" onClick={() => setLightboxOpen(false)}>
            <X className="w-5 h-5" />
          </button>
          {allImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setImageIndex(i => i > 0 ? i - 1 : allImages.length - 1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setImageIndex(i => i < allImages.length - 1 ? i + 1 : 0); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div className="max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img src={allImages[imageIndex].url} alt={`Notice ${imageIndex + 1}`} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            <div className="text-center text-white text-sm mt-3">
              {imageIndex + 1} / {allImages.length} — {job.title}
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      {pdfViewerOpen && selectedPdf && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">PDF Viewer</h3>
              <div className="flex items-center gap-2">
                <a href={selectedPdf} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                  <Download className="w-4 h-4" /> Download
                </a>
                <button onClick={() => setPdfViewerOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe src={selectedPdf} className="w-full h-full border-0" title="PDF Viewer" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
