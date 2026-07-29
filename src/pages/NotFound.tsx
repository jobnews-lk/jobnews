import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="text-center">
        <h1 className="text-7xl sm:text-9xl font-black text-slate-200 dark:text-slate-800 mb-4">404</h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">Page Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Sorry, the page you are looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
