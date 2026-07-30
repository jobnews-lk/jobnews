import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FolderOpen } from 'lucide-react';
import { supabase, type Category } from '../lib/supabase';

interface CategoriesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoriesDrawer({ isOpen, onClose }: CategoriesDrawerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    async function load() {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    }
    if (categories.length === 0) load();
  }, [isOpen]);

  const handleSelect = (slug: string) => {
    onClose();
    navigate(slug ? `/jobs?category=${slug}` : '/jobs');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Categories</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 active:scale-95 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 pb-24">
          <div className="grid gap-2">
            <button
              onClick={() => handleSelect('')}
              className="flex items-center w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 active:bg-blue-50 dark:active:bg-blue-900/20"
            >
              <span className="font-semibold text-slate-900 dark:text-white">All Job Categories</span>
            </button>
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.slug)}
                className="flex items-center w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 active:bg-blue-50 dark:active:bg-blue-900/20"
              >
                <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
