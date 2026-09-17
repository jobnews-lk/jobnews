import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, User, Briefcase, GraduationCap, Award, 
  Globe, Mail, Phone, MapPin, Sparkles, RefreshCw, Eye, Palette, 
  Plus, Trash2, CheckCircle2, ChevronRight, Layers, FileCheck, Info,
  Sparkle, CreditCard, ShieldCheck, Check, Layout, ChevronUp, Camera
} from 'lucide-react';

// --- TYPES ---
export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  nicPassport: string;
  nationality: string;
  civilStatus: string;
  photoUrl: string;
  photoPosition?: 'center' | 'top' | 'bottom';
  photoScale?: number;
  photoX?: number;
  photoY?: number;
  photoFrameShape?: 'rounded' | 'circle' | 'square';
  photoFit?: 'contain' | 'cover';
  summary: string;
}

const getPhotoFitClass = (fit?: string) => {
  if (fit === 'cover') return 'object-cover';
  return 'object-contain'; // DEFAULT: 100% UNCROPPED FULL ORIGINAL PHOTO (Zero head cut-off!)
};

const getPhotoPositionClass = (pos?: string) => {
  if (pos === 'top') return 'object-top';
  if (pos === 'bottom') return 'object-bottom';
  return 'object-[center_35%]'; // Smart Auto-Center: Focuses face & leaves headroom above hair
};

const getPhotoFrameClass = (shape?: string) => {
  if (shape === 'circle') return 'rounded-full';
  if (shape === 'square') return 'rounded-lg';
  return 'rounded-3xl'; // DEFAULT: Modern Rounded Square (No head cut-off!)
};

const getPhotoTransformStyle = (scale?: number, x?: number, y?: number): React.CSSProperties => {
  const s = (scale || 100) / 100;
  const px = x || 0;
  const py = y || 0;
  return {
    transform: `scale(${s}) translate(${px}%, ${py}%)`,
    transformOrigin: 'center center',
    transition: 'transform 0.05s ease-out',
  };
};

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  year: string;
  details: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface CvData {
  personal: PersonalInfo;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: string[];
  languages: string[];
  extracurricular: string[];
  includeDeclaration: boolean;
  declarationText: string;
  referees: {
    name: string;
    designation: string;
    company: string;
    phone: string;
    email: string;
  }[];
  themeColor: string;
  templateId: 'executive' | 'fresher' | 'srilankan' | 'classic';
  isGlobalMode: boolean;
}

const DEFAULT_CV_DATA: CvData = {
  personal: {
    fullName: 'Kavindu Perera',
    jobTitle: 'Junior Administrative Officer / Trainee Executive',
    email: 'kavindu.perera@email.com',
    phone: '+94 77 123 4567',
    address: 'No. 45, Temple Road, Nugegoda',
    district: 'Colombo, Sri Lanka',
    nicPassport: '200114503920 / N7845920',
    nationality: 'Sri Lankan',
    civilStatus: 'Single',
    photoUrl: '',
    photoPosition: 'center',
    photoScale: 100,
    photoX: 0,
    photoY: 0,
    photoFrameShape: 'rounded',
    photoFit: 'contain',
    summary: 'Motivated and detail-oriented graduate seeking an entry-level position in administrative operations or management. Equipped with strong communication skills, proficiency in MS Office, and a passion for organizational excellence.',
  },
  education: [
    {
      id: '1',
      degree: 'G.C.E. Advanced Level (A/L) - Commerce Stream',
      institution: 'Royal College, Colombo',
      year: '2022',
      details: 'Passed with 2 As and 1 B in Accounting, Business Studies, and Economics.'
    },
    {
      id: '2',
      degree: 'Diploma in Information Technology (NVQ Level 4)',
      institution: 'VTA / Vocational Training Authority',
      year: '2023',
      details: 'Completed modules in MS Office, Computer Networking, and Basic Accounting.'
    }
  ],
  experience: [
    {
      id: '1',
      title: 'Customer Service Representative (Trainee)',
      company: 'ABC Solutions PLC',
      period: '2023 - 2024',
      description: 'Handled customer inquiries via telephone and email. Assisted in managing daily administrative records and data entry using MS Excel.'
    }
  ],
  skills: ['MS Office & Excel', 'Data Entry', 'Customer Support', 'Time Management', 'Team Leadership', 'Basic Bookkeeping'],
  languages: ['English (Professional Work)', 'Sinhala (Native)'],
  extracurricular: [
    'Senior School Prefect - Royal College (2021 - 2022)',
    'Vice Captain - School Basketball Team',
    'Active Member - School Interact & Toastmasters Club'
  ],
  includeDeclaration: true,
  declarationText: 'I hereby declare that the details furnished above are true and accurate to the best of my knowledge and belief.',
  referees: [
    {
      name: 'Dr. Anura Jayasinghe',
      designation: 'Senior Lecturer / Academic Head',
      company: 'Vocational Training Institute',
      phone: '+94 71 987 6543',
      email: 'anura.jayasinghe@vta.lk'
    },
    {
      name: 'Mrs. Dilhani Silva',
      designation: 'Human Resources Manager',
      company: 'ABC Solutions PLC',
      phone: '+94 77 456 7890',
      email: 'dilhani.s@abcsolutions.lk'
    }
  ],
  themeColor: '#1b2b65', // Royal Deep Blue
  templateId: 'fresher',
  isGlobalMode: false,
};

const SUMMARY_PRESETS = [
  {
    role: 'Trainee / Fresh Graduate / School Leaver',
    text: 'Energetic and enthusiastic school leaver with strong analytical and communication skills. Eager to contribute to team success through hard work, attention to detail, and a quick willingness to learn.'
  },
  {
    role: 'Office Admin / Clerical Executive',
    text: 'Dedicated Administrative Professional with experience in customer support, documentation, and office coordination. Skilled in MS Office, spreadsheet management, and maintaining professional business relationships.'
  },
  {
    role: 'Technician / Electrician / Technical Assistant (NVQ)',
    text: 'Hands-on Technical Specialist (NVQ Level 4 qualified) with practical expertise in electrical wiring, maintenance, and equipment troubleshooting. Committed to strict workplace safety standards and efficient problem-solving.'
  },
  {
    role: 'Overseas & Foreign Job Seeker',
    text: 'Adaptable and hard-working professional seeking overseas employment opportunities. Fluent in English, experienced in fast-paced operational environments, and ready to relocate immediately.'
  },
  {
    role: 'Customer Service & Sales Representative',
    text: 'Results-driven Sales & Customer Service Specialist dedicated to maximizing client satisfaction and driving store sales. Proficient in POS systems, inventory management, and client communication.'
  }
];

const PRESET_COLORS = [
  { name: 'Royal Deep Blue', hex: '#1b2b65', ring: 'ring-[#1b2b65]' },
  { name: 'Emerald Green', hex: '#047857', ring: 'ring-emerald-600' },
  { name: 'Slate Charcoal', hex: '#1e293b', ring: 'ring-slate-700' },
  { name: 'Royal Indigo', hex: '#3b82f6', ring: 'ring-blue-500' },
  { name: 'Crimson Red', hex: '#9f1239', ring: 'ring-rose-600' },
];

