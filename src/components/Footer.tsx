import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="bg-slate-900 dark:bg-black text-slate-300 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Newspaper className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">JobNews.lk</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-4">
              Your trusted source for official job vacancy announcements. Browse government, private sector, and overseas job notices from verified employers.
            </p>
            <a
              href="https://whatsapp.com/channel/0029Vb8F3lw42DcjuB8vvQ1y"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <MessageCircle className="w-4 h-4 fill-white" /> Join WhatsApp Channel 💚
            </a>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Links</h3>
            <div className="flex flex-col gap-2.5">
              <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">Home</Link>
              <Link to="/jobs" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">Latest Jobs</Link>
              <Link to="/government-jobs" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">Government Jobs</Link>
              <Link to="/overseas-jobs" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">Overseas Jobs</Link>
              <Link to="/about" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">About Us</Link>
              <Link to="/contact" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">Contact Support</Link>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Legal & Policies</h3>
            <div className="flex flex-col gap-2.5">
              <Link to="/privacy-policy" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1">Terms & Disclaimer</Link>
              {user && (
                <Link to="/admin/login" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1 mt-2 pt-2 border-t border-slate-800">Admin Dashboard</Link>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>JobNews. All rights reserved. Independent job vacancy announcements portal.</p>
          <div className="flex items-center gap-6 text-xs">
            <Link to="/privacy-policy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-slate-400 transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
