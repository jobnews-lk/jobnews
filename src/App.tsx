import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import SavedJobs from './pages/SavedJobs';
import GovernmentJobs from './pages/GovernmentJobs';
import PrivateJobs from './pages/PrivateJobs';
import OverseasJobs from './pages/OverseasJobs';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
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
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="saved-jobs" element={<SavedJobs />} />
            <Route path="government-jobs" element={<GovernmentJobs />} />
            <Route path="private-jobs" element={<PrivateJobs />} />
            <Route path="overseas-jobs" element={<OverseasJobs />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="admin/login" element={<AdminLogin />} />
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