export default function CvBuilder() {
  const [cv, setCv] = useState<CvData>(() => {
    try {
      const saved = localStorage.getItem('jobnews_cv_builder_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CV_DATA,
          ...parsed,
          personal: { ...DEFAULT_CV_DATA.personal, ...(parsed.personal || {}) },
          education: Array.isArray(parsed.education) ? parsed.education : DEFAULT_CV_DATA.education,
          experience: Array.isArray(parsed.experience) ? parsed.experience : DEFAULT_CV_DATA.experience,
          skills: Array.isArray(parsed.skills) ? parsed.skills : DEFAULT_CV_DATA.skills,
          languages: Array.isArray(parsed.languages) ? parsed.languages : DEFAULT_CV_DATA.languages,
          extracurricular: Array.isArray(parsed.extracurricular) ? parsed.extracurricular : DEFAULT_CV_DATA.extracurricular,
          referees: Array.isArray(parsed.referees) ? parsed.referees : DEFAULT_CV_DATA.referees,
          includeDeclaration: typeof parsed.includeDeclaration === 'boolean' ? parsed.includeDeclaration : true,
          declarationText: parsed.declarationText || DEFAULT_CV_DATA.declarationText,
          templateId: ['executive', 'fresher', 'srilankan', 'classic'].includes(parsed.templateId) ? parsed.templateId : 'fresher',
        };
      }
    } catch (e) {}
    return DEFAULT_CV_DATA;
  });

  const [photoPreview, setPhotoPreview] = useState<string>(cv.personal.photoUrl || '');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);

  // Auto-Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jobnews_cv_builder_data', JSON.stringify(cv));
    } catch (e) {}
  }, [cv]);

  // Handle Photo Canvas Sanitization
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please upload a valid JPEG, PNG, or WEBP photo.');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert('Photo file size must be less than 3 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxSize = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        setPhotoPreview(dataUrl);
        setCv(prev => ({
          ...prev,
          personal: { ...prev.personal, photoUrl: dataUrl }
        }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Interactive Mouse Drag Photo Repositioning
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialPhotoOffset, setInitialPhotoOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handlePhotoMouseDown = (e: React.MouseEvent) => {
    if (!cv.personal.photoUrl) return;
    e.preventDefault();
    setIsDraggingPhoto(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPhotoOffset({ x: cv.personal.photoX || 0, y: cv.personal.photoY || 0 });
  };

  const handlePhotoMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingPhoto) return;
    const deltaX = Math.round((e.clientX - dragStart.x) / 1.5);
    const deltaY = Math.round((e.clientY - dragStart.y) / 1.5);
    
    const newX = Math.max(-100, Math.min(100, initialPhotoOffset.x + deltaX));
    const newY = Math.max(-100, Math.min(100, initialPhotoOffset.y + deltaY));

    setCv(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        photoX: newX,
        photoY: newY,
      }
    }));
  };

  const handlePhotoMouseUp = () => {
    setIsDraggingPhoto(false);
  };

  const resetPhotoPosition = () => {
    setCv(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        photoPosition: 'center',
        photoScale: 100,
        photoX: 0,
        photoY: 0,
      }
    }));
  };

  const removePhoto = () => {
    setPhotoPreview('');
    setCv(prev => ({
      ...prev,
      personal: { ...prev.personal, photoUrl: '', photoX: 0, photoY: 0, photoScale: 100 }
    }));
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const resetToDefault = () => {
    if (confirm('Are you sure you want to reset all fields to default example values?')) {
      setCv(DEFAULT_CV_DATA);
      setPhotoPreview('');
      setSelectedPresetIndex(null);
      localStorage.removeItem('jobnews_cv_builder_data');
    }
  };

  // Extract Initials for profile photo placeholder
  const getInitials = (name: string) => {
    if (!name) return 'KP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Field Array Handlers
  const addEducation = () => {
    const newItem: EducationItem = {
      id: Date.now().toString(),
      degree: 'Course / Qualification Name',
      institution: 'Institute or College',
      year: '2024',
      details: 'Key subjects passed or achievements.'
    };
    setCv(prev => ({ ...prev, education: [...prev.education, newItem] }));
  };

  const removeEducation = (id: string) => {
    setCv(prev => ({ ...prev, education: prev.education.filter(item => item.id !== id) }));
  };

  const addExperience = () => {
    const newItem: ExperienceItem = {
      id: Date.now().toString(),
      title: 'Job Position Title',
      company: 'Company / Firm Name',
      period: '2023 - Present',
      description: 'Key job duties and achievements.'
    };
    setCv(prev => ({ ...prev, experience: [...prev.experience, newItem] }));
  };

  const removeExperience = (id: string) => {
    setCv(prev => ({ ...prev, experience: prev.experience.filter(item => item.id !== id) }));
  };

  const addReferee = () => {
    const newRef = {
      name: 'Mr. Nimal Gunawardena',
      designation: 'Senior Manager / Department Head',
      company: 'XYZ Lanka (Pvt) Ltd',
      phone: '+94 71 234 5678',
      email: 'nimal.g@company.lk'
    };
    setCv(prev => ({ ...prev, referees: [...prev.referees, newRef] }));
  };

  const removeReferee = (index: number) => {
    setCv(prev => ({ ...prev, referees: prev.referees.filter((_, i) => i !== index) }));
  };

  const addExtracurricular = () => {
    setCv(prev => ({ ...prev, extracurricular: [...prev.extracurricular, 'School Prefect / Club Committee Member'] }));
  };

  const removeExtracurricular = (index: number) => {
    setCv(prev => ({ ...prev, extracurricular: prev.extracurricular.filter((_, i) => i !== index) }));
  };

  return (
    <div className="min-h-screen bg-[#f3f6fc] dark:bg-slate-950 py-8 px-3 sm:px-6 lg:px-8 relative font-sans">
      
      {/* Pixel-Perfect A4 PDF Print Stylesheet */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0mm !important;
        }
        @media print {
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            overflow: hidden !important;
          }
          nav, footer, header, .no-print, [class*="Navbar"], [class*="Footer"], [class*="MobileBottomNav"] {
            display: none !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
          }
          body * {
            visibility: hidden !important;
          }
          #cv-print-area, #cv-print-area * {
            visibility: visible !important;
          }
          #cv-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 !important;
            padding: 8mm 12mm 8mm 12mm !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* HERO BANNER - MATCHING EXACT BOLT.NEW DEEP ROYAL BLUE GRADIENT & VECTOR ACCENTS */}
      <div className="no-print max-w-7xl mx-auto mb-8 bg-gradient-to-br from-[#1b2b65] via-[#152046] to-[#0d1430] text-white p-6 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Background Vector Curve Accents */}
        <svg className="absolute top-0 right-0 w-[450px] h-[450px] opacity-15 pointer-events-none" viewBox="0 0 500 500" fill="none">
          <circle cx="350" cy="150" r="250" stroke="white" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="350" cy="150" r="350" stroke="white" strokeWidth="1.5" />
          <circle cx="350" cy="150" r="150" stroke="white" strokeWidth="1" />
        </svg>

        <div className="relative z-10 space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white/95 text-xs font-semibold rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            100% Free Professional CV Builder for Sri Lanka & Global Markets
          </div>

          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Create Your Professional Resume / CV <span className="text-sky-300">in 5 Minutes</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              100% Free, auto-saved, zero server lag. Designed specifically for O/L, A/L school leavers, NVQ students, freshers and overseas job seekers.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-950/40 transition-all hover:scale-105 active:scale-95 border border-emerald-400/30"
            >
              <Download className="w-4.5 h-4.5 stroke-[2.5]" /> Download A4 PDF
            </button>

            <button
              onClick={resetToDefault}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Form
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: FORM EDITORS (6 Cols) */}
        <div className="no-print lg:col-span-6 space-y-6">

          {/* COLOR ACCENT & TARGET MARKET CARD (BOLT.NEW STYLE) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/70 dark:border-slate-800 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-900/50">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    Color accent & target market
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                    Personalise the visual style of your CV
                  </p>
                </div>
              </div>
            </div>

            {/* Target Market Switch Pill */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 inline-flex items-center gap-3">
              <button
                onClick={() => setCv(prev => ({ ...prev, isGlobalMode: !prev.isGlobalMode }))}
                className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xs border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 inline-flex items-center gap-2 hover:bg-slate-50 transition-all"
              >
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Global International Mode</span>
                <span className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${cv.isGlobalMode ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <span className={`w-3 h-3 rounded-full bg-white transition-transform ${cv.isGlobalMode ? 'translate-x-4' : 'translate-x-0'}`} />
                </span>
              </button>
            </div>

            {/* Preset Color Swatches */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Preset colors:</span>
              <div className="flex items-center gap-3">
                {PRESET_COLORS.map(color => {
                  const isSelected = cv.themeColor === color.hex;
                  return (
                    <button
                      key={color.hex}
                      onClick={() => setCv(prev => ({ ...prev, themeColor: color.hex }))}
                      className={`w-7 h-7 rounded-full transition-all flex items-center justify-center relative ${
                        isSelected ? 'ring-2 ring-blue-600 ring-offset-2 scale-110 shadow-sm' : 'hover:scale-105 border border-slate-200'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Template Layout Selector Gallery Cards */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Select CV Template Layout:</span>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'executive', name: 'Executive Corporate', desc: 'Adam Rose style dark top banner & 2-column progress bars' },
                  { id: 'fresher', name: 'Fresher Modern', desc: 'Hannah Perkins style left sidebar & dot ratings' },
                  { id: 'srilankan', name: 'Sri Lankan Technical', desc: 'Kusal Duminda style full blue sidebar & pill badges' },
                  { id: 'classic', name: 'Minimal Classic', desc: 'Traditional serif typography & clean dividers' },
                ].map(tmpl => {
                  const isSelected = cv.templateId === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => setCv(prev => ({ ...prev, templateId: tmpl.id as any }))}
                      className={`p-3 text-left rounded-2xl border transition-all relative space-y-1 ${
                        isSelected
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-500/20 shadow-sm'
                          : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{tmpl.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-normal leading-tight">{tmpl.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 1: Personal Details */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/70 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-900/50">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  1. Personal Information
                </h2>
              </div>
              <ChevronUp className="w-5 h-5 text-slate-400" />
            </div>

            {/* Profile Photo Upload Card (Matching Bolt.new Initial Badge & Layout) */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 flex items-start gap-4">
              <div className={`w-24 h-24 ${getPhotoFrameClass(cv.personal.photoFrameShape)} bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-extrabold text-2xl flex items-center justify-center border-2 border-blue-200/80 dark:border-blue-800 flex-shrink-0 shadow-sm overflow-hidden relative`}>
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    style={getPhotoTransformStyle(cv.personal.photoScale, cv.personal.photoX, cv.personal.photoY)}
                    className={`w-full h-full ${getPhotoFitClass(cv.personal.photoFit)} ${getPhotoPositionClass(cv.personal.photoPosition)} ${getPhotoFrameClass(cv.personal.photoFrameShape)}`}
                  />
                ) : (
                  getInitials(cv.personal.fullName)
                )}
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Profile photo <span className="text-slate-400 font-normal">(optional)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                    Show employers the person behind your experience.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <label className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-2xs transition-all">
                    Choose file
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-slate-400">No file chosen</span>
                  {photoPreview && (
                    <button
                      onClick={removePhoto}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-2"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                {photoPreview && (
                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/60 space-y-3 bg-white dark:bg-slate-900/60 p-3.5 rounded-2xl border">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-900 dark:text-white">
                        🎯 Fine-Tune Photo Position & Frame:
                      </label>
                      <button
                        type="button"
                        onClick={resetPhotoPosition}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 underline"
                      >
                        Reset Position
                      </button>
                    </div>

                    {/* Photo Fit Mode (Full Original vs Cover Crop) */}
                    <div className="space-y-1">
                      <label className="block text-[10.5px] font-bold text-slate-700 dark:text-slate-300">
                        Original Image Crop Protection:
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { id: 'contain', label: '🖼️ 100% Full Original (Zero Cut-off)' },
                          { id: 'cover', label: '✂️ Fill Box (Crop Fill)' },
                        ].map(fitMode => (
                          <button
                            key={fitMode.id}
                            type="button"
                            onClick={() => setCv(prev => ({
                              ...prev,
                              personal: { ...prev.personal, photoFit: fitMode.id as any }
                            }))}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-xl border transition-all ${
                              (cv.personal.photoFit || 'contain') === fitMode.id
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {fitMode.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Frame Shape Selector */}
                    <div className="space-y-1">
                      <label className="block text-[10.5px] font-bold text-slate-700 dark:text-slate-300">
                        Frame Shape:
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {[
                          { id: 'rounded', label: '🟦 Rounded Square (Recommended)' },
                          { id: 'circle', label: '⭕ Circle' },
                          { id: 'square', label: '🟩 Square' },
                        ].map(shape => (
                          <button
                            key={shape.id}
                            type="button"
                            onClick={() => setCv(prev => ({
                              ...prev,
                              personal: { ...prev.personal, photoFrameShape: shape.id as any }
                            }))}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-xl border transition-all ${
                              (cv.personal.photoFrameShape || 'rounded') === shape.id
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {shape.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5">
                      {[
                        { id: 'center', label: '🎯 Center' },
                        { id: 'top', label: '⬆️ Top Focus' },
                        { id: 'bottom', label: '⬇️ Bottom Focus' },
                      ].map(pos => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setCv(prev => ({
                            ...prev,
                            personal: { ...prev.personal, photoPosition: pos.id as any }
                          }))}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-xl border transition-all ${
                            (cv.personal.photoPosition || 'center') === pos.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>

                    {/* Sliders Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[10.5px]">
                      {/* Zoom Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                          <span>🔍 Zoom:</span>
                          <span className="font-mono">{cv.personal.photoScale || 100}%</span>
                        </div>
                        <input
                          type="range"
                          min="100"
                          max="200"
                          step="2"
                          value={cv.personal.photoScale || 100}
                          onChange={(e) => setCv(prev => ({
                            ...prev,
                            personal: { ...prev.personal, photoScale: parseInt(e.target.value) }
                          }))}
                          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                      </div>

                      {/* Up/Down Y Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                          <span>↕️ Up/Down:</span>
                          <span className="font-mono">{cv.personal.photoY || 0}</span>
                        </div>
                        <input
                          type="range"
                          min="-60"
                          max="60"
                          step="1"
                          value={cv.personal.photoY || 0}
                          onChange={(e) => setCv(prev => ({
                            ...prev,
                            personal: { ...prev.personal, photoY: parseInt(e.target.value) }
                          }))}
                          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                      </div>

                      {/* Left/Right X Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
                          <span>↔️ Left/Right:</span>
                          <span className="font-mono">{cv.personal.photoX || 0}</span>
                        </div>
                        <input
                          type="range"
                          min="-60"
                          max="60"
                          step="1"
                          value={cv.personal.photoX || 0}
                          onChange={(e) => setCv(prev => ({
                            ...prev,
                            personal: { ...prev.personal, photoX: parseInt(e.target.value) }
                          }))}
                          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold italic">
                      🖐️ Tip: You can also click & drag the mouse directly over your profile photo in the Live Preview to center it!
                    </p>
                  </div>
                )}

                <p className="text-[10px] text-slate-400 font-normal">JPG, PNG or WEBP (Max 3MB). Processed locally in your browser.</p>
              </div>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full name *</label>
                <input
                  type="text"
                  value={cv.personal.fullName}
                  onChange={(e) => setCv(prev => ({ ...prev, personal: { ...prev.personal, fullName: e.target.value } }))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all shadow-2xs font-medium"
                  placeholder="Kavindu Perera"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Desired Job Title *</label>
                <input
                  type="text"
                  value={cv.personal.jobTitle}
                  onChange={(e) => setCv(prev => ({ ...prev, personal: { ...prev.personal, jobTitle: e.target.value } }))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all shadow-2xs font-medium"
                  placeholder="Junior Administrative Officer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={cv.personal.email}
                  onChange={(e) => setCv(prev => ({ ...prev, personal: { ...prev.personal, email: e.target.value } }))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all shadow-2xs font-medium"
                  placeholder="name@gmail.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number *</label>
                <input
                  type="text"
                  value={cv.personal.phone}
                  onChange={(e) => setCv(prev => ({ ...prev, personal: { ...prev.personal, phone: e.target.value } }))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all shadow-2xs font-medium"
                  placeholder="+94 77 123 4567"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">City / Address</label>
                <input
                  type="text"
                  value={cv.personal.address}
                  onChange={(e) => setCv(prev => ({ ...prev, personal: { ...prev.personal, address: e.target.value } }))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all shadow-2xs font-medium"
                  placeholder="Nugegoda, Sri Lanka"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">NIC / Passport No.</label>
                <input
                  type="text"
                  value={cv.personal.nicPassport}
                  onChange={(e) => setCv(prev => ({ ...prev, personal: { ...prev.personal, nicPassport: e.target.value } }))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all shadow-2xs font-medium"
                  placeholder="200114503920 / N7845920"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Career Objective & 1-Click Presets */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/70 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-100 dark:border-amber-900/50">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  2. Career Objective / Summary
                </h2>
              </div>
              <ChevronUp className="w-5 h-5 text-slate-400" />
            </div>

            {/* 1-Click Preset Chips (Bolt.new Style) */}
            <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 space-y-2">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 1-Click English Career Objectives:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {SUMMARY_PRESETS.map((preset, idx) => {
                  const isSelected = selectedPresetIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedPresetIndex(idx);
                        setCv(prev => ({ ...prev, personal: { ...prev.personal, summary: preset.text } }));
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 hover:bg-amber-100 text-slate-700 dark:text-slate-200 border-amber-200 dark:border-slate-700'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-amber-600" />}
                      {preset.role}
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              rows={4}
              value={cv.personal.summary}
              onChange={(e) => setCv(prev => ({ ...prev, personal: { ...prev.personal, summary: e.target.value } }))}
              className="w-full px-4 py-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all font-medium leading-relaxed"
              placeholder="Write a brief 2-3 sentence introduction about your skills and goals..."
            />
          </div>

          {/* SECTION 3: Educational Qualifications */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/70 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-900/50">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  3. Educational & Vocational Qualifications
                </h2>
              </div>
              <button
                onClick={addEducation}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Add Qualification
              </button>
            </div>

            {cv.education.map((edu, index) => (
              <div key={edu.id} className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 relative space-y-3">
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-rose-500 transition-colors p-1"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ENTRY #{index + 1}</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCv(prev => ({
                        ...prev,
                        education: prev.education.map(item => item.id === edu.id ? { ...item, degree: val } : item)
                      }));
                    }}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all font-medium"
                    placeholder="Qualification (e.g. G.C.E A/L or NVQ Level 4)"
                  />
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCv(prev => ({
                        ...prev,
                        education: prev.education.map(item => item.id === edu.id ? { ...item, institution: val } : item)
                      }));
                    }}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all font-medium"
                    placeholder="School / College / Institute Name"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCv(prev => ({
                        ...prev,
                        education: prev.education.map(item => item.id === edu.id ? { ...item, year: val } : item)
                      }));
                    }}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all font-medium"
                    placeholder="Year (e.g. 2023)"
                  />
                  <input
                    type="text"
                    value={edu.details}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCv(prev => ({
                        ...prev,
                        education: prev.education.map(item => item.id === edu.id ? { ...item, details: val } : item)
                      }));
                    }}
                    className="sm:col-span-2 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all font-medium"
                    placeholder="Results or Key Details (e.g. Passed with 3 As)"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* SECTION 4: Work Experience */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/70 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 border border-purple-100 dark:border-purple-900/50">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  4. Work Experience (Skip if Fresher)
                </h2>
              </div>
              <button
                onClick={addExperience}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Add Experience
              </button>
            </div>

            {cv.experience.map((exp, index) => (
              <div key={exp.id} className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 relative space-y-3">
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-rose-500 transition-colors p-1"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">EXPERIENCE #{index + 1}</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCv(prev => ({
                        ...prev,
                        experience: prev.experience.map(item => item.id === exp.id ? { ...item, title: val } : item)
                      }));
                    }}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all font-medium"
                    placeholder="Job Position Title"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCv(prev => ({
                        ...prev,
                        experience: prev.experience.map(item => item.id === exp.id ? { ...item, company: val } : item)
                      }));
                    }}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all font-medium"
                    placeholder="Company or Organization Name"
                  />
                </div>
                <input
                  type="text"
                  value={exp.period}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCv(prev => ({
                      ...prev,
                      experience: prev.experience.map(item => item.id === exp.id ? { ...item, period: val } : item)
                    }));
                  }}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all font-medium"
                  placeholder="Period (e.g. 2022 - 2024 or Present)"
                />
                <textarea
                  rows={2}
                  value={exp.description}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCv(prev => ({
                      ...prev,
                      experience: prev.experience.map(item => item.id === exp.id ? { ...item, description: val } : item)
                    }));
                  }}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all font-medium leading-relaxed"
                  placeholder="Responsibilities & Key Duties..."
                />
              </div>
            ))}
          </div>

          {/* SECTION 5: Key Skills */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/70 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-100 dark:border-teal-900/50">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                5. Key Skills & Competencies
              </h2>
            </div>

            <div>
              <input
                type="text"
                value={(cv.skills || []).join(', ')}
                onChange={(e) => {
                  const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  setCv(prev => ({ ...prev, skills: arr }));
                }}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all shadow-2xs font-medium"
                placeholder="e.g. MS Office, Data Entry, Time Management, Teamwork"
              />
              <p className="text-[10px] text-slate-400 font-normal mt-1.5">Separate skills with commas.</p>
            </div>
          </div>

          {/* SECTION 6: Extracurricular Activities & School Clubs (Key for Freshers) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/70 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    6. School Clubs, Sports & Achievements
                  </h2>
                  <p className="text-[11px] text-slate-400 font-normal">Fills CV space & highlights leadership for freshers</p>
                </div>
              </div>
              <button
                onClick={addExtracurricular}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Add Activity
              </button>
            </div>

            <div className="space-y-3">
              {(cv.extracurricular || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCv(prev => {
                        const updated = [...(prev.extracurricular || [])];
                        updated[idx] = val;
                        return { ...prev, extracurricular: updated };
                      });
                    }}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all font-medium"
                    placeholder="e.g. Senior School Prefect / Captain of Basketball Team"
                  />
                  <button
                    onClick={() => removeExtracurricular(idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 7: Languages Spoken */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/70 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0 border border-cyan-100 dark:border-cyan-900/50">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                7. Languages Spoken
              </h2>
            </div>

            <div>
              <input
                type="text"
                value={(cv.languages || []).join(', ')}
                onChange={(e) => {
                  const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  setCv(prev => ({ ...prev, languages: arr }));
                }}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all shadow-2xs font-medium"
                placeholder="e.g. English (Professional Work), Sinhala (Native), Tamil (Basic)"
              />
              <p className="text-[10px] text-slate-400 font-normal mt-1.5">Separate languages with commas.</p>
            </div>
          </div>

          {/* SECTION 8: Non-Related Referees */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/70 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-100 dark:border-emerald-900/50">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  8. Non-Related Referees
                </h2>
              </div>
              <button
                onClick={addReferee}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Add Referee
              </button>
            </div>

            {(cv.referees || []).map((ref, idx) => (
              <div key={idx} className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 relative space-y-3">
                <button
                  onClick={() => removeReferee(idx)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-rose-500 transition-colors p-1"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">REFEREE #{idx + 1}</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={ref.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCv(prev => {
                        const updated = [...prev.referees];
                        updated[idx] = { ...updated[idx], name: val };
                        return { ...prev, referees: updated };
                      });
                    }}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    placeholder="Full Name (e.g. Dr. Anura Jayasinghe)"
                  />
                  <input
                    type="text"
                    value={ref.designation}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCv(prev => {
                        const updated = [...prev.referees];
                        updated[idx] = { ...updated[idx], designation: val };
                        return { ...prev, referees: updated };
                      });
                    }}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    placeholder="Designation / Position"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={ref.company}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCv(prev => {
                        const updated = [...prev.referees];
                        updated[idx] = { ...updated[idx], company: val };
                        return { ...prev, referees: updated };
                      });
                    }}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    placeholder="Company / University Name"
                  />
                  <input
                    type="text"
                    value={ref.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCv(prev => {
                        const updated = [...prev.referees];
                        updated[idx] = { ...updated[idx], phone: val };
                        return { ...prev, referees: updated };
                      });
                    }}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    placeholder="Phone Number (+94 ...)"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* SECTION 9: Sri Lankan Personal Declaration & Signature Line */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200/70 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-100 dark:border-rose-900/50">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    9. Declaration & Signature Line
                  </h2>
                  <p className="text-[11px] text-slate-400 font-normal">Fills bottom CV space professionally</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={cv.includeDeclaration}
                  onChange={(e) => setCv(prev => ({ ...prev, includeDeclaration: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {cv.includeDeclaration && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Declaration Statement</label>
                <textarea
                  rows={3}
                  value={cv.declarationText}
                  onChange={(e) => setCv(prev => ({ ...prev, declarationText: e.target.value }))}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium leading-relaxed"
                  placeholder="I hereby certify that..."
                />
                <p className="text-[10px] text-slate-400">Includes Date & Signature lines at the bottom of your CV PDF.</p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: REAL-TIME A4 LIVE PREVIEW (6 Cols) */}
        <div className="lg:col-span-6 sticky top-6 space-y-4 max-h-[calc(100vh-2.5rem)] flex flex-col">
          
          {/* PREVIEW TOOLBAR & TEMPLATE SWITCHER */}
          <div className="no-print bg-[#152046] text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg flex-shrink-0 z-20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> Live A4 Preview
              </span>
            </div>

            {/* Template Selector Tabs */}
            <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15">
              {[
                { id: 'executive', label: 'Executive' },
                { id: 'fresher', label: 'Fresher' },
                { id: 'srilankan', label: 'Sri Lankan' },
                { id: 'classic', label: 'Classic' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setCv(prev => ({ ...prev, templateId: t.id as any }))}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    cv.templateId === t.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" /> Save PDF
            </button>
          </div>

          {/* A4 PRINT CONTAINER SCROLLABLE WRAPPER */}
          <div className="flex-1 overflow-y-auto rounded-2xl space-y-4 pr-0.5 overflow-x-hidden shadow-2xl">
            <div
              id="cv-print-area"
              className="bg-white text-slate-900 rounded-2xl min-h-[842px] border border-slate-200/80 text-xs font-sans relative overflow-hidden flex flex-col justify-between p-0"
              style={{ fontFamily: cv.templateId === 'classic' ? "'Georgia', serif" : "'Inter', system-ui, sans-serif" }}
            >
            {/* ------------------------------------------------------------- */}
            {/* TEMPLATE 1: "CANVA MODERN BLUE" (RICHARD SANCHEZ STYLE) */}
            {/* ------------------------------------------------------------- */}
            {cv.templateId === 'executive' && (
              <div className="flex-1 flex min-h-[842px]">
                {/* Left Sidebar - 32% Width Full Height Dark Navy */}
                <div className="w-[32%] text-white p-6 space-y-6 flex flex-col justify-between" style={{ backgroundColor: cv.themeColor || '#1b3044' }}>
                  <div className="space-y-6">
                    {/* Circular Photo */}
                    <div className="pt-2 text-center">
                      {cv.personal.photoUrl ? (
                        <div
                          onMouseDown={handlePhotoMouseDown}
                          onMouseMove={handlePhotoMouseMove}
                          onMouseUp={handlePhotoMouseUp}
                          onMouseLeave={handlePhotoMouseUp}
                          title="Click & Drag mouse to center photo"
                          className={`w-32 h-32 sm:w-36 sm:h-36 ${getPhotoFrameClass(cv.personal.photoFrameShape)} border-4 border-white/90 shadow-2xl mx-auto overflow-hidden bg-white relative cursor-grab active:cursor-grabbing group select-none transition-all`}
                        >
                          <img
                            src={cv.personal.photoUrl}
                            alt="Profile"
                            style={getPhotoTransformStyle(cv.personal.photoScale, cv.personal.photoX, cv.personal.photoY)}
                            className={`w-full h-full ${getPhotoFitClass(cv.personal.photoFit)} ${getPhotoPositionClass(cv.personal.photoPosition)} pointer-events-none select-none`}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-extrabold text-center p-1 pointer-events-none">
                            🖐️ Drag to position
                          </div>
                        </div>
                      ) : (
                        <div className={`w-28 h-28 ${getPhotoFrameClass(cv.personal.photoFrameShape)} bg-white/10 text-white font-extrabold text-2xl flex items-center justify-center mx-auto border-2 border-white/40 shadow-lg`}>
                          {getInitials(cv.personal.fullName)}
                        </div>
                      )}
                    </div>

                    {/* CONTACT */}
                    <div className="space-y-2 text-[10px]">
                      <h3 className="font-extrabold uppercase tracking-widest text-xs border-b border-white/30 pb-1 text-white">
                        CONTACT
                      </h3>
                      {cv.personal.phone && (
                        <p className="flex items-center gap-2 text-white/90 font-medium">
                          <span>📞</span> {cv.personal.phone}
                        </p>
                      )}
                      {cv.personal.email && (
                        <p className="flex items-center gap-2 text-white/90 font-medium break-all">
                          <span>✉️</span> {cv.personal.email}
                        </p>
                      )}
                      {cv.personal.address && (
                        <p className="flex items-center gap-2 text-white/90 font-medium">
                          <span>📍</span> {cv.personal.address}
                        </p>
                      )}
                      {cv.personal.nicPassport && (
                        <p className="flex items-center gap-2 text-white/90 font-medium">
                          <span>💳</span> NIC: {cv.personal.nicPassport}
                        </p>
                      )}
                    </div>

                    {/* EDUCATION */}
                    {(cv.education || []).length > 0 && (
                      <div className="space-y-2.5 text-[10px]">
                        <h3 className="font-extrabold uppercase tracking-widest text-xs border-b border-white/30 pb-1 text-white">
                          EDUCATION
                        </h3>
                        {(cv.education || []).map(edu => (
                          <div key={edu.id} className="space-y-0.5">
                            <p className="font-bold text-sky-200 text-[9.5px]">{edu.year}</p>
                            <h4 className="font-extrabold text-white text-[10.5px]">{edu.degree}</h4>
                            <p className="text-white/80 font-medium">{edu.institution}</p>
                            {edu.details && <p className="text-white/60 italic text-[9px]">{edu.details}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* SKILLS */}
                    {(cv.skills || []).length > 0 && (
                      <div className="space-y-2 text-[10px]">
                        <h3 className="font-extrabold uppercase tracking-widest text-xs border-b border-white/30 pb-1 text-white">
                          SKILLS
                        </h3>
                        <div className="space-y-1 text-white/90 font-medium">
                          {(cv.skills || []).map((skill, idx) => (
                            <p key={idx}>• {skill}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* LANGUAGES */}
                    {(cv.languages || []).length > 0 && (
                      <div className="space-y-2 text-[10px]">
                        <h3 className="font-extrabold uppercase tracking-widest text-xs border-b border-white/30 pb-1 text-white">
                          LANGUAGES
                        </h3>
                        <div className="space-y-1 text-white/90 font-medium">
                          {(cv.languages || []).map((lang, idx) => (
                            <p key={idx}>• {lang}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-[8.5px] text-white/50 font-semibold border-t border-white/20 pt-2">
                    Verified CV • JobNews.lk
                  </div>
                </div>

                {/* Right Main Panel - 68% Width White */}
                <div className="w-[68%] p-8 space-y-6 bg-white flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Header Name */}
                    <div className="space-y-1 border-b-2 pb-4" style={{ borderColor: cv.themeColor || '#1b3044' }}>
                      <h1 className="text-3xl font-black uppercase tracking-tight text-slate-950">
                        {cv.personal.fullName ? (
                          <>
                            <span>{cv.personal.fullName.split(' ')[0]} </span>
                            <span className="font-normal text-slate-700">{cv.personal.fullName.split(' ').slice(1).join(' ')}</span>
                          </>
                        ) : 'RICHARD SANCHEZ'}
                      </h1>
                      <p className="text-xs font-black tracking-widest uppercase text-slate-600">
                        {cv.personal.jobTitle || 'MARKETING MANAGER'}
                      </p>
                    </div>

                    {/* PROFILE SUMMARY */}
                    {cv.personal.summary && (
                      <div className="space-y-1.5">
                        <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1">
                          PROFILE
                        </h2>
                        <p className="text-[10.5px] text-slate-700 leading-relaxed font-normal">
                          {cv.personal.summary}
                        </p>
                      </div>
                    )}

                    {/* WORK EXPERIENCE (With Vertical Timeline Line) */}
                    {(cv.experience || []).length > 0 && (
                      <div className="space-y-2">
                        <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1">
                          WORK EXPERIENCE
                        </h2>
                        <div className="border-l-2 pl-4 space-y-4 pt-1" style={{ borderColor: cv.themeColor || '#1b3044' }}>
                          {(cv.experience || []).map(exp => (
                            <div key={exp.id} className="relative space-y-1">
                              {/* Timeline Node Bullet */}
                              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ backgroundColor: cv.themeColor || '#1b3044' }} />
                              <div className="flex justify-between items-start">
                                <h3 className="font-extrabold text-slate-950 text-[11px]">{exp.company}</h3>
                                <span className="text-[9.5px] font-extrabold text-slate-500">{exp.period}</span>
                              </div>
                              <p className="text-[10px] font-bold text-slate-700">{exp.title}</p>
                              {exp.description && (
                                <p className="text-[10px] text-slate-600 leading-relaxed pt-0.5">• {exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* EXTRACURRICULAR ACTIVITIES */}
                    {(cv.extracurricular || []).length > 0 && (
                      <div className="space-y-1.5">
                        <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1">
                          ACTIVITIES & ACHIEVEMENTS
                        </h2>
                        <div className="space-y-1 text-[10px] text-slate-700 font-medium">
                          {(cv.extracurricular || []).map((item, idx) => (
                            <p key={idx}>• {item}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* REFERENCES */}
                    {(cv.referees || []).length > 0 && (
                      <div className="space-y-2">
                        <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1">
                          REFERENCE
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                          {(cv.referees || []).map((ref, idx) => (
                            <div key={idx} className="space-y-0.5 text-[10px]">
                              <h4 className="font-bold text-slate-950 text-[10.5px]">{ref.name}</h4>
                              <p className="text-slate-700 font-semibold">{ref.company} / {ref.designation}</p>
                              <p className="text-slate-500">Phone: {ref.phone}</p>
                              <p className="text-slate-500">Email: {ref.email}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {cv.includeDeclaration && (
                    <div className="pt-3 border-t border-slate-300 space-y-3">
                      <div className="space-y-0.5">
                        <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-900">DECLARATION</h2>
                        <p className="text-[9.5px] text-slate-600 leading-relaxed italic">
                          "{cv.declarationText}"
                        </p>
                      </div>
                      <div className="flex justify-between items-end text-[9.5px] font-bold text-slate-800 pt-1">
                        <span>Date: .......................................</span>
                        <span>Signature: .......................................</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TEMPLATE 2: "CREATIVE PILL BADGES" (FRANCISCO ANDRADE STYLE) */}
            {/* ------------------------------------------------------------- */}
            {cv.templateId === 'fresher' && (
              <div className="flex-1 flex min-h-[842px]">
                {/* Left Sidebar - 33% Dynamic Theme Color */}
                <div className="w-[33%] text-white p-6 space-y-6 flex flex-col justify-between" style={{ backgroundColor: cv.themeColor || '#425b76' }}>
                  <div className="space-y-6">
                    {/* Circular Photo */}
                    <div className="pt-2 text-center">
                      {cv.personal.photoUrl ? (
                        <div
                          onMouseDown={handlePhotoMouseDown}
                          onMouseMove={handlePhotoMouseMove}
                          onMouseUp={handlePhotoMouseUp}
                          onMouseLeave={handlePhotoMouseUp}
                          title="Click & Drag mouse to center photo"
                          className={`w-32 h-32 sm:w-36 sm:h-36 ${getPhotoFrameClass(cv.personal.photoFrameShape)} border-4 border-white shadow-2xl mx-auto overflow-hidden bg-white relative cursor-grab active:cursor-grabbing group select-none transition-all`}
                        >
                          <img
                            src={cv.personal.photoUrl}
                            alt="Profile"
                            style={getPhotoTransformStyle(cv.personal.photoScale, cv.personal.photoX, cv.personal.photoY)}
                            className={`w-full h-full ${getPhotoFitClass(cv.personal.photoFit)} ${getPhotoPositionClass(cv.personal.photoPosition)} pointer-events-none select-none`}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-extrabold text-center p-1 pointer-events-none">
                            🖐️ Drag to position
                          </div>
                        </div>
                      ) : (
                        <div className={`w-28 h-28 ${getPhotoFrameClass(cv.personal.photoFrameShape)} bg-white/20 text-white font-extrabold text-2xl flex items-center justify-center mx-auto border-2 border-white/40 shadow-lg`}>
                          {getInitials(cv.personal.fullName)}
                        </div>
                      )}
                    </div>

                    {/* CONTACT ME PILL */}
                    <div className="space-y-2.5 text-[10px]">
                      <div className="bg-black/25 text-white text-[10px] font-black uppercase rounded-full px-4 py-1.5 text-center shadow-xs tracking-wider border border-white/10">
                        CONTACT ME
                      </div>
                      {cv.personal.phone && <p className="text-white/90 font-medium">📞 {cv.personal.phone}</p>}
                      {cv.personal.email && <p className="text-white/90 font-medium break-all">✉️ {cv.personal.email}</p>}
                      {cv.personal.address && <p className="text-white/90 font-medium">📍 {cv.personal.address}</p>}
                      {cv.personal.nicPassport && <p className="text-white/90 font-medium">💳 NIC: {cv.personal.nicPassport}</p>}
                    </div>

                    {/* SKILLS PILL WITH 8-DOT RATINGS */}
                    {(cv.skills || []).length > 0 && (
                      <div className="space-y-2.5 text-[10px]">
                        <div className="bg-black/25 text-white text-[10px] font-black uppercase rounded-full px-4 py-1.5 text-center shadow-xs tracking-wider border border-white/10">
                          SKILLS
                        </div>
                        <div className="space-y-2">
                          {(cv.skills || []).map((skill, idx) => (
                            <div key={idx} className="space-y-1">
                              <span className="text-[9.5px] font-bold text-white block">• {skill}</span>
                              <div className="flex items-center gap-1 pl-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(dot => (
                                  <span
                                    key={dot}
                                    className={`w-2 h-2 rounded-full ${
                                      dot <= (8 - (idx % 3)) ? 'bg-white' : 'bg-white/30'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* LANGUAGE PILL */}
                    {(cv.languages || []).length > 0 && (
                      <div className="space-y-2 text-[10px]">
                        <div className="bg-black/25 text-white text-[10px] font-black uppercase rounded-full px-4 py-1.5 text-center shadow-xs tracking-wider border border-white/10">
                          LANGUAGE
                        </div>
                        <div className="space-y-1 text-white/90 font-medium">
                          {(cv.languages || []).map((lang, idx) => (
                            <p key={idx}>• {lang}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* REFERENCES PILL */}
                    {(cv.referees || []).length > 0 && (
                      <div className="space-y-2 text-[10px]">
                        <div className="bg-black/25 text-white text-[10px] font-black uppercase rounded-full px-4 py-1.5 text-center shadow-xs tracking-wider border border-white/10">
                          REFERENCES
                        </div>
                        <div className="space-y-2">
                          {(cv.referees || []).map((ref, idx) => (
                            <div key={idx} className="space-y-0.5 text-white/90">
                              <h4 className="font-extrabold text-white">{ref.name}</h4>
                              <p className="text-white/80 font-medium">{ref.company} / {ref.designation}</p>
                              <p className="text-white/70">Tel: {ref.phone}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-[8.5px] text-white/50 font-semibold border-t border-white/20 pt-2">
                    Verified CV • JobNews.lk
                  </div>
                </div>

                {/* Right Main Panel - 67% Light Grey Background */}
                <div className="w-[67%] p-8 space-y-6 bg-[#f8fafc] flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Candidate Name Header */}
                    <div className="space-y-1">
                      <h1 className="text-3xl font-black uppercase tracking-tight" style={{ color: cv.themeColor || '#425b76' }}>
                        {cv.personal.fullName || 'FRANCISCO ANDRADE'}
                      </h1>
                      <p className="text-sm font-black tracking-wider uppercase text-slate-700">
                        {cv.personal.jobTitle || 'Marketing Manager'}
                      </p>
                    </div>

                    {/* ABOUT ME PILL */}
                    {cv.personal.summary && (
                      <div className="space-y-2">
                        <div className="text-white text-[10px] font-black uppercase rounded-full px-5 py-1.5 inline-block shadow-xs tracking-wider" style={{ backgroundColor: cv.themeColor || '#425b76' }}>
                          ABOUT ME
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 text-[10.5px] text-slate-700 leading-relaxed font-medium shadow-2xs">
                          {cv.personal.summary}
                        </div>
                      </div>
                    )}

                    {/* EXPERIENCE PILL (Card Blocks) */}
                    {(cv.experience || []).length > 0 && (
                      <div className="space-y-2">
                        <div className="text-white text-[10px] font-black uppercase rounded-full px-5 py-1.5 inline-block shadow-xs tracking-wider" style={{ backgroundColor: cv.themeColor || '#425b76' }}>
                          EXPERIENCE
                        </div>
                        <div className="space-y-3">
                          {(cv.experience || []).map(exp => (
                            <div key={exp.id} className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-1 shadow-2xs">
                              <div className="flex justify-between items-start">
                                <h3 className="font-extrabold text-[11px]" style={{ color: cv.themeColor || '#425b76' }}>{exp.title}</h3>
                                <span className="text-[9.5px] font-extrabold text-slate-500">{exp.period}</span>
                              </div>
                              <p className="text-[10px] font-bold text-slate-800">{exp.company}</p>
                              {exp.description && (
                                <p className="text-[10px] text-slate-600 leading-relaxed pt-1">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* EDUCATION PILL */}
                    {(cv.education || []).length > 0 && (
                      <div className="space-y-2">
                        <div className="text-white text-[10px] font-black uppercase rounded-full px-5 py-1.5 inline-block shadow-xs tracking-wider" style={{ backgroundColor: cv.themeColor || '#425b76' }}>
                          EDUCATION
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-2 shadow-2xs">
                          {(cv.education || []).map(edu => (
                            <div key={edu.id} className="flex justify-between items-start border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <div>
                                <h3 className="font-bold text-slate-900 text-[10.5px]">{edu.degree}</h3>
                                <p className="text-[9.5px] text-slate-600 font-medium">{edu.institution}</p>
                                {edu.details && <p className="text-[9px] text-slate-500 italic">{edu.details}</p>}
                              </div>
                              <span className="text-[9.5px] font-bold text-slate-700">{edu.year}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {cv.includeDeclaration && (
                    <div className="pt-3 border-t border-slate-300 space-y-3">
                      <div className="space-y-0.5">
                        <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-900">DECLARATION</h2>
                        <p className="text-[9.5px] text-slate-600 leading-relaxed italic">
                          "{cv.declarationText}"
                        </p>
                      </div>
                      <div className="flex justify-between items-end text-[9.5px] font-bold text-slate-800 pt-1">
                        <span>Date: .......................................</span>
                        <span>Signature: .......................................</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TEMPLATE 3: "EXECUTIVE TIMELINE" (MARIANA ANDERSON STYLE) */}
            {/* ------------------------------------------------------------- */}
            {cv.templateId === 'srilankan' && (
              <div className="flex-1 flex min-h-[842px]">
                {/* Left Sidebar - 32% Charcoal Navy */}
                <div className="w-[32%] text-white p-6 space-y-6 flex flex-col justify-between" style={{ backgroundColor: cv.themeColor || '#263342' }}>
                  <div className="space-y-6">
                    {/* Circular Photo */}
                    <div className="pt-2 text-center">
                      {cv.personal.photoUrl ? (
                        <div
                          onMouseDown={handlePhotoMouseDown}
                          onMouseMove={handlePhotoMouseMove}
                          onMouseUp={handlePhotoMouseUp}
                          onMouseLeave={handlePhotoMouseUp}
                          title="Click & Drag mouse to center photo"
                          className={`w-32 h-32 sm:w-36 sm:h-36 ${getPhotoFrameClass(cv.personal.photoFrameShape)} border-4 border-white/90 shadow-2xl mx-auto overflow-hidden bg-white relative cursor-grab active:cursor-grabbing group select-none transition-all`}
                        >
                          <img
                            src={cv.personal.photoUrl}
                            alt="Profile"
                            style={getPhotoTransformStyle(cv.personal.photoScale, cv.personal.photoX, cv.personal.photoY)}
                            className={`w-full h-full ${getPhotoFitClass(cv.personal.photoFit)} ${getPhotoPositionClass(cv.personal.photoPosition)} pointer-events-none select-none`}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-extrabold text-center p-1 pointer-events-none">
                            🖐️ Drag to position
                          </div>
                        </div>
                      ) : (
                        <div className={`w-28 h-28 ${getPhotoFrameClass(cv.personal.photoFrameShape)} bg-white/10 text-white font-extrabold text-2xl flex items-center justify-center mx-auto border-2 border-white/40 shadow-lg`}>
                          {getInitials(cv.personal.fullName)}
                        </div>
                      )}
                    </div>

                    {/* Contact */}
                    <div className="space-y-2 text-[10px]">
                      <h3 className="font-extrabold text-xs border-b border-white/40 pb-1 text-white">Contact</h3>
                      {cv.personal.phone && <p className="text-white/90 font-medium">Phone: {cv.personal.phone}</p>}
                      {cv.personal.email && <p className="text-white/90 font-medium break-all">Email: {cv.personal.email}</p>}
                      {cv.personal.address && <p className="text-white/90 font-medium">Address: {cv.personal.address}</p>}
                      {cv.personal.nicPassport && <p className="text-white/90 font-medium">NIC: {cv.personal.nicPassport}</p>}
                    </div>

                    {/* Education */}
                    {(cv.education || []).length > 0 && (
                      <div className="space-y-2 text-[10px]">
                        <h3 className="font-extrabold text-xs border-b border-white/40 pb-1 text-white">Education</h3>
                        {(cv.education || []).map(edu => (
                          <div key={edu.id} className="space-y-0.5">
                            <p className="font-bold text-sky-200 text-[9.5px]">{edu.year}</p>
                            <h4 className="font-bold text-white text-[10.5px]">{edu.degree}</h4>
                            <p className="text-white/80">{edu.institution}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Expertise */}
                    {(cv.skills || []).length > 0 && (
                      <div className="space-y-2 text-[10px]">
                        <h3 className="font-extrabold text-xs border-b border-white/40 pb-1 text-white">Expertise</h3>
                        <div className="space-y-1 text-white/90 font-medium">
                          {(cv.skills || []).map((skill, idx) => (
                            <p key={idx}>• {skill}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Language */}
                    {(cv.languages || []).length > 0 && (
                      <div className="space-y-2 text-[10px]">
                        <h3 className="font-extrabold text-xs border-b border-white/40 pb-1 text-white">Language</h3>
                        <div className="space-y-1 text-white/90 font-medium">
                          {(cv.languages || []).map((lang, idx) => (
                            <p key={idx}>{lang}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-[8.5px] text-white/50 font-semibold border-t border-white/20 pt-2">
                    Verified CV • JobNews.lk
                  </div>
                </div>

                {/* Right Main Panel - 68% White */}
                <div className="w-[68%] p-8 space-y-6 bg-white flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Header Name & Wide Tracked Title */}
                    <div className="space-y-1">
                      <h1 className="text-3xl font-black tracking-tight text-slate-950">
                        {cv.personal.fullName || 'Mariana Anderson'}
                      </h1>
                      <p className="text-xs font-semibold tracking-[0.25em] uppercase text-slate-600">
                        {cv.personal.jobTitle || 'M a r k e t i n g   M a n a g e r'}
                      </p>
                    </div>

                    {/* SUMMARY */}
                    {cv.personal.summary && (
                      <div className="space-y-1.5">
                        <p className="text-[10.5px] text-slate-700 leading-relaxed font-normal">
                          {cv.personal.summary}
                        </p>
                      </div>
                    )}

                    {/* EXPERIENCE (Timeline Nodes) */}
                    {(cv.experience || []).length > 0 && (
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight text-slate-950 border-b border-slate-300 pb-1">
                          Experience
                        </h2>
                        <div className="space-y-4 pt-1">
                          {(cv.experience || []).map(exp => (
                            <div key={exp.id} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full border-2 bg-white" style={{ borderColor: cv.themeColor || '#263342' }} />
                                <span className="text-[10px] font-extrabold text-slate-900">{exp.period}</span>
                              </div>
                              <div className="pl-4 border-l border-slate-300 space-y-0.5 ml-1">
                                <p className="text-[9.5px] text-slate-500 font-semibold">{exp.company}</p>
                                <h3 className="font-extrabold text-slate-950 text-[11px]">{exp.title}</h3>
                                {exp.description && (
                                  <p className="text-[10px] text-slate-600 leading-relaxed pt-0.5">{exp.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* REFERENCE */}
                    {(cv.referees || []).length > 0 && (
                      <div className="space-y-2">
                        <h2 className="text-xl font-bold tracking-tight text-slate-950 border-b border-slate-300 pb-1">
                          Reference
                        </h2>
                        <div className="grid grid-cols-2 gap-4 pt-1">
                          {(cv.referees || []).map((ref, idx) => (
                            <div key={idx} className="space-y-0.5 text-[10px]">
                              <h4 className="font-extrabold text-slate-950 text-[10.5px]">{ref.name}</h4>
                              <p className="text-slate-700 font-semibold">{ref.company} / {ref.designation}</p>
                              <p className="text-slate-500">Phone: {ref.phone}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {cv.includeDeclaration && (
                    <div className="pt-3 border-t border-slate-300 space-y-3">
                      <div className="space-y-0.5">
                        <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-900">Declaration</h2>
                        <p className="text-[9.5px] text-slate-600 leading-relaxed italic">
                          "{cv.declarationText}"
                        </p>
                      </div>
                      <div className="flex justify-between items-end text-[9.5px] font-bold text-slate-800 pt-1">
                        <span>Date: .......................................</span>
                        <span>Signature: .......................................</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* TEMPLATE 4: "SAND & ESPRESSO" (DONNA STROUPE STYLE) */}
            {/* ------------------------------------------------------------- */}
            {cv.templateId === 'classic' && (
              <div className="flex-1 flex flex-col min-h-[842px]">
                {/* Top Header Banner Across Top Right in Dark Espresso */}
                <div className="flex">
                  <div className="w-[33%] bg-[#e2d7cd]" />
                  <div className="w-[67%] text-white p-6 space-y-1" style={{ backgroundColor: cv.themeColor || '#231917' }}>
                    <h1 className="text-3xl font-black uppercase tracking-wider text-white">
                      {cv.personal.fullName || 'DONNA STROUPE'}
                    </h1>
                    <p className="text-xs font-semibold tracking-wider text-amber-200 uppercase">
                      {cv.personal.jobTitle || 'Sales Representative'}
                    </p>
                  </div>
                </div>

                {/* Main Body Grid */}
                <div className="flex-1 flex">
                  {/* Left Sidebar - 33% Warm Sand/Beige */}
                  <div className="w-[33%] bg-[#e2d7cd] text-slate-900 p-6 space-y-6 flex flex-col justify-between">
                    <div className="space-y-6">
                      {/* Photo Overlapping Junction */}
                      <div className="-mt-14 text-center">
                        {cv.personal.photoUrl ? (
                          <div
                            onMouseDown={handlePhotoMouseDown}
                            onMouseMove={handlePhotoMouseMove}
                            onMouseUp={handlePhotoMouseUp}
                            onMouseLeave={handlePhotoMouseUp}
                            title="Click & Drag mouse to center photo"
                            className={`w-32 h-32 sm:w-36 sm:h-36 ${getPhotoFrameClass(cv.personal.photoFrameShape)} border-4 border-white shadow-2xl mx-auto overflow-hidden bg-white relative cursor-grab active:cursor-grabbing group select-none transition-all`}
                          >
                            <img
                              src={cv.personal.photoUrl}
                              alt="Profile"
                              style={getPhotoTransformStyle(cv.personal.photoScale, cv.personal.photoX, cv.personal.photoY)}
                              className={`w-full h-full ${getPhotoFitClass(cv.personal.photoFit)} ${getPhotoPositionClass(cv.personal.photoPosition)} pointer-events-none select-none`}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-extrabold text-center p-1 pointer-events-none">
                              🖐️ Drag to position
                            </div>
                          </div>
                        ) : (
                          <div className={`w-28 h-28 ${getPhotoFrameClass(cv.personal.photoFrameShape)} text-white font-extrabold text-2xl flex items-center justify-center mx-auto border-4 border-white shadow-xl`} style={{ backgroundColor: cv.themeColor || '#231917' }}>
                            {getInitials(cv.personal.fullName)}
                          </div>
                        )}
                      </div>

                      {/* CONTACT */}
                      <div className="space-y-2 text-[10px] pt-2">
                        {cv.personal.email && <p className="font-medium break-all">✉️ {cv.personal.email}</p>}
                        {cv.personal.phone && <p className="font-medium">📞 {cv.personal.phone}</p>}
                        {cv.personal.address && <p className="font-medium">📍 {cv.personal.address}</p>}
                        {cv.personal.nicPassport && <p className="font-medium">💳 NIC: {cv.personal.nicPassport}</p>}
                      </div>

                      {/* EDUCATION */}
                      {(cv.education || []).length > 0 && (
                        <div className="space-y-2 text-[10px]">
                          <h3 className="font-extrabold uppercase tracking-widest text-xs border-b border-slate-400 pb-1 text-slate-900">
                            EDUCATION
                          </h3>
                          {(cv.education || []).map(edu => (
                            <div key={edu.id} className="space-y-0.5">
                              <h4 className="font-bold text-slate-950 text-[10.5px]">{edu.degree}</h4>
                              <p className="text-slate-800 font-semibold">{edu.institution}</p>
                              <p className="text-slate-600 font-bold text-[9px]">{edu.year}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* SKILLS */}
                      {(cv.skills || []).length > 0 && (
                        <div className="space-y-2 text-[10px]">
                          <h3 className="font-extrabold uppercase tracking-widest text-xs border-b border-slate-400 pb-1 text-slate-900">
                            SKILLS
                          </h3>
                          <div className="space-y-1 font-medium text-slate-900">
                            {(cv.skills || []).map((skill, idx) => (
                              <p key={idx}>• {skill}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* LANGUAGE */}
                      {(cv.languages || []).length > 0 && (
                        <div className="space-y-2 text-[10px]">
                          <h3 className="font-extrabold uppercase tracking-widest text-xs border-b border-slate-400 pb-1 text-slate-900">
                            LANGUAGE
                          </h3>
                          <div className="space-y-1 font-medium text-slate-900">
                            {(cv.languages || []).map((lang, idx) => (
                              <p key={idx}>• {lang}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-[8.5px] text-slate-600 font-semibold border-t border-slate-400 pt-2">
                      Verified CV • JobNews.lk
                    </div>
                  </div>

                  {/* Right Main Panel - 67% White */}
                  <div className="w-[67%] p-8 space-y-6 bg-white flex flex-col justify-between">
                    <div className="space-y-6">
                      {/* About Me */}
                      {cv.personal.summary && (
                        <div className="space-y-1.5">
                          <h2 className="text-base font-extrabold tracking-tight text-slate-950 border-b border-slate-300 pb-1">
                            About Me
                          </h2>
                          <p className="text-[10.5px] text-slate-700 leading-relaxed font-normal">
                            {cv.personal.summary}
                          </p>
                        </div>
                      )}

                      {/* WORK EXPERIENCE */}
                      {(cv.experience || []).length > 0 && (
                        <div className="space-y-2">
                          <h2 className="text-base font-extrabold tracking-tight text-slate-950 border-b border-slate-300 pb-1">
                            WORK EXPERIENCE
                          </h2>
                          <div className="space-y-4 pt-1">
                            {(cv.experience || []).map(exp => (
                              <div key={exp.id} className="space-y-1">
                                <div className="flex justify-between items-start">
                                  <span className="text-[10px] font-extrabold text-slate-700">{exp.period}</span>
                                </div>
                                <p className="text-[10px] font-semibold text-slate-500">{exp.company}</p>
                                <h3 className="font-extrabold text-slate-950 text-[11px]">{exp.title}</h3>
                                {exp.description && (
                                  <p className="text-[10px] text-slate-600 leading-relaxed pt-0.5">• {exp.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* REFERENCES */}
                      {(cv.referees || []).length > 0 && (
                        <div className="space-y-2">
                          <h2 className="text-base font-extrabold tracking-tight text-slate-950 border-b border-slate-300 pb-1">
                            REFERENCES
                          </h2>
                          <div className="grid grid-cols-2 gap-4 pt-1">
                            {(cv.referees || []).map((ref, idx) => (
                              <div key={idx} className="space-y-0.5 text-[10px]">
                                <h4 className="font-extrabold text-slate-950 text-[10.5px]">{ref.name}</h4>
                                <p className="text-slate-700 font-semibold">{ref.company} / {ref.designation}</p>
                                <p className="text-slate-500">Phone: {ref.phone}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {cv.includeDeclaration && (
                      <div className="pt-3 border-t border-slate-300 space-y-3">
                        <div className="space-y-0.5">
                          <h2 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-900">DECLARATION</h2>
                          <p className="text-[9.5px] text-slate-600 leading-relaxed italic">
                            "{cv.declarationText}"
                          </p>
                        </div>
                        <div className="flex justify-between items-end text-[9.5px] font-bold text-slate-800 pt-1">
                          <span>Date: .......................................</span>
                          <span>Signature: .......................................</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
