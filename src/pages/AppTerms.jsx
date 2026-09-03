import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ArrowLeft } from 'lucide-react';

const AppTerms = () => {
  const currentDate = "September 3, 2026";

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 py-12 px-6 sm:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2.5 rounded-xl shadow-sm">
              <Wallet size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">MyExpense</h1>
              <p className="text-gray-500 text-xs font-semibold tracking-wide uppercase mt-0.5">Track • Save • Grow</p>
            </div>
          </div>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors w-max"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-500 font-medium mb-10">Last Updated: {currentDate}</p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using the MyExpense application, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use the application.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              MyExpense provides personal financial tools for tracking your money. The services include, but are not limited to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Tracking expenses</li>
              <li>Recording received amounts</li>
              <li>Tracking savings</li>
              <li>Managing budgets</li>
              <li>Managing reminders</li>
              <li>Viewing transactions</li>
              <li>Viewing financial analytics</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
            <p className="text-gray-700 leading-relaxed">
              You are entirely responsible for the information and data you enter into the application. You are also responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Personal Financial Information Disclaimer</h2>
            <p className="text-gray-700 leading-relaxed font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">
              MyExpense is strictly a personal tracking tool. We do not provide financial advice, investment advice, banking services, or professional financial recommendations. Any decisions you make based on the information provided by the application are made at your own risk.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Account Security</h2>
            <p className="text-gray-700 leading-relaxed">
              You must protect your account access. If you suspect any unauthorized use of your account or any other breach of security, you must notify us immediately. MyExpense will not be liable for any loss or damage arising from your failure to comply with this security obligation.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When using MyExpense, you agree that you must not:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Attempt unauthorized access to the application or its related systems.</li>
              <li>Abuse, disrupt, or interfere with the application's normal functionality.</li>
              <li>Attempt to access, modify, or delete another user's data.</li>
              <li>Use the service for any illegal, harmful, or fraudulent purposes.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Service Availability</h2>
            <p className="text-gray-700 leading-relaxed">
              We strive to keep MyExpense available and running smoothly. However, the service may be updated, changed, or temporarily unavailable for maintenance or due to technical issues beyond our control. We do not guarantee 100% uptime or uninterrupted access to the application.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to the Service or Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              MyExpense reserves the right to modify, suspend, or discontinue the application (or any part thereof) at any time. We may also update these Terms of Service when necessary. Your continued use of the application following the posting of any changes constitutes acceptance of those changes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions or concerns about these Terms of Service, please contact the developer at <a href="mailto:support@myexpense.com" className="text-gray-900 font-bold hover:underline">support@myexpense.com</a>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 font-medium text-center">
            © {new Date().getFullYear()} MyExpense. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppTerms;
