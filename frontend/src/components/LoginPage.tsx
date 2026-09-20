import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loginUser } from '../services/authService';
import type { PortalRoute } from './Navbar';

interface LoginPageProps {
  onNavigate: (route: PortalRoute) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { setUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await loginUser(username.trim(), password);
      setUser(user);
      if (user.role === 'industry_viewer') {
        onNavigate('industry-viewer');
      } else {
        onNavigate('mine-selection');
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed';
      setError(msg === 'Failed to fetch' ? 'Unable to connect to the authentication server.' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans relative overflow-hidden select-none">
      {/* Formal Top Brand Header Stripe (MOIL Blue & MOIL Yellow) */}
      <div className="w-full h-1.5 flex shrink-0 z-20">
        <div className="w-[85%] bg-[#2B3990]" />
        <div className="w-[15%] bg-[#FEA619]" />
      </div>

      {/* Large Formal Background MOIL Watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        {/* Subtle engineering coordinate grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(43,57,144,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(43,57,144,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />

        {/* Large Formal Centered Full MOIL Logo (Official #2B3990 Indigo Blue) */}
        <div className="relative flex items-center justify-center select-none opacity-[0.20] transition-opacity">
          <svg
            viewBox="0 0 600 600"
            className="w-[720px] h-[720px]"
          >
            {/* Subtle outer technical ring */}
            <circle cx="300" cy="300" r="285" fill="none" stroke="#2B3990" strokeWidth="3" strokeDasharray="8 8" />
            <circle cx="300" cy="300" r="265" fill="none" stroke="#2B3990" strokeWidth="1" />

            {/* Full Solid Official MOIL Blue Circle Badge */}
            <circle cx="300" cy="300" r="240" fill="#2B3990" />

            {/* MOIL White Dome */}
            <path
              d="M 215 230 C 215 150, 385 150, 385 230 Z"
              fill="#FFFFFF"
            />

            {/* Hindi "मॉयल" */}
            <text
              x="300"
              y="300"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="bold"
              fontSize="68"
              letterSpacing="2"
            >
              मॉयल
            </text>

            {/* English "MOIL" */}
            <text
              x="300"
              y="385"
              textAnchor="middle"
              fill="#FFFFFF"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="92"
              letterSpacing="4"
            >
              MOIL
            </text>
          </svg>
        </div>
      </div>

      {/* Top Navbar / Back Navigation */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-6 flex justify-between items-center relative z-10">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#002452] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Home
        </button>

        {/* MOIL Official Small Emblem */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#2B3990] flex flex-col items-center justify-center text-white px-0.5 shadow-sm border border-white/40">
            <div className="w-4 h-2 bg-white rounded-t-full mb-0.5" />
            <span className="text-[5px] leading-tight font-bold tracking-tighter">मॉयल</span>
            <span className="text-[6px] leading-none font-black tracking-tighter">MOIL</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-serif font-black text-[#002452] tracking-wider leading-none">
              MOIL LIMITED
            </span>
            <span className="text-[9px] text-slate-500 font-medium leading-none mt-0.5">
              Govt. of India Enterprise
            </span>
          </div>
        </div>
      </div>

      {/* Centered Login Card Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-[430px] bg-white border border-slate-200 rounded-xl p-8 sm:p-10 shadow-[0_4px_24px_-4px_rgba(0,36,82,0.06)]">
          
          {/* Official Emblem & Header Section */}
          <div className="text-center mb-7">
            {/* Formal Emblem in Card Header */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#2B3990] text-white shadow-sm border-2 border-slate-100 mb-3.5">
              <div className="flex flex-col items-center justify-center">
                <div className="w-5 h-2.5 bg-white rounded-t-full mb-0.5" />
                <span className="text-[6px] leading-tight font-bold tracking-tighter">मॉयल</span>
                <span className="text-[7.5px] leading-none font-black tracking-tighter">MOIL</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-[26px] font-bold text-[#002452] tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5 font-normal">
              Please enter your details below to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username / Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                E-mail or Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your email or username"
                required
                autoComplete="username"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#2B3990] focus:ring-1 focus:ring-[#2B3990] transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-[#2B3990] focus:ring-1 focus:ring-[#2B3990] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#2B3990] border-slate-300 focus:ring-[#2B3990] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={() => setForgotPasswordNotice(!forgotPasswordNotice)}
                className="text-xs text-[#2B3990] hover:text-[#002452] font-semibold hover:underline cursor-pointer transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            {/* Forgot password info box */}
            {forgotPasswordNotice && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                Please contact the MOIL IT Support Desk or your Nodal Officer to reset your portal password.
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Solid Formal Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#2B3990] hover:bg-[#202B73] active:bg-[#182155] text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-slate-400 text-xs font-medium border-t border-slate-200 bg-white relative z-10">
        MOIL Limited &copy; {new Date().getFullYear()} &mdash; A Government of India Enterprise
      </footer>
    </div>
  );
};



