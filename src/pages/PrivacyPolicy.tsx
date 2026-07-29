import { Shield, Lock, Eye, Cookie, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="py-12 px-4 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm transition-colors">
        <div className="text-center pb-8 border-b border-slate-100 dark:border-slate-800 mb-8">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Privacy Policy</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <div className="space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 1. Introduction & Consent
            </h2>
            <p className="mb-3">
              Welcome to JobNews ("we," "our," or "us"). We respect your privacy and are committed to protecting any personal information you may share with us or that we collect while operating our website. This Privacy Policy explains how our platform collects, uses, and safeguards your information when you visit our website.
            </p>
            <p>
              By using our website, you hereby consent to our Privacy Policy and agree to its terms. If you do not agree with any part of this policy, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 2. Information We Collect
            </h2>
            <p className="mb-3">
              As an informational vacancy announcement board, JobNews primarily allows visitors to browse job listings anonymously without requiring registration or account creation. However, we may collect certain data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Log Files & Analytics Data:</strong> Like most web platforms, JobNews follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected includes Internet Protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamps, referring/exit pages, and possibly the number of clicks. This data is not linked to any information that is personally identifiable.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Voluntary Communication:</strong> If you contact us directly via email or through our Contact Us form, we may receive additional information about you such as your name, email address, phone number, the contents of the message, and any attachments you send us.
              </li>
            </ul>
          </section>

          <section className="bg-blue-50/60 dark:bg-blue-900/10 border border-blue-200/80 dark:border-blue-800/30 rounded-xl p-6 transition-colors">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 3. Google AdSense & DoubleClick DART Cookies
            </h2>
            <p className="mb-3 text-slate-700 dark:text-slate-300 font-medium">
              We use third-party advertising companies, including Google AdSense, to serve advertisements when you visit our website.
            </p>
            <ul className="list-disc pl-6 space-y-2.5 text-slate-700 dark:text-slate-300 text-sm">
              <li>
                Google, as a third-party vendor, uses cookies to serve ads on JobNews.
              </li>
              <li>
                Google's use of the **DoubleClick DART cookie** enables it and its partners to serve ads to our users based on their visit to JobNews and/or other websites on the Internet.
              </li>
              <li>
                Users may opt out of the use of the DART cookie by visiting the Google Ad and Content Network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">https://policies.google.com/technologies/ads</a>.
              </li>
              <li>
                These third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons in their respective advertisements and links that appear on JobNews, which are sent directly to users' browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
              </li>
            </ul>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic">
              Note: JobNews has no access to or control over these cookies that are used by third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" /> 4. Third-Party Privacy Policies
            </h2>
            <p className="mb-3">
              JobNews's Privacy Policy does not apply to other advertisers, employers, or third-party websites linked within our job postings. When you click on an external link to apply for a job on an employer's website or government portal, you are subject to the privacy policy of that destination website.
            </p>
            <p>
              We strongly advise you to consult the respective Privacy Policies of these third-party ad servers and employers for more detailed information on their practices and instructions about how to opt out of certain options.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">5. Data Protection Rights (GDPR & CCPA)</h2>
            <p className="mb-3">
              We aim to ensure that you are fully aware of all of your data protection rights. Depending on your location, you are entitled to the following:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm">
              <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
              <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
              <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
              <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Children's Information</h2>
            <p>
              Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. JobNews does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
            </p>
          </section>

          <section className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Have questions about our Privacy Policy?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Reach out to our support team anytime.</p>
            </div>
            <Link
              to="/contact"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm shrink-0"
            >
              Contact Support
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
