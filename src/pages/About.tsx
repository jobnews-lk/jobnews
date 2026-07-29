import { Link } from 'react-router-dom';
import { Newspaper, Globe, Landmark, Building2, CheckCircle, ShieldCheck, HeartHandshake, AlertCircle } from 'lucide-react';

export default function About() {
  return (
    <div className="py-12 px-4 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Newspaper className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">About JobNews</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl mx-auto">
            Your most reliable, fast, and organized portal for official job vacancy announcements and career opportunities.
          </p>
        </div>

        {/* Core Mission */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-9 mb-8 shadow-sm transition-colors">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Mission & Vision</h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Finding genuine, up-to-date job announcements can often be a frustrating experience involving scattered newspaper clippings, slow government portals, and unreliable social media posts. **JobNews was built to solve this problem.**
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            We curate, organize, and publish verified vacancy notices from across Sri Lanka and international markets into one clean, lightning-fast platform. Whether you are looking for a prestigious civil service appointment, a high-growth private sector career, or a rewarding foreign employment opportunity, JobNews delivers the exact official information you need.
          </p>
          <div className="p-4 bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3 mt-6">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white block mb-0.5">Commitment to Quality & Accuracy</strong>
              Every vacancy published on our platform undergoes careful verification against official employer notices, national gazettes, and verified corporate circulars before going live.
            </div>
          </div>
        </div>

        {/* Coverage Grid */}
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 px-1">What We Cover</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-blue-200 dark:hover:border-blue-500 transition-colors">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
              <Landmark className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Government Vacancies</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Comprehensive coverage of ministries, departments, public service commissions, state banks, and statutory board examinations & appointments.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-teal-200 dark:hover:border-teal-500 transition-colors">
            <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Overseas Opportunities</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Verified foreign employment opportunities in the Middle East, Europe, East Asia, and beyond from licensed and approved international recruiters.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-purple-200 dark:hover:border-purple-500 transition-colors">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">Private Sector Careers</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Exciting openings from leading multinational corporations, IT firms, banking institutions, and top local enterprises across all sectors.
            </p>
          </div>
        </div>

        {/* How We Work & Independence Notice */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-9 mb-8 shadow-sm transition-colors">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Core Principles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Direct Official Applications</h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  We provide direct links (`apply_url`) and official instructions so you apply directly through the employer without intermediaries.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HeartHandshake className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">100% Free for Job Seekers</h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  JobNews is completely free to browse. We never charge registration fees, application handling charges, or placement commissions.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-start gap-3 bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200/60 dark:border-amber-900/30 transition-colors">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="text-slate-900 dark:text-white">Independence & Legal Notice:</strong> JobNews is an independent news and announcement platform. We are not a government agency, nor are we directly affiliated with the employers whose notices appear on this website. For full details on our operational policies and liability terms, please review our <Link to="/terms" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Terms & Disclaimer</Link> and <Link to="/privacy-policy" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white shadow-md">
          <h2 className="text-2xl font-bold mb-2">Ready to Take Your Next Career Step?</h2>
          <p className="text-blue-100 mb-6 text-sm max-w-md mx-auto">Browse hundreds of verified job announcements published daily across multiple categories.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/jobs" className="px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl shadow-sm transition-colors text-sm">
              Explore All Vacancies
            </Link>
            <Link to="/contact" className="px-6 py-3 bg-blue-700/60 hover:bg-blue-700 text-white font-semibold rounded-xl border border-blue-400/30 transition-colors text-sm">
              Contact Support Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
