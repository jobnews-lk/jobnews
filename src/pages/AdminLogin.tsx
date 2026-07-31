import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, KeyRound, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 2FA state
  const [mfaStep, setMfaStep] = useState<'credentials' | 'enroll' | 'verify'>('credentials');
  const [qrCode, setQrCode] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [challengeId, setChallengeId] = useState<string>('');
  const [mfaCode, setMfaCode] = useState('');

  const navigate = useNavigate();
  const { signIn, user, isAdmin } = useAuth();

  if (user && isAdmin && mfaStep === 'credentials') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInErr } = await signIn(email, password);
      if (signInErr) {
        setError(signInErr.message || 'Invalid credentials');
        setLoading(false);
        return;
      }

      // Check if MFA TOTP factor exists
      const { data: factorsData, error: factorsErr } = await supabase.auth.mfa.listFactors();
      if (factorsErr) {
        // Fallback if MFA list fails
        navigate('/admin/dashboard');
        return;
      }

      const verifiedTotp = factorsData?.totp?.find((f) => f.status === 'verified');

      if (verifiedTotp) {
        // Already enrolled — Challenge for 2FA Verification
        const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({
          factorId: verifiedTotp.id,
        });

        if (challengeErr) {
          setError(challengeErr.message);
          setLoading(false);
          return;
        }

        setFactorId(verifiedTotp.id);
        setChallengeId(challengeData.id);
        setMfaStep('verify');
        setLoading(false);
      } else {
        // First time setup — Enroll TOTP to get QR code
        const { data: enrollData, error: enrollErr } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          issuer: 'JobNews.lk',
          friendlyName: 'JobNews Admin',
        });

        if (enrollErr) {
          setError(enrollErr.message);
          setLoading(false);
          return;
        }

        const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({
          factorId: enrollData.id,
        });

        if (challengeErr) {
          setError(challengeErr.message);
          setLoading(false);
          return;
        }

        setQrCode(enrollData.totp.qr_code);
        setFactorId(enrollData.id);
        setChallengeId(challengeData.id);
        setMfaStep('enroll');
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleMfaVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: mfaCode.trim(),
      });

      if (verifyErr) {
        setError('Invalid 6-digit code. Please check Google Authenticator.');
        setLoading(false);
        return;
      }

      // Successfully verified 2FA
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify 2FA code');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-sm w-full">
        {/* Step 1: Login Credentials */}
        {mfaStep === 'credentials' && (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Login</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                Sign in with your admin account to access the dashboard
              </p>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full pl-4 pr-11 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Checking credentials...' : 'Sign In'}
              </button>
            </form>
          </>
        )}

        {/* Step 2: First Time 2FA Enrollment (Scan QR Code) */}
        {mfaStep === 'enroll' && (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Setup 2-Step Verification</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs leading-relaxed">
                Scan this QR code using the <strong>Google Authenticator</strong> app on your phone.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                {qrCode ? (
                  <img src={qrCode} alt="Google Authenticator QR Code" className="w-48 h-48 rounded-lg shadow-sm" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">Loading QR...</div>
                )}
                <span className="text-[11px] text-slate-500 mt-2 text-center">
                  Open Google Authenticator App ➔ Tap + ➔ Scan QR Code
                </span>
              </div>

              <form onSubmit={handleMfaVerifySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    required
                    className="w-full text-center text-2xl font-mono tracking-[0.3em] px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || mfaCode.length !== 6}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
                </button>
              </form>
            </div>
          </>
        )}

        {/* Step 3: Regular 2FA Login Verification */}
        {mfaStep === 'verify' && (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">2-Step Verification</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">
                Enter the 6-digit code from your Google Authenticator app
              </p>
            </div>

            <form onSubmit={handleMfaVerifySubmit} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-center">
                  Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  autoFocus
                  required
                  className="w-full text-center text-2xl font-mono tracking-[0.3em] px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || mfaCode.length !== 6}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying Code...' : 'Verify Code & Sign In'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMfaStep('credentials');
                  setError('');
                  setMfaCode('');
                }}
                className="w-full text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors pt-2"
              >
                Back to Sign In
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

