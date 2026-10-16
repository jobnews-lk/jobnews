import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import SavedJobs from './pages/SavedJobs';
import GovernmentJobs from './pages/GovernmentJobs';
import PrivateJobs from './pages/PrivateJobs';
import OverseasJobs from './pages/OverseasJobs';
import CvBuilder from './pages/CvBuilder';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import AdminLogin from './pages/AdminLogin';
import AdminForgotPassword from './pages/AdminForgotPassword';
import AdminResetPassword from './pages/AdminResetPassword';
import AdminEntry from './pages/AdminEntry';
import AdminDashboard from './pages/AdminDashboard';
import AdminNewJob from './pages/AdminNewJob';
import AdminEditJob from './pages/AdminEditJob';
import AdminRoute from './components/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import NotFound from './pages/NotFound';

function App() {
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFade, setSplashFade] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setSplashFade(true);
    }, 1100);

    const removeTimer = setTimeout(() => {
      setSplashVisible(false);
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <BrowserRouter>
      {splashVisible && (
        <div 
          className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] text-white transition-opacity duration-400 ease-out pointer-events-none ${
            splashFade ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-white/12 backdrop-blur-md border border-white/20 shadow-2xl mb-4">
            <img src="/favicon.svg" alt="JobNews.lk Logo" className="w-14 h-14 rounded-xl shadow-md" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white m-0">
            JobNews<span className="text-blue-300">.lk</span>
          </h1>
          <p className="text-[10px] font-bold tracking-[2.5px] uppercase text-blue-200 mt-1.5 opacity-90">
            Your Career, Our Mission
          </p>
        </div>
      )}
      <ScrollToTop />
      <ErrorBoundary>
        <Routes>
          {/* Standalone Dedicated Full-Screen Enterprise Admin Login Portal */}
          <Route path="admin/login" element={<AdminLogin />} />

          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="saved-jobs" element={<SavedJobs />} />
            <Route path="government-jobs" element={<GovernmentJobs />} />
            <Route path="government" element={<Navigate to="/government-jobs" replace />} />
            <Route path="private-jobs" element={<PrivateJobs />} />
            <Route path="private" element={<Navigate to="/private-jobs" replace />} />
            <Route path="overseas-jobs" element={<OverseasJobs />} />
            <Route path="overseas" element={<Navigate to="/overseas-jobs" replace />} />
            <Route path="create-cv" element={<CvBuilder />} />
            <Route path="cv-builder" element={<Navigate to="/create-cv" replace />} />
            <Route path="cv" element={<Navigate to="/create-cv" replace />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="admin/signup" element={<Navigate to="/admin/login" replace />} />
            <Route path="admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="admin/reset-password" element={<AdminResetPassword />} />
            <Route path="admin" element={<AdminEntry />} />
            <Route path="admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="admin/jobs/new" element={<AdminRoute><AdminNewJob /></AdminRoute>} />
            <Route path="admin/jobs/:id/edit" element={<AdminRoute><AdminEditJob /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
