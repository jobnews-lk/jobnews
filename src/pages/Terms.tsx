import { AlertTriangle, ShieldCheck, HelpCircle, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="py-12 px-4 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm transition-colors">
        <div className="text-center pb-8 border-b border-slate-100 dark:border-slate-800 mb-8">
          <div className="w-14 h-14 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Terms of Service & Disclaimer</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Please read these terms carefully before using JobNews</p>
        </div>

        <div className="space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed">
          {/* CRITICAL DISCLAIMER SECTION */}
          <section className="bg-amber-50/70 dark:bg-amber-900/10 border-2 border-amber-300 dark:border-amber-700/50 rounded-2xl p-6 sm:p-7 shadow-sm transition-colors">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Important Disclaimer & Non-Government Affiliation</h2>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 uppercase tracking-wider mt-0.5">Please verify all official notices independently</p>
              </div>
            </div>
            <div className="space-y-3 text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed">
              <p>
                <strong>1. Independent Informational Platform:</strong> JobNews is an independent, privately-operated informational job portal and announcement board. We are <strong>NOT affiliated with, endorsed by, or acting as an official representative</strong> of any Government Ministry, Department, Public Service Commission, State Corporation, Private Company, or Overseas Recruitment Agency.
              </p>
              <p>
                <strong>2. Verification of Official Notices:</strong> All job postings, vacancy announcements, gazette summaries, and application deadlines published on JobNews are curated from publicly available government gazettes, national newspapers, official circulars, and direct employer announcements. While we strive for maximum accuracy, applicants are strictly advised to <strong>verify all details directly with the official employer notice, government gazette, or official company website</strong> before submitting applications or original documents.
              </p>
              <p>
                <strong>3. Zero Recruitment Fees Policy:</strong> JobNews is strictly a job information aggregator. We do not process applications, conduct interviews, or charge any application, registration, or recruitment fees from job candidates. If any third party claims to represent JobNews and demands money for employment placement, please report them immediately to the relevant law enforcement authorities.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using JobNews ("the Website"), you accept and agree to be bound by these Terms of Service and our Disclaimer. If you do not agree to these terms, you should not browse, view, or use any services provided by our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 2. Use of Information & Content
            </h2>
            <p className="mb-3">
              All content published on JobNews—including text notices, job descriptions, PDF attachments, and employer logos—is provided solely for personal, non-commercial informational purposes.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>You may download and view job notices for personal use during your job search.</li>
              <li>You may not republish, sell, modify, or systematically scrape content from JobNews for commercial exploitation without written permission.</li>
              <li>We reserve the right to modify, suspend, or remove any job notice at any time without prior warning.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. Limitation of Liability</h2>
            <p className="mb-3">
              To the fullest extent permitted by law, JobNews, its owners, administrators, and contributors shall not be held liable for any direct, indirect, incidental, consequential, or special damages arising out of:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm">
              <li>Any typographical errors, outdated deadlines, or omissions in the job summaries.</li>
              <li>Any recruitment delays, cancellations of vacancies, or rejection of applications by employers.</li>
              <li>Any interactions, transactions, or communications between job applicants and third-party employers linked from our website.</li>
              <li>Any loss of data, income, or opportunity resulting from the use of or inability to access our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. External Links & Third-Party Websites</h2>
            <p>
              Our job notices often contain hyperlinks to third-party portals (`apply_url`), government recruitment websites, or official PDF downloads hosted on external servers. JobNews does not exercise control over these external websites and is not responsible for their availability, security, or privacy practices. Accessing external links is done at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Modifications to Terms</h2>
            <p>
              We reserve the right to amend or update these Terms of Service and Disclaimer at our sole discretion at any time. Any changes will become effective immediately upon posting on this page, with the updated revision date indicated at the top. Continued browsing of the website after changes constitutes your binding acceptance of the updated terms.
            </p>
          </section>

          <section className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Need clarification regarding our terms?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">We are always transparent and ready to help.</p>
            </div>
            <Link
              to="/contact"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors text-sm shrink-0"
            >
              Contact Us
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
