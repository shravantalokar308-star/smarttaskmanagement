import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { Layers, ArrowRight, User, Mail, Lock, ShieldAlert } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, googleAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please add all onboarding fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  // Real Google OAuth popup — opens Google account selector
  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError('');
        await googleAuth(tokenResponse.access_token);
        navigate('/');
      } catch (err) {
        setError(err || 'Google authentication failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google Sign-Up was canceled or failed'),
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="synapse-bg" />

      <div className="w-full max-w-md transform rounded-2xl glass-panel bg-[#13172C]/60 p-8 shadow-2xl transition-all duration-300 border border-slate-800/80 z-10">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 mb-3">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build projects and sync team tasks on <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent font-semibold">Synapse</span>
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs font-medium text-rose-400 mb-6 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-Up Button — FIRST, like real websites */}
        <div className="mb-6">
          <button
            type="button"
            disabled={loading}
            onClick={() => triggerGoogleLogin()}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700/60 bg-white hover:bg-gray-50 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>
        </div>

        {/* Separator / OR */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-x-0 h-px bg-slate-800/60" />
          <span className="relative bg-[#13172C] px-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            OR SIGN UP WITH EMAIL
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-slate-800/60 bg-slate-950/40 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition-standard focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-slate-800/60 bg-slate-950/40 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition-standard focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div className="text-left">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-slate-800/60 bg-slate-950/40 py-3 pl-11 pr-4 text-sm text-slate-200 outline-none transition-standard focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 hover:brightness-110 active:scale-[0.98] transition-standard disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating workspace profile...' : 'Sign Up Free'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-slate-800/40 pt-5">
          <p className="text-xs text-slate-400">
            Already have an account on Synapse?{' '}
            <Link 
              to="/login" 
              className="font-semibold text-indigo-400 hover:text-indigo-300 transition-standard"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
