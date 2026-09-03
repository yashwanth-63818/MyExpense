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

  const { signUp, signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setGoogleLoading(true);
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      setError("Unable to continue with Google. Please try again.");
      setGoogleLoading(false);
    }
  };

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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 font-medium">OR</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading || success || googleLoading}
              type="button"
              className={`mt-6 w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm ${
                (loading || success || googleLoading) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </button>
          </div>

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
