import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Menu, X, Newspaper, Shield, LogOut, Sun, Moon, Search, MessageCircle, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSavedJobs } from '../hooks/useSavedJobs';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { count: savedCount } = useSavedJobs();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const navLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `text-sm font-medium transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'}`;
  };

  return (
    <nav className={`bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-500/20">
              <Briefcase className="w-5 h-5 text-white" strokeWidth={2.2} />
              <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                <Search className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                JobNews<span className="text-blue-600 dark:text-blue-400">.lk</span>
              </span>
              <span className="text-[8.5px] text-slate-500 dark:text-slate-400 font-bold tracking-[0.2em] uppercase mt-1 leading-none">
                Your Career, Our Mission
              </span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={navLinkClass('/')}>Home</Link>
            <Link to="/jobs" className={navLinkClass('/jobs')}>Latest Jobs</Link>
            <Link to="/government-jobs" className={navLinkClass('/government-jobs')}>Government</Link>
            <Link to="/private-jobs" className={navLinkClass('/private-jobs')}>Private Sector</Link>
            <Link to="/overseas-jobs" className={navLinkClass('/overseas-jobs')}>Overseas</Link>
            <Link to="/saved-jobs" className={`${navLinkClass('/saved-jobs')} inline-flex items-center gap-1.5`}>
              Saved Jobs
              {savedCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold bg-red-500 text-white rounded-full min-w-[18px] h-4 shadow-sm animate-pulse">
                  {savedCount}
                </span>
              )}
            </Link>
            
            <a
              href="https://whatsapp.com/channel/0029Vb8F3lw42DcjuB8vvQ1y"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" /> WhatsApp
            </a>

            {user && (
              <Link
                to="/admin"
                className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${location.pathname.startsWith('/admin') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'}`}
              >
                <Shield className="w-3.5 h-3.5" /> Dashboard
              </Link>
            )}
            {user && !isAdmin && (
              <button
                onClick={() => signOut()}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            )}
            
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="p-2 text-slate-600 dark:text-slate-300" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-3 border-t border-slate-100 pt-3">
            <Link to="/" className={navLinkClass('/')}>Home</Link>
            <Link to="/jobs" className={navLinkClass('/jobs')}>Latest Jobs</Link>
            <Link to="/government-jobs" className={navLinkClass('/government-jobs')}>Government Jobs</Link>
            <Link to="/private-jobs" className={navLinkClass('/private-jobs')}>Private Sector</Link>
            <Link to="/overseas-jobs" className={navLinkClass('/overseas-jobs')}>Overseas Jobs</Link>
            <Link to="/saved-jobs" className={`${navLinkClass('/saved-jobs')} inline-flex items-center justify-between`}>
              <span>Saved Jobs</span>
              {savedCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {savedCount}
                </span>
              )}
            </Link>
            <Link to="/about" className={navLinkClass('/about')}>About</Link>
            <Link to="/contact" className={navLinkClass('/contact')}>Contact</Link>
            {user && (
              <Link to="/admin" className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${location.pathname.startsWith('/admin') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>
                <Shield className="w-3.5 h-3.5" /> Dashboard
              </Link>
            )}
            {user && (
              <button onClick={() => signOut()} className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 text-left">
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
