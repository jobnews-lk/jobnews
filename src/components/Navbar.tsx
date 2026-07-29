import { Link, useLocation } from 'react-router-dom';
import { Briefcase, Menu, X, Newspaper, Shield, LogOut, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
    <nav className={`bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 text-slate-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-400 transition-colors">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="text-lg font-bold tracking-tight">JobNews</span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">Vacancy Announcements</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={navLinkClass('/')}>Home</Link>
            <Link to="/jobs" className={navLinkClass('/jobs')}>Latest Jobs</Link>
            <Link to="/government-jobs" className={navLinkClass('/government-jobs')}>Government</Link>
            <Link to="/private-jobs" className={navLinkClass('/private-jobs')}>Private Sector</Link>
            <Link to="/overseas-jobs" className={navLinkClass('/overseas-jobs')}>Overseas</Link>
            <Link to="/about" className={navLinkClass('/about')}>About</Link>
            <Link to="/contact" className={navLinkClass('/contact')}>Contact</Link>
            <Link
              to="/admin"
              className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${location.pathname.startsWith('/admin') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'}`}
            >
              <Shield className="w-3.5 h-3.5" /> Dashboard
            </Link>
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
            <Link to="/about" className={navLinkClass('/about')}>About</Link>
            <Link to="/contact" className={navLinkClass('/contact')}>Contact</Link>
            <Link to="/admin" className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${location.pathname.startsWith('/admin') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>Dashboard</Link>
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
