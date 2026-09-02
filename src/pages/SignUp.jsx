import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Wallet, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LineChart, 
  PiggyBank, 
  PieChart, 
  ArrowLeft,
  User
} from 'lucide-react';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await signUp(email, password, fullName);
      if (error) throw error;
      
      setSuccess(true);
      if (!data?.session) {
        setSuccessMessage("Please check your email to confirm your account.");
      } else {
        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.message || "Failed to create an account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-gray-900">
      {/* Left Section - Hidden on mobile, 45% width on lg screens */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0a0a0a] text-white p-12 flex-col justify-between">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 mb-20">
            <div className="bg-white text-black p-2.5 rounded-xl shadow-sm">
              <Wallet size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">MyExpense</h1>
              <p className="text-gray-400 text-xs font-semibold tracking-wide uppercase mt-0.5">Track • Save • Grow</p>
            </div>
          </div>
          
          {/* Hero Content */}
          <div className="max-w-md">
            <h2 className="text-[2.5rem] font-semibold leading-[1.15] tracking-tight mb-8">
              Start taking control of your money today.
            </h2>
            
            <div className="space-y-6 mt-12">
              <div className="flex items-center gap-4 group">
                <div className="bg-[#1a1a1a] p-3 rounded-full transition-colors group-hover:bg-[#222222]">
                  <LineChart size={24} className="text-gray-300" strokeWidth={2} />
                </div>
                <span className="text-lg font-medium text-gray-300">Track your expenses easily</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="bg-[#1a1a1a] p-3 rounded-full transition-colors group-hover:bg-[#222222]">
                  <PiggyBank size={24} className="text-gray-300" strokeWidth={2} />
                </div>
                <span className="text-lg font-medium text-gray-300">Manage your savings in one place</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="bg-[#1a1a1a] p-3 rounded-full transition-colors group-hover:bg-[#222222]">
                  <PieChart size={24} className="text-gray-300" strokeWidth={2} />
                </div>
                <span className="text-lg font-medium text-gray-300">Understand where your money goes</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-sm text-gray-500 font-medium">
          © {new Date().getFullYear()} MyExpense. All rights reserved.
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-[55%] flex flex-col px-6 py-8 sm:px-12 lg:px-24 xl:px-32 relative">
        {/* Back to Home Link */}
        <div className="flex justify-start">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors w-max"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
        
        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center max-w-[400px] w-full mx-auto mt-8 lg:mt-0">
          
          {/* Mobile Brand - visible only on small screens */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="bg-black text-white p-2.5 rounded-xl shadow-sm">
              <Wallet size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">MyExpense</h1>
              <p className="text-gray-500 text-xs font-semibold tracking-wide uppercase mt-0.5">Track • Save • Grow</p>
            </div>
          </div>

          <div className="mb-8 text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Create your account</h2>
            <p className="text-gray-500 font-medium text-sm">Start tracking your expenses and savings today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900 block">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all sm:text-sm font-medium shadow-sm"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all sm:text-sm font-medium shadow-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all sm:text-sm font-medium shadow-sm"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-900 block">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all sm:text-sm font-medium shadow-sm"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2 pb-1">
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                    required
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                  I agree to the Terms and Privacy Policy
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 font-medium">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 text-green-700 text-sm p-3 rounded-xl border border-green-100 font-medium">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className={`w-full bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm border border-black mt-2 ${loading || success ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-black font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
