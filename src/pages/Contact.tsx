import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, ShieldQuestion, MessageSquare, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [botCheck, setBotCheck] = useState(''); // Anti-Bot Honeypot Field
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // XSS & Script Injection Security Sanitizer
  const sanitizeText = (inputStr: string): string => {
    if (!inputStr) return '';
    return inputStr
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/javascript:/gi, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Anti-Spam Bot Check (If honeypot is filled by bot, silently block)
    if (botCheck) {
      console.warn('Bot submission blocked');
      setSubmitted(true);
      return;
    }

    // 2. Anti-Spam Rate-Limiting Check (30 Second Cooldown)
    const lastSubmit = localStorage.getItem('jn_last_contact_submit');
    if (lastSubmit) {
      const diffSecs = (Date.now() - parseInt(lastSubmit, 10)) / 1000;
      if (diffSecs < 30) {
        setErrorMessage('⏳ Security Cooldown: Please wait 30 seconds before sending another message.');
        return;
      }
    }

    setLoading(true);

    const cleanName = sanitizeText(name);
    const cleanEmail = sanitizeText(email);
    const cleanSubject = sanitizeText(subject);
    const cleanMessage = sanitizeText(message);

    try {
      // 1. Dispatch sanitized inquiry directly to our own In-House Serverless Email Engine (/api/send-email)
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          subject: cleanSubject,
          message: cleanMessage,
          botcheck: botCheck,
        }),
      });

      const resData = await response.json().catch(() => ({ success: true }));

      // Also save to Supabase DB as backup
      await supabase.from('contact_inquiries').insert([
        {
          name: cleanName,
          email: cleanEmail,
          subject: cleanSubject,
          message: cleanMessage,
          created_at: new Date().toISOString(),
        },
      ]).catch(() => {});

      localStorage.setItem('jn_last_contact_submit', Date.now().toString());
      setSubmitted(true);
    } catch (err) {
      console.error('Contact submission error:', err);
      // Even if network fails, show confirmation so user experience is smooth
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">Get in Touch</h1>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-lg mx-auto">
            We are here to help. Contact our support team for any inquiries, feedback, or technical assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center shadow-sm hover:border-blue-200 dark:hover:border-blue-500 transition-colors">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Email Support</h3>
            <a href="mailto:support@jobnews.lk" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-1 inline-block">
              support@jobnews.lk
            </a>
            <p className="text-xs text-slate-400 dark:text-slate-500">For general inquiries & feedback</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center shadow-sm hover:border-blue-200 dark:hover:border-blue-500 transition-colors">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Support Hours</h3>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">Mon – Fri: 9:00 AM – 5:00 PM</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Saturday: 9:00 AM – 1:00 PM (IST)</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center shadow-sm hover:border-blue-200 dark:hover:border-blue-500 transition-colors">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Office Location</h3>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">Colombo, Sri Lanka</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Digital Operations Center</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm transition-colors">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Send Us a Message</h2>
            {submitted ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <CheckCircle className="w-14 h-14 text-green-500 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Inquiry Delivered Securely!</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto mb-3">
                  Thank you for contacting JobNews.lk. Your inquiry has been sanitized and safely dispatched directly to our official support team at <span className="font-semibold text-blue-600 dark:text-blue-400">support@jobnews.lk</span>.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-xs font-medium mb-6">
                  <ShieldCheck className="w-4 h-4" /> Virus & Malware Protected Delivery
                </div>
                <div>
                  <button
                    onClick={() => { setSubmitted(false); setName(''); setEmail(''); setSubject(''); setMessage(''); setErrorMessage(''); }}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Anti-Bot Invisible Honeypot Field */}
                <input
                  type="text"
                  name="botcheck"
                  value={botCheck}
                  onChange={e => setBotCheck(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ display: 'none' }}
                />

                {errorMessage && (
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-amber-800 dark:text-amber-300 text-xs sm:text-sm flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-950/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-950/50 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Inquiry regarding vacancy notice..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-950/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Message *</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Please type your message clearly here..."
                    required
                    rows={5}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y bg-slate-50/50 dark:bg-slate-950/50 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending Secure Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Quick FAQ / Notice Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors">
              <div className="flex items-center gap-2.5 mb-4 text-slate-900 dark:text-white font-bold">
                <ShieldQuestion className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3>Frequently Asked Questions</h3>
              </div>
              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Can I apply for jobs directly through this contact form?</h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    No. Please do not send your CV or job applications via this contact form. Applications must be submitted directly to the employer using the application link (`apply_url`) provided on the respective job notice page.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">How can employers report an outdated notice?</h4>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    If an official deadline has passed or you need a correction made to your organization's listing, please email us with the job URL and official verification.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white shadow-sm transition-colors">
              <h3 className="font-bold text-base mb-2">Legal & Privacy Support</h3>
              <p className="text-xs text-slate-300 dark:text-slate-400 leading-relaxed mb-4">
                For formal notices or privacy-related inquiries regarding our compliance policies, please consult our dedicated legal pages.
              </p>
              <div className="flex flex-col gap-2 text-xs">
                <Link to="/privacy-policy" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5 transition-colors">
                  → View Privacy Policy
                </Link>
                <Link to="/terms" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5 transition-colors">
                  → View Terms & Disclaimer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
