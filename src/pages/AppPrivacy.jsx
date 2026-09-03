import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ArrowLeft } from 'lucide-react';

const AppPrivacy = () => {
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
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-500 font-medium mb-10">Last Updated: {currentDate}</p>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to MyExpense. MyExpense is a personal expense and savings tracking application designed to help you monitor your financial health. This Privacy Policy explains how we collect, use, and protect your information when you use our application.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect information that you directly provide to us while using the application. This may include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Name</li>
              <li>Email address</li>
              <li>Authentication information</li>
              <li>Expense records entered by you</li>
              <li>Savings records entered by you</li>
              <li>Budget information</li>
              <li>Reminder information</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4 font-medium">
              It is important to note that users enter all financial tracking data themselves. MyExpense does not automatically connect to or pull data from your bank accounts.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The information we collect is used strictly for the following purposes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>To provide, maintain, and improve our expense tracking features.</li>
              <li>To accurately display your financial information back to you.</li>
              <li>To manage your account authentication and secure your sessions.</li>
              <li>To improve application functionality and user experience.</li>
              <li>To maintain account security and prevent unauthorized access.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Storage and Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We take data security seriously. Your user data is stored securely using Supabase infrastructure. Access to your data is protected through authentication protocols and Row Level Security (RLS) where applicable, ensuring that you can only access your own information. While we strive to use commercially acceptable means to protect your personal information, please remember that no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              MyExpense uses the following third-party services to operate the application:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li><strong>Supabase:</strong> For authentication and secure database services.</li>
              <li><strong>Google:</strong> For authentication, if you choose to sign in using "Continue with Google".</li>
              <li><strong>Vercel:</strong> For application hosting and delivery.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Sharing</h2>
            <p className="text-gray-700 leading-relaxed">
              MyExpense does not sell your personal information. Your data is only shared with the necessary technical service providers listed above strictly for the purpose of operating and hosting the application.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. User Control</h2>
            <p className="text-gray-700 leading-relaxed">
              You maintain complete control over the data you add to the application. You can manage your account settings, edit or delete your financial records, and update your profile information at any time within the application.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update our Privacy Policy from time to time to reflect changes in our practices or the application. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact the developer at <a href="mailto:support@myexpense.com" className="text-gray-900 font-bold hover:underline">support@myexpense.com</a>.
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

export default AppPrivacy;
