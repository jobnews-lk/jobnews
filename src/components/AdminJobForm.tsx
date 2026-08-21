import { useState, useEffect } from 'react';
import { Type, ImageIcon, FileText, CheckCircle2, Clock, AlertCircle, Plus, X, Trash2 } from 'lucide-react';
import FileUpload from './FileUpload';
import { supabase, type Country, type Category, type Job } from '../lib/supabase';

interface AdminJobFormProps {
  job?: Job | null;
  countries: Country[];
  categories: Category[];
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  submitting: boolean;
}

export default function AdminJobForm({ job, countries, categories, onSubmit, onCancel, submitting }: AdminJobFormProps) {
  const [postType, setPostType] = useState<'text' | 'image' | 'pdf'>(job?.post_type || 'text');

  const [title, setTitle] = useState(job?.title || '');
  const [company, setCompany] = useState(job?.company || '');
  const [salary, setSalary] = useState(job?.salary || '');
  const [location, setLocation] = useState(job?.location || '');
  const [description, setDescription] = useState(job?.description || '');
  const [requirements, setRequirements] = useState(job?.requirements || '');
  const [closingDate, setClosingDate] = useState(job?.closing_date || '');
  const [postedDate, setPostedDate] = useState(job?.posted_date || new Date().toISOString().split('T')[0]);
  const [applyMethod, setApplyMethod] = useState<'online' | 'email' | 'in_person' | 'phone' | 'post'>(job?.apply_method || 'online');
  const [applyUrl, setApplyUrl] = useState(job?.apply_url || '');
  const [applyEmail, setApplyEmail] = useState(job?.apply_email || '');
  const [applyPhone, setApplyPhone] = useState(job?.apply_phone || '');
  const [applyAddress, setApplyAddress] = useState(job?.apply_address || (job?.apply_method === 'post' ? job?.location : '') || '');
  const [applyInstructions, setApplyInstructions] = useState(job?.apply_method === 'post' ? job?.apply_url || '' : '');
  const [isGovernment, setIsGovernment] = useState(job?.is_government || false);
  const [isOverseas, setIsOverseas] = useState(job?.is_overseas || false);
  const [isPrivateSector, setIsPrivateSector] = useState(job?.is_private_sector || false);
  const [categoryId, setCategoryId] = useState(job?.category_id || '');
  const [countryId, setCountryId] = useState(job?.country_id || '');
  const [postToFacebook, setPostToFacebook] = useState(false);
  const [postToWhatsApp, setPostToWhatsApp] = useState(false);
  const [countryList, setCountryList] = useState<Country[]>(countries || []);
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [newCountryName, setNewCountryName] = useState('');
  const [addingCountry, setAddingCountry] = useState(false);

  const [categoryList, setCategoryList] = useState<Category[]>(categories || []);
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  const safeCountryList = Array.isArray(countryList) ? countryList : (Array.isArray(countries) ? countries : []);
  const safeCategoryList = Array.isArray(categoryList) ? categoryList : (Array.isArray(categories) ? categories : []);

  useEffect(() => {
    setCategoryList(categories || []);
  }, [categories]);

  useEffect(() => {
    setCountryList(countries || []);
  }, [countries]);

  useEffect(() => {
    async function fetchLatestCountries() {
      const { data: currentCountries } = await supabase.from('countries').select('*').order('name');
      if (currentCountries) {
        setCountryList(currentCountries);
      }
    }
    fetchLatestCountries();
  }, []);

  useEffect(() => {
    async function checkAndSeedCategories() {
      const { data: currentCats } = await supabase.from('categories').select('*').order('name');
      if (currentCats) {
        setCategoryList(currentCats);
        // If very few categories exist, auto-insert the standard ones including Design & Education
        if (currentCats.length < 5) {
          const defaults = [
            { name: 'Software Engineering', slug: 'software-engineering' },
            { name: 'Marketing', slug: 'marketing' },
            { name: 'Finance', slug: 'finance' },
            { name: 'Healthcare', slug: 'healthcare' },
            { name: 'Design', slug: 'design' },
            { name: 'Sales', slug: 'sales' },
            { name: 'Operations', slug: 'operations' },
            { name: 'Education', slug: 'education' },
            { name: 'Construction', slug: 'construction' },
            { name: 'Media & Communications', slug: 'media-communications' }
          ];
          for (const d of defaults) {
            if (!currentCats.some(c => c.slug === d.slug || c.name.toLowerCase() === d.name.toLowerCase())) {
              await supabase.from('categories').insert(d);
            }
          }
          const { data: updated } = await supabase.from('categories').select('*').order('name');
          if (updated) setCategoryList(updated);
        }
      }
    }
    checkAndSeedCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setAddingCat(true);
    const slug = newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { data, error } = await supabase.from('categories').insert({ name: newCatName.trim(), slug }).select().single();
    setAddingCat(false);
    if (!error && data) {
      setCategoryList(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryId(data.id);
      setNewCatName('');
      setShowAddCat(false);
    } else {
      alert('Could not add category: ' + (error?.message || 'Unknown error'));
    }
  };

  const handleCreateCountry = async () => {
    if (!newCountryName.trim()) return;
    setAddingCountry(true);
    const slug = newCountryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { data, error } = await supabase.from('countries').insert({ name: newCountryName.trim(), slug }).select().single();
    setAddingCountry(false);
    if (!error && data) {
      setCountryList(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setCountryId(data.id);
      setNewCountryName('');
      setShowAddCountry(false);
    } else {
      alert('Could not add country: ' + (error?.message || 'Unknown error'));
    }
  };

  const sriLankaId = safeCountryList.find((c) => c && typeof c === 'object' && c.slug === 'sri-lanka')?.id ?? '';
  const [status, setStatus] = useState<'draft' | 'published'>(job?.status || 'draft');

  const [thumbnailUrl, setThumbnailUrl] = useState(job?.thumbnail_url || '');
  const [officialPdfUrl, setOfficialPdfUrl] = useState(job?.official_pdf_url || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(job?.job_images?.map((i) => i.url) || []);
  const [galleryPdfs, setGalleryPdfs] = useState<{ url: string; filename: string }[]>(job?.job_pdfs?.map((p) => ({ url: p.url, filename: p.filename || '' })) || []);

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (job) {
      setPostType(job.post_type);
      setTitle(job.title);
      setCompany(job.company);
      setSalary(job.salary || '');
      setLocation(job.location);
      setDescription(job.description);
      setRequirements(job.requirements || '');
      setClosingDate(job.closing_date);
      setPostedDate(job.posted_date);
      setApplyMethod(job.apply_method);
      setApplyUrl(job.apply_url || '');
      setApplyEmail(job.apply_email || '');
      setApplyPhone(job.apply_phone || '');
      setApplyAddress(job.apply_address || (job.apply_method === 'post' ? job.location : '') || '');
      setApplyInstructions(job.apply_method === 'post' ? job.apply_url || '' : '');
      setIsGovernment(job.is_government);
      setIsOverseas(job.is_overseas);
      setIsPrivateSector(job.is_private_sector);
      setCategoryId(job.category_id || '');
      setCountryId(job.country_id || (job.is_overseas ? '' : sriLankaId));
      setStatus(job.status);
      setThumbnailUrl(job.thumbnail_url || '');
      setOfficialPdfUrl(job.official_pdf_url || '');
      setGalleryImages(job.job_images?.map((i) => i.url) || []);
      setGalleryPdfs(job.job_pdfs?.map((p) => ({ url: p.url, filename: p.filename || '' })) || []);
    }
  }, [job]);

  const validate = (): boolean => {
    setValidationError('');
    if (!isGovernment && !isOverseas && !isPrivateSector) {
      setValidationError('Please select at least one Job Classification (Government, Overseas, or Private Sector).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
    if (postType === 'image') {
      if (galleryImages.length === 0) {
        setValidationError('Image notices require at least one uploaded image.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }
    }
    if (postType === 'pdf') {
      if (!officialPdfUrl) {
        setValidationError('PDF notices require an official PDF file.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }
      if (!thumbnailUrl) {
        setValidationError('PDF notices require a thumbnail image.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const data: Record<string, unknown> = {
      post_type: postType,
      title,
      company,
      salary: salary || null,
      location: applyMethod === 'post' && applyAddress.trim() ? applyAddress.trim() : location,
      description,
      requirements: requirements || null,
      closing_date: closingDate,
      posted_date: postedDate,
      apply_method: applyMethod,
      apply_url: applyMethod === 'online' ? (applyUrl.trim() ? (applyUrl.trim().startsWith('http://') || applyUrl.trim().startsWith('https://') ? applyUrl.trim() : 'https://' + applyUrl.trim()) : null) : (applyMethod === 'post' ? applyInstructions.trim() || null : null),
      apply_email: applyMethod === 'email' ? applyEmail || null : null,
      apply_phone: applyMethod === 'phone' ? applyPhone || null : null,
      is_government: isGovernment,
      is_overseas: isOverseas,
      is_private_sector: isPrivateSector,
      category_id: categoryId || null,
      country_id: isOverseas ? (countryId || null) : (sriLankaId || null),
      status,
      thumbnail_url: thumbnailUrl || null,
      official_pdf_url: officialPdfUrl || null,
      gallery_images: galleryImages,
      gallery_pdfs: galleryPdfs,
      replaceImages: true,
      replacePdfs: true,
      post_to_facebook: status === 'published' ? postToFacebook : false,
      post_to_whatsapp: status === 'published' ? postToWhatsApp : false,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {validationError && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {validationError}
        </div>
      )}

      {/* Post Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Post Type</label>
        <div className="flex flex-wrap gap-2">
          {(['text', 'image', 'pdf'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setPostType(type)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-all ${
                postType === type
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {type === 'text' && <Type className="w-4 h-4" />}
              {type === 'image' && <ImageIcon className="w-4 h-4" />}
              {type === 'pdf' && <FileText className="w-4 h-4" />}
              {type === 'text' ? 'Text Notice' : type === 'image' ? 'Image Notice' : 'PDF Notice'}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {(['draft', 'published'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-all ${
                status === s
                  ? s === 'published'
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {s === 'published' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {s === 'published' ? 'Published' : 'Draft'}
            </button>
          ))}
        </div>

        {/* Social Media Auto-Poster Toggles */}
        {status === 'published' && (
          <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
            <span className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Social Media Auto-Publishing</span>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postToFacebook}
                  onChange={(e) => setPostToFacebook(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>Auto-Post to <strong>Facebook Page</strong></span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={postToWhatsApp}
                  onChange={(e) => setPostToWhatsApp(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>Auto-Broadcast to <strong>WhatsApp Channel</strong></span>
              </label>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500 mt-2">
          {status === 'published'
            ? 'This job will be visible to the public on the website and broadcast to selected social channels.'
            : 'This job will be saved as a draft and only visible in the admin dashboard.'}
        </p>
      </div>

      {/* Job Classification */}
      <div className={`rounded-lg p-4 border transition-colors ${!isGovernment && !isOverseas && !isPrivateSector && validationError ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-slate-800">Job Classification *</label>
          <span className="text-xs text-red-600 font-medium">(Must select at least one)</span>
        </div>
        <div className="flex flex-wrap gap-6 mt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isGovernment}
              onChange={(e) => {
                setIsGovernment(e.target.checked);
                if (e.target.checked && !isOverseas) setCountryId(sriLankaId);
              }}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700">Government</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isOverseas}
              onChange={(e) => {
                setIsOverseas(e.target.checked);
                if (!e.target.checked) setCountryId(sriLankaId);
                else setCountryId('');
              }}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700">Overseas</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPrivateSector}
              onChange={(e) => {
                setIsPrivateSector(e.target.checked);
                if (e.target.checked && !isOverseas) setCountryId(sriLankaId);
              }}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700">Private Sector</span>
          </label>
        </div>

        {isGovernment && (
          <p className="mt-2 text-xs text-amber-800 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/50 flex items-center gap-1.5">
            <span>🛡️</span>
            <span>Government Job ලෙස සලකුණු කර ඇති නිසා, Job Page එකෙහි <strong>"විශේෂ සටහන (Disclaimer)"</strong> Box එක ස්වයංක්‍රීයවම පෙනෙනු ඇත.</span>
          </p>
        )}
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company/Organization *</label>
          <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {isOverseas ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Country *</label>
              <button
                type="button"
                onClick={() => setShowAddCountry(!showAddCountry)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3.5 h-3.5" /> {showAddCountry ? 'Close' : 'Add New Country'}
              </button>
            </div>
            {showAddCountry ? (
              <div className="flex gap-2 mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <input
                  type="text"
                  placeholder="Type country name (e.g. Qatar, Japan, South Korea)"
                  value={newCountryName}
                  onChange={(e) => setNewCountryName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCountry(); } }}
                />
                <button
                  type="button"
                  onClick={handleCreateCountry}
                  disabled={addingCountry || !newCountryName.trim()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md disabled:opacity-50"
                >
                  {addingCountry ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : null}
            <select value={countryId || ''} onChange={(e) => setCountryId(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
              <option value="">Select country</option>
              {safeCountryList.filter((c) => c && typeof c === 'object' && c.slug !== 'sri-lanka').map((c) => <option key={c.id || Math.random()} value={c.id || ''}>{c.name || 'Unknown'}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
            <input
              type="text"
              value="Sri Lanka"
              readOnly
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>
        )}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-slate-700">Category</label>
            <button
              type="button"
              onClick={() => setShowAddCat(!showAddCat)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-3.5 h-3.5" /> {showAddCat ? 'Close' : 'Add New Category'}
            </button>
          </div>
          {showAddCat ? (
            <div className="flex gap-2 mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <input
                type="text"
                placeholder="Type new category name (e.g. Design, Education)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); } }}
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={addingCat || !newCatName.trim()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md disabled:opacity-50"
              >
                {addingCat ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : null}
          <select value={categoryId || ''} onChange={(e) => setCategoryId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white">
            <option value="">Select category</option>
            {safeCategoryList.filter((c) => c && typeof c === 'object').map((c) => <option key={c.id || Math.random()} value={c.id || ''}>{c.name || 'Unknown'}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Colombo, New York" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Salary (optional)</label>
          <input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. $80,000 - $100,000" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Posted Date *</label>
          <input type="date" value={postedDate} onChange={(e) => setPostedDate(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Closing Date *</label>
          <input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} required className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Apply Method */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Apply Method *</label>
        <div className="flex flex-wrap gap-3">
          {(['online', 'email', 'in_person', 'phone', 'post'] as const).map((m) => (
            <label key={m} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="applyMethod" value={m} checked={applyMethod === m} onChange={() => setApplyMethod(m)} className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" />
              <span className="text-sm text-slate-700">{m === 'online' ? 'Apply Online' : m === 'email' ? 'Apply by Email' : m === 'in_person' ? 'Apply In Person' : m === 'phone' ? 'Phone Number' : '📮 Registered Post (ලියාපදිංචි තැපෑලෙන්)'}</span>
            </label>
          ))}
        </div>
        {applyMethod === 'online' && (
          <div className="mt-3">
            <input type="text" value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} placeholder="Application URL (e.g. www.doenets.lk or https://...)" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}
        {applyMethod === 'email' && (
          <div className="mt-3">
            <input type="email" value={applyEmail} onChange={(e) => setApplyEmail(e.target.value)} placeholder="Application email address" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}
        {applyMethod === 'phone' && (
          <div className="mt-3">
            <input type="tel" value={applyPhone} onChange={(e) => setApplyPhone(e.target.value)} placeholder="Phone number" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        )}
        {applyMethod === 'post' && (
          <div className="mt-3 space-y-4 bg-blue-50/60 dark:bg-slate-800/40 p-4 rounded-xl border border-blue-200 dark:border-slate-800">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                💡 1. Application Instructions / Notes (අයදුම්කිරීමේ විශේෂ උපදෙස්/සටහන් - optional)
              </label>
              <textarea
                value={applyInstructions}
                onChange={(e) => setApplyInstructions(e.target.value)}
                rows={2}
                placeholder="e.g. ලේකම්ගේ සදහන් වන ආකාරයට, ඔබගේ අයදුම්පත ලියාපදිංචි තැපෑලෙන් පමණක් යැවිය යුතුය. අයදුම්පත A4 ප්‍රමාණයේ කඩදාසියක සකස් කර..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white bg-white dark:bg-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                ℹ️ මෙම උපදෙස් Job Page එකෙහි උඩින් වෙනම ලස්සන Blue Notice Banner එකක පෙනෙනු ඇත (Copy Address එකට එකතු නොවේ).
              </p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                📮 2. Exact Postal Address Only (තැපැල් ලිපිනය පමණක් - optional)
              </label>
              <textarea
                value={applyAddress}
                onChange={(e) => setApplyAddress(e.target.value)}
                rows={3}
                placeholder="e.g. ලේකම්, විදේශ කටයුතු අමාත්‍යාංශය, ජනරජ ගොඩනැගිල්ල, කොළඹ 01."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white bg-white dark:bg-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm font-medium"
              />
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                ✅ පරිශීලකයා "Copy Address" Button එක ක්ලික් කළ විට Copy වන්නේ මෙහි ඇති ලිපිනය පමණි!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Requirements</label>
        <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={4} placeholder="List qualifications, experience, skills..." className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" />
      </div>

      {/* ========== UPLOADS ========== */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Files & Media</h3>

        {/* IMAGE NOTICE uploads */}
        {postType === 'image' && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-1">Image Notice</h4>
              <p className="text-xs text-blue-600">Upload one or more images for the job notice. The first image will be used as the thumbnail.</p>
            </div>
            <FileUpload
              bucket="job-images"
              folder="notices"
              accept="image/*"
              multiple={true}
              compress={true}
              value={galleryImages}
              onChange={setGalleryImages}
              label="Notice Images"
              required={true}
              maxFiles={20}
            />
            {galleryImages.length > 0 && (
              <p className="text-xs text-slate-500">The first image will be used as the thumbnail for job cards and listings.</p>
            )}
            <FileUpload
              bucket="job-pdfs"
              folder="notices"
              accept="application/pdf"
              multiple={false}
              value={officialPdfUrl ? [officialPdfUrl] : []}
              onChange={(urls) => setOfficialPdfUrl(urls[0] || '')}
              label="Official Notice PDF (optional)"
              maxFiles={1}
            />

            {/* Additional PDFs & Document Hints */}
            <div className="space-y-4">
              <FileUpload
                bucket="job-pdfs"
                folder="attachments"
                accept="application/pdf"
                multiple={true}
                value={galleryPdfs.map((p) => p.url)}
                onChange={(urls) => {
                  setGalleryPdfs((prev) => {
                    return urls.map((url) => {
                      const existing = prev.find((item) => item.url === url);
                      if (existing) return existing;
                      const defaultName = url.split('/').pop()?.replace(/^\d+-/, '') || 'Document.pdf';
                      return { url, filename: defaultName };
                    });
                  });
                }}
                label="Additional PDFs & Application Documents (optional)"
                maxFiles={10}
              />

              {galleryPdfs.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-blue-50/50 dark:bg-slate-800/30 p-3 rounded-lg border border-dashed border-blue-200 dark:border-slate-700">
                  💡 <strong>Tip:</strong> Click above to upload PDFs (e.g. Official Application Form, Gazette Notice, Syllabus). Once uploaded, editable title and hint text boxes will appear here for each document!
                </p>
              ) : (
                <div className="space-y-3 bg-blue-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-blue-200 dark:border-slate-800">
                  <span className="block text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                    📌 Document Hints & Labels for Applicants:
                  </span>
                  {galleryPdfs.map((pdf, idx) => (
                    <div key={pdf.url + idx} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                      <FileText className="w-5 h-5 text-red-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
                          Document {idx + 1} Hint / Title:
                        </label>
                        <input
                          type="text"
                          value={pdf.filename}
                          onChange={(e) => {
                            const updatedName = e.target.value;
                            setGalleryPdfs((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, filename: updatedName } : item))
                            );
                          }}
                          placeholder="e.g. Official Application Form (Sinhala), Marking Scheme, Gazette Notice"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setGalleryPdfs((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PDF NOTICE uploads */}
        {postType === 'pdf' && (
          <div className="space-y-6">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="text-sm font-medium text-red-800 mb-1">PDF Notice</h4>
              <p className="text-xs text-red-600">Upload the official PDF notice and a thumbnail image for job cards.</p>
            </div>
            <FileUpload
              bucket="job-pdfs"
              folder="notices"
              accept="application/pdf"
              multiple={false}
              value={officialPdfUrl ? [officialPdfUrl] : []}
              onChange={(urls) => setOfficialPdfUrl(urls[0] || '')}
              label="Official PDF Notice"
              required={true}
              maxFiles={1}
            />
            <FileUpload
              bucket="job-images"
              folder="thumbnails"
              accept="image/*"
              multiple={false}
              compress={true}
              maxWidth={800}
              maxHeight={800}
              value={thumbnailUrl ? [thumbnailUrl] : []}
              onChange={(urls) => setThumbnailUrl(urls[0] || '')}
              label="Thumbnail Image"
              required={true}
              maxFiles={1}
            />
            <FileUpload
              bucket="job-images"
              folder="notices"
              accept="image/*"
              multiple={true}
              compress={true}
              value={galleryImages}
              onChange={setGalleryImages}
              label="Additional Gallery Images (optional)"
              maxFiles={10}
            />

            {/* Additional PDFs & Document Hints */}
            <div className="space-y-4">
              <FileUpload
                bucket="job-pdfs"
                folder="attachments"
                accept="application/pdf"
                multiple={true}
                value={galleryPdfs.map((p) => p.url)}
                onChange={(urls) => {
                  setGalleryPdfs((prev) => {
                    return urls.map((url) => {
                      const existing = prev.find((item) => item.url === url);
                      if (existing) return existing;
                      const defaultName = url.split('/').pop()?.replace(/^\d+-/, '') || 'Document.pdf';
                      return { url, filename: defaultName };
                    });
                  });
                }}
                label="Additional PDFs & Application Documents (optional)"
                maxFiles={10}
              />

              {galleryPdfs.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-blue-50/50 dark:bg-slate-800/30 p-3 rounded-lg border border-dashed border-blue-200 dark:border-slate-700">
                  💡 <strong>Tip:</strong> Click above to upload PDFs (e.g. Official Application Form, Gazette Notice, Syllabus). Once uploaded, editable title and hint text boxes will appear here for each document!
                </p>
              ) : (
                <div className="space-y-3 bg-blue-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-blue-200 dark:border-slate-800">
                  <span className="block text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                    📌 Document Hints & Labels for Applicants:
                  </span>
                  {galleryPdfs.map((pdf, idx) => (
                    <div key={pdf.url + idx} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                      <FileText className="w-5 h-5 text-red-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
                          Document {idx + 1} Hint / Title:
                        </label>
                        <input
                          type="text"
                          value={pdf.filename}
                          onChange={(e) => {
                            const updatedName = e.target.value;
                            setGalleryPdfs((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, filename: updatedName } : item))
                            );
                          }}
                          placeholder="e.g. Official Application Form (Sinhala), Marking Scheme, Gazette Notice"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setGalleryPdfs((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TEXT NOTICE uploads */}
        {postType === 'text' && (
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h4 className="text-sm font-medium text-slate-800 mb-1">Text Notice</h4>
              <p className="text-xs text-slate-600">No images or PDFs are required. You may optionally add a thumbnail or attachments.</p>
            </div>
            <FileUpload
              bucket="job-images"
              folder="thumbnails"
              accept="image/*"
              multiple={false}
              compress={true}
              maxWidth={800}
              maxHeight={800}
              value={thumbnailUrl ? [thumbnailUrl] : []}
              onChange={(urls) => setThumbnailUrl(urls[0] || '')}
              label="Thumbnail Image (optional)"
              maxFiles={1}
            />
            <FileUpload
              bucket="job-pdfs"
              folder="notices"
              accept="application/pdf"
              multiple={false}
              value={officialPdfUrl ? [officialPdfUrl] : []}
              onChange={(urls) => setOfficialPdfUrl(urls[0] || '')}
              label="Attachment PDF (optional)"
              maxFiles={1}
            />
            <FileUpload
              bucket="job-images"
              folder="notices"
              accept="image/*"
              multiple={true}
              compress={true}
              value={galleryImages}
              onChange={setGalleryImages}
              label="Additional Gallery Images (optional)"
              maxFiles={10}
            />

            {/* Additional PDFs & Document Hints */}
            <div className="space-y-4">
              <FileUpload
                bucket="job-pdfs"
                folder="attachments"
                accept="application/pdf"
                multiple={true}
                value={galleryPdfs.map((p) => p.url)}
                onChange={(urls) => {
                  setGalleryPdfs((prev) => {
                    return urls.map((url) => {
                      const existing = prev.find((item) => item.url === url);
                      if (existing) return existing;
                      const defaultName = url.split('/').pop()?.replace(/^\d+-/, '') || 'Document.pdf';
                      return { url, filename: defaultName };
                    });
                  });
                }}
                label="Additional PDFs & Application Documents (optional)"
                maxFiles={10}
              />

              {galleryPdfs.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-blue-50/50 dark:bg-slate-800/30 p-3 rounded-lg border border-dashed border-blue-200 dark:border-slate-700">
                  💡 <strong>Tip:</strong> Click above to upload PDFs (e.g. Official Application Form, Gazette Notice, Syllabus). Once uploaded, editable title and hint text boxes will appear here for each document!
                </p>
              ) : (
                <div className="space-y-3 bg-blue-50/50 dark:bg-slate-800/40 p-4 rounded-xl border border-blue-200 dark:border-slate-800">
                  <span className="block text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                    📌 Document Hints & Labels for Applicants:
                  </span>
                  {galleryPdfs.map((pdf, idx) => (
                    <div key={pdf.url + idx} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                      <FileText className="w-5 h-5 text-red-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
                          Document {idx + 1} Hint / Title:
                        </label>
                        <input
                          type="text"
                          value={pdf.filename}
                          onChange={(e) => {
                            const updatedName = e.target.value;
                            setGalleryPdfs((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, filename: updatedName } : item))
                            );
                          }}
                          placeholder="e.g. Official Application Form (Sinhala), Marking Scheme, Gazette Notice"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setGalleryPdfs((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Social Media Auto-Post Toggles */}
      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
        <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          📢 Social Media Auto-Publish Options:
        </span>
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700 dark:text-slate-300">
          <label className="inline-flex items-center gap-2 cursor-pointer hover:text-blue-600">
            <input
              type="checkbox"
              checked={postToFacebook}
              onChange={(e) => setPostToFacebook(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="font-medium">📘 Auto-Post to Facebook Page</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer hover:text-emerald-600">
            <input
              type="checkbox"
              checked={postToWhatsApp}
              onChange={(e) => setPostToWhatsApp(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span className="font-medium">🟢 Auto-Broadcast to WhatsApp Channel</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
          {submitting ? 'Saving...' : job ? 'Update Job' : 'Create Job'}
        </button>
      </div>
    </form>
  );
}
