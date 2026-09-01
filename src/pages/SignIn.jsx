import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LineChart, 
  PiggyBank, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react';

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Sign In Data:', { email, password, rememberMe });
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
              Take control of your expenses and build your savings.
            </h2>
            
            <div className="space-y-6 mt-12">
              <div className="flex items-center gap-4 group">
                <div className="bg-[#1a1a1a] p-3 rounded-full transition-colors group-hover:bg-[#222222]">
                  <LineChart size={24} className="text-gray-300" strokeWidth={2} />
                </div>
                <span className="text-lg font-medium text-gray-300">Track every expense</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="bg-[#1a1a1a] p-3 rounded-full transition-colors group-hover:bg-[#222222]">
                  <PiggyBank size={24} className="text-gray-300" strokeWidth={2} />
                </div>
                <span className="text-lg font-medium text-gray-300">Manage your savings</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="bg-[#1a1a1a] p-3 rounded-full transition-colors group-hover:bg-[#222222]">
                  <ShieldCheck size={24} className="text-gray-300" strokeWidth={2} />
                </div>
                <span className="text-lg font-medium text-gray-300">Stay in control of your money</span>
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
        <div className="flex-1 flex flex-col justify-center max-w-[400px] w-full mx-auto mt-12 lg:mt-0">
          
          {/* Mobile Brand - visible only on small screens */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="bg-black text-white p-2.5 rounded-xl shadow-sm">
              <Wallet size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">MyExpense</h1>
              <p className="text-gray-500 text-xs font-semibold tracking-wide uppercase mt-0.5">Track • Save • Grow</p>
            </div>
          </div>

          <div className="mb-10 text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 font-medium text-sm">Sign in to continue managing your finances.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all sm:text-sm font-medium shadow-sm"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all sm:text-sm font-medium shadow-sm"
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between pt-1 pb-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
              </label>
              
              <Link to="/forgot-password" className="text-sm font-semibold text-gray-900 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm border border-black"
            >
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-black font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
