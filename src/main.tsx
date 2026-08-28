import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import './index.css';

try {
  const APP_VERSION = 'v2.9_cache_bust';
  if (localStorage.getItem('jn_app_v') !== APP_VERSION) {
    localStorage.removeItem('jn_home_jobs');
    localStorage.removeItem('jn_v2_home_jobs');
    localStorage.removeItem('jn_v2_home_closing');
    localStorage.removeItem('jn_v2_home_countries');
    localStorage.removeItem('jn_v2_home_categories');
    localStorage.setItem('jn_app_v', APP_VERSION);
  }
} catch (e) {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
