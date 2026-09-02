import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, KeyRound, QrCode, ArrowLeft, Briefcase, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

function parseQrSvg(qr: string): string {
  if (!qr) return '';
  let svg = qr;
  if (svg.startsWith('data:image/svg+xml;utf-8,')) {
    svg = decodeURIComponent(svg.replace('data:image/svg+xml;utf-8,', ''));
  } else if (svg.startsWith('data:image/svg+xml;base64,')) {
    try {
      svg = atob(svg.split(',')[1]);
    } catch {
      // ignore
    }
  }
  
  return svg.replace(/<svg([^>]*)>/i, (match, group) => {
    let cleanGroup = group;
    
    // Extract original width and height if present
    const widthMatch = group.match(/\swidth=["']([^"']*)["']/i);
    const heightMatch = group.match(/\sheight=["']([^"']*)["']/i);
    const hasViewBox = group.match(/\sviewBox=["'][^"']*["']/i);
    
    let w = widthMatch ? widthMatch[1].replace(/px/g, '') : '';
    let h = heightMatch ? heightMatch[1].replace(/px/g, '') : '';
    
    // Remove existing width, height, and style to avoid conflicts
    cleanGroup = cleanGroup
      .replace(/\s(width|height)=["'][^"']*["']/gi, '')
      .replace(/\sstyle=["'][^"']*["']/gi, '');
      
    // If no viewBox but we had width and height, add a computed viewBox!
    // This is crucial for SVGs with absolute inner paths (like those from Supabase auth)
    if (!hasViewBox && w && h) {
      cleanGroup += ` viewBox="0 0 ${w} ${h}"`;
    }
      
    // Add our own responsive properties
    if (!cleanGroup.includes('preserveAspectRatio')) {
      cleanGroup += ' preserveAspectRatio="xMidYMid meet"';
    }
    
    return `<svg${cleanGroup} style="width: 100%; height: 100%; display: block;">`;
  });
}

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 2FA state
  const [mfaStep, setMfaStep] = useState<'credentials' | 'enroll' | 'verify'>('credentials');
  const [qrCode, setQrCode] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [challengeId, setChallengeId] = useState<string>('');
  const [mfaCode, setMfaCode] = useState('');

  const navigate = useNavigate();
  const { signIn, user, isAdmin } = useAuth();

  useEffect(() => {
    async function checkMfaStatus() {
      if (!user || !isAdmin) return;

      try {
        const { data: levelData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        // If user is already 2FA verified (aal2), redirect to dashboard
        if (levelData?.currentLevel === 'aal2') {
          navigate('/admin/dashboard', { replace: true });
          return;
        }
      } catch (err) {
        console.error('MFA check error:', err);
      }
    }

    checkMfaStatus();
  }, [user, isAdmin, navigate]);

  const processMfa = async () => {
    const { data: factorsData, error: factorsErr } = await supabase.auth.mfa.listFactors();
    if (factorsErr) {
      navigate('/admin/dashboard');
      return;
    }

    // Try to find a verified factor in totp array, fallback to all array
    const verifiedTotp = 
      factorsData?.totp?.find((f) => f.status === 'verified') ||
      factorsData?.all?.find((f) => f.status === 'verified' && f.factor_type === 'totp');

    if (verifiedTotp) {
      // 2FA is verified, challenge for 6-digit code
      const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({
        factorId: verifiedTotp.id,
      });

      if (challengeErr) throw challengeErr;

      setFactorId(verifiedTotp.id);
      setChallengeId(challengeData.id);
      setMfaStep('verify');
    } else {
      // Clean up any unverified leftover factors
      const unverifiedFactors = factorsData?.all?.filter((f) => f.status === 'unverified') || 
                                factorsData?.totp?.filter((f) => f.status === 'unverified') || [];
                                
      for (const factor of unverifiedFactors) {
        const { error: unenrollErr } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (unenrollErr) {
          console.error(`Failed to unenroll factor ${factor.id}:`, unenrollErr);
        } else {
          console.log(`Successfully unenrolled unverified factor ${factor.id}`);
        }
      }

      // Enroll fresh TOTP factor with a unique friendlyName to avoid duplicate errors
      const { data: enrollData, error: enrollErr } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'JobNews.lk',
        friendlyName: `JobNews Admin ${Date.now()}`,
      });

      if (enrollErr) {
        // If we hit max factors but couldn't find a verified one, maybe the status is different?
        // Let's see if there is ANY factor we can use
        const anyFactor = factorsData?.totp?.[0] || factorsData?.all?.[0];
        if (anyFactor) {
          console.log('Enroll failed, but found existing factor:', anyFactor);
          // Let's try to challenge it anyway
          const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({
            factorId: anyFactor.id,
          });
          
          if (challengeErr) {
            throw new Error(`Enroll failed: ${enrollErr.message}. Also failed to challenge existing factor (${anyFactor.status}): ${challengeErr.message}`);
          }
          
          setFactorId(anyFactor.id);
          setChallengeId(challengeData.id);
          setMfaStep('verify');
          return;
        }
        
        throw enrollErr;
      }

      const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({
        factorId: enrollData.id,
      });

      if (challengeErr) throw challengeErr;

      setQrCode(enrollData.totp.qr_code);
      setSecretKey(enrollData.totp.secret);
      setFactorId(enrollData.id);
      setChallengeId(challengeData.id);
      setMfaStep('enroll');
    }
  };

  // Anti-Brute-Force Rate Limiting Lockout State
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    return parseInt(localStorage.getItem('admin_login_failed_count') || '0', 10);
  });
  const [lockoutTime, setLockoutTime] = useState<number>(() => {
    return parseInt(localStorage.getItem('admin_login_lockout_until') || '0', 10);
  });

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if account is currently locked out
    if (lockoutTime && Date.now() < lockoutTime) {
      const remainingMins = Math.ceil((lockoutTime - Date.now()) / (1000 * 60));
      setError(`🔒 Anti-Brute-Force Lockout: Too many failed login attempts. Please try again in ${remainingMins} minute(s).`);
      return;
    }

    setLoading(true);

    try {
      const { error: signInErr } = await signIn(email, password);
      if (signInErr) {
        const newCount = failedAttempts + 1;
        setFailedAttempts(newCount);
        localStorage.setItem('admin_login_failed_count', newCount.toString());

        if (newCount >= 5) {
          const lockUntil = Date.now() + 15 * 60 * 1000; // 15 Minute Cooldown
          setLockoutTime(lockUntil);
          localStorage.setItem('admin_login_lockout_until', lockUntil.toString());
          setError('🔒 Too many failed login attempts. Account temporarily locked for 15 minutes to prevent brute-force attacks.');
        } else {
          setError(`Invalid credentials. Warning: ${5 - newCount} attempt(s) remaining before security lockout.`);
        }
        setLoading(false);
        return;
      }

      // Reset lockout counter on clean successful password entry
      setFailedAttempts(0);
      setLockoutTime(0);
      localStorage.removeItem('admin_login_failed_count');
      localStorage.removeItem('admin_login_lockout_until');

      await processMfa();
      setLoading(false);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Orbs & Subtle Grid Overlay */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-xl backdrop-blur-md shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>← Back to JobNews.lk</span>
        </Link>

        <div className="flex items-center gap-2.5 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-full backdrop-blur-md">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-tight text-white">
            JobNews<span className="text-blue-500">.lk</span>
          </span>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            Enterprise Portal
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
        {/* Step 1: Login Credentials */}
        {mfaStep === 'credentials' && (
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-7 sm:p-8 shadow-2xl shadow-blue-950/40 space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400 shadow-inner">
                <Shield className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Admin Login</h1>
              <p className="text-slate-400 mt-1.5 text-xs sm:text-sm">
                Sign in with your admin account to access the dashboard
              </p>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="space-y-4 pt-2">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm px-4 py-3 rounded-xl flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Checking credentials...' : 'Sign In'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: First Time 2FA Enrollment (Scan QR Code) */}
        {mfaStep === 'enroll' && (
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-7 sm:p-8 shadow-2xl shadow-blue-950/40 space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
                <QrCode className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-bold text-white">Setup 2-Step Verification</h1>
              <p className="text-slate-400 mt-1 text-xs leading-relaxed">
                Scan this QR code using the <strong>Google Authenticator</strong> app on your phone.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-950/70 rounded-2xl border border-slate-800/80">
              {qrCode ? (
                <div className="w-52 h-52 bg-white p-3 rounded-xl shadow-lg border border-slate-700 flex items-center justify-center overflow-hidden">
                  <div
                    dangerouslySetInnerHTML={{ __html: parseQrSvg(qrCode) }}
                    className="w-full h-full flex items-center justify-center"
                  />
                </div>
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-xs text-slate-400">Loading QR...</div>
              )}
              {secretKey && (
                <div className="mt-4 text-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">Setup Key (Secret)</span>
                  <code className="text-xs font-mono font-bold bg-slate-800 text-blue-300 px-3 py-1.5 rounded-lg select-all border border-slate-700">
                    {secretKey}
                  </code>
                </div>
              )}
              <span className="text-[11px] text-slate-400 mt-3 text-center">
                Open Google Authenticator App ➔ Tap + ➔ Scan QR Code
              </span>
            </div>

            <form onSubmit={handleMfaVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-center">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  className="w-full text-center text-2xl font-mono tracking-[0.3em] px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || mfaCode.length !== 6}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Regular 2FA Login Verification */}
        {mfaStep === 'verify' && (
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-7 sm:p-8 shadow-2xl shadow-blue-950/40 space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400">
                <KeyRound className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-bold text-white">2-Step Verification</h1>
              <p className="text-slate-400 mt-1 text-xs">
                Enter the 6-digit code from your Google Authenticator app
              </p>
            </div>

            <form onSubmit={handleMfaVerifySubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-center">
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
                  className="w-full text-center text-2xl font-mono tracking-[0.3em] px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading || mfaCode.length !== 6}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="w-full text-xs text-slate-400 hover:text-slate-200 transition-colors pt-2"
              >
                Back to Sign In
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-5 text-center text-[11px] text-slate-500 font-medium">
        <div className="flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-blue-500" />
          <span>JobNews.lk Enterprise Portal &bull; Encrypted &amp; Protected</span>
        </div>
      </footer>
    </div>
  );
}

