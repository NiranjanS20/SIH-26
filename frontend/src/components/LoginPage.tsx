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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await loginUser(username.trim(), password);
      setUser(user);
      // Both roles land on mine-selection page
      onNavigate('mine-selection');
    } catch (err: any) {
      const msg = err.message || 'Authentication failed';
      setError(msg === 'Failed to fetch' ? 'Unable to connect to the authentication server.' : msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'site_manager') => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('sitemanager');
      setPassword('site123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#D97706]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#0E7C7B]/10 rounded-full blur-[100px]" />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Back to landing */}
        <button
          onClick={() => onNavigate('landing')}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Home
        </button>

        {/* Card */}
        <div className="bg-[#13171E]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/60">
          {/* Logo & branding */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D97706] to-[#92400E] mb-4 shadow-lg shadow-amber-900/40">
              <span className="material-symbols-outlined text-white text-2xl">landslide</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">MOIL Intelligence</h1>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Operational Portal — Secure Access
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-sm">
                  person
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  autoComplete="username"
                  className="w-full pl-9 pr-4 py-3 bg-[#1C2130] border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/40 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 text-sm">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-3 bg-[#1C2130] border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-semibold">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D97706] to-[#B45309] text-white font-extrabold text-sm tracking-wider uppercase shadow-lg shadow-amber-900/30 hover:from-[#F59E0B] hover:to-[#D97706] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Sign In to Portal'
              )}
            </button>
          </form>


        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-slate-600 text-xs font-medium">
          MOIL Intelligent Operations Platform
        </p>
      </div>
    </div>
  );
};
