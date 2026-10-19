import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Search, Heart, FileText } from 'lucide-react';
import CategoriesDrawer from './CategoriesDrawer';
import { useUnreadJobsBadge } from '../lib/appBadgeService';

export default function MobileBottomNav() {
  const { unreadCount } = useUnreadJobsBadge();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const location = useLocation();

  const handleNavClick = (targetPath: string) => {
    if (location.pathname === targetPath) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          <NavLink
            to="/"
            onClick={() => handleNavClick('/')}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </NavLink>

          <button
            onClick={() => setIsCategoriesOpen(true)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isCategoriesOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-5 h-5" />
            <span className="text-[10px] font-medium">Categories</span>
          </button>

          <NavLink
            to="/jobs"
            onClick={() => handleNavClick('/jobs')}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <div className="relative">
              <Search className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-sm border border-white dark:border-slate-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Search</span>
          </NavLink>

          <NavLink
            to="/create-cv"
            onClick={() => handleNavClick('/create-cv')}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <FileText className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-medium">CV Builder</span>
          </NavLink>

          <NavLink
            to="/saved-jobs"
            onClick={() => handleNavClick('/saved-jobs')}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <Heart className="w-5 h-5" />
            <span className="text-[10px] font-medium">Saved</span>
          </NavLink>
        </div>
      </div>

      <CategoriesDrawer 
        isOpen={isCategoriesOpen} 
        onClose={() => setIsCategoriesOpen(false)} 
      />
    </>
  );
}
