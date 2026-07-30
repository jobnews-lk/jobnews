import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FolderOpen, Search, Heart } from 'lucide-react';
import CategoriesDrawer from './CategoriesDrawer';

export default function MobileBottomNav() {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          <NavLink
            to="/"
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
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Search</span>
          </NavLink>

          <NavLink
            to="/saved-jobs"
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
