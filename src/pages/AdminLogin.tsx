import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, KeyRound, QrCode } from 'lucide-react';
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
      factorsData?.all?.find((f) => f.status === 'verified' && f.factorType === 'totp');

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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
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
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                {qrCode ? (
                  <div className="w-56 h-56 bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden">
                    <div
                      dangerouslySetInnerHTML={{ __html: parseQrSvg(qrCode) }}
                      className="w-full h-full flex items-center justify-center"
                    />
                  </div>
                ) : (
                  <div className="w-72 h-72 flex items-center justify-center text-xs text-slate-400">Loading QR...</div>
                )}
                {secretKey && (
                  <div className="mt-4 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">Setup Key (Secret)</span>
                    <code className="text-xs font-mono font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-lg select-all border border-slate-300 dark:border-slate-700">
                      {secretKey}
                    </code>
                  </div>
                )}
                <span className="text-[11px] text-slate-500 mt-3 text-center">
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

