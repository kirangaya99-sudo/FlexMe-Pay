import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MASTER_SECRET_KEY } from '../utils/userStore';
import {
  X, Lock, KeyRound, ShieldCheck, CheckCircle2, ArrowRight,
  ArrowLeft, AlertCircle, Eye, EyeOff, User, RefreshCw, Shield,
  Check, Sparkles, UserPlus, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FlexMeLogo } from './FlexMeLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialMode?: 'LOGIN' | 'FORMAT_PASSWORD' | 'FORMAT_SECRET_KEY';
  isFullPageGate?: boolean;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORMAT_PASSWORD' | 'FORMAT_SECRET_KEY';

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'LOGIN',
  isFullPageGate = false,
}) => {
  const {
    loginWithEmailPassword,
    registerNewAccount,
    formatAccountPassword,
    formatAccountSecretKey,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('LOGIN');

  // Login inputs - STRICTLY blank by default, never prefilled, never listing anyone's email
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Register inputs
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regSecretKey, setRegSecretKey] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);

  // Format password inputs (Reset password using Secret Key)
  const [formatEmail, setFormatEmail] = useState<string>('');
  const [formatSecretKey, setFormatSecretKey] = useState<string>('');
  const [formatNewPassword, setFormatNewPassword] = useState<string>('');
  const [formatConfirmPassword, setFormatConfirmPassword] = useState<string>('');
  const [showFormatPassword, setShowFormatPassword] = useState<boolean>(false);

  // Format secret key inputs (Reset secret key using Password)
  const [secKeyEmail, setSecKeyEmail] = useState<string>('');
  const [secKeyPassword, setSecKeyPassword] = useState<string>('');
  const [secKeyNewKey, setSecKeyNewKey] = useState<string>('');
  const [secKeyConfirmKey, setSecKeyConfirmKey] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize mode when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'FORMAT_SECRET_KEY') {
        setMode('FORMAT_SECRET_KEY');
      } else if (initialMode === 'FORMAT_PASSWORD') {
        setMode('FORMAT_PASSWORD');
      } else {
        setMode('LOGIN');
      }
      // Strictly clear all credential fields on open - NO EMAIL OR PASSWORD LEAK
      setLoginEmail('');
      setLoginPassword('');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
      setRegSecretKey('');
      setFormatEmail('');
      setFormatSecretKey('');
      setFormatNewPassword('');
      setFormatConfirmPassword('');
      setSecKeyEmail('');
      setSecKeyPassword('');
      setSecKeyNewKey('');
      setSecKeyConfirmKey('');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // 1. Handle Strict Password Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const email = loginEmail.trim().toLowerCase();
    const password = loginPassword.trim();

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Password is required. No login without password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginWithEmailPassword(email, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message || 'Incorrect password entered. If forgotten, format it using your Secret Key.');
      } else {
        if (onClose) onClose();
      }
    }, 350);
  };

  // 2. Handle Register New Account with Mandatory Secret Key Creation
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const name = regName.trim();
    const email = regEmail.trim().toLowerCase();
    const password = regPassword.trim();
    const confirm = regConfirmPassword.trim();
    const secretKey = regSecretKey.trim();

    if (!name) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!secretKey || secretKey.length < 3) {
      setErrorMsg('Please create a Secret Key (at least 3 characters) for future password formatting.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = registerNewAccount({
        name,
        email,
        password,
        secretKey,
      });
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message || 'Failed to create account.');
      } else {
        if (onClose) onClose();
      }
    }, 350);
  };

  // 3. Handle Format Password (Reset password using Secret Key)
  const handleFormatPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const email = formatEmail.trim().toLowerCase();
    const secretKey = formatSecretKey.trim();
    const newPass = formatNewPassword.trim();
    const confirmPass = formatConfirmPassword.trim();

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter the email address of the account to format.');
      return;
    }
    if (!secretKey) {
      setErrorMsg('Secret Key is required to format your password.');
      return;
    }
    if (!newPass || newPass.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = formatAccountPassword({
        email,
        secretKey,
        newPassword: newPass,
      });
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg('Password has been successfully formatted! Please type your new password to log in.');
        setLoginEmail(email);
        setLoginPassword('');
        setTimeout(() => {
          setMode('LOGIN');
        }, 1300);
      }
    }, 350);
  };

  // 4. Handle Format Secret Key (Reset secret key using Password)
  const handleFormatSecretKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const email = secKeyEmail.trim().toLowerCase();
    const password = secKeyPassword.trim();
    const newKey = secKeyNewKey.trim();
    const confirmKey = secKeyConfirmKey.trim();

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter your account email.');
      return;
    }
    if (!password) {
      setErrorMsg('Account password is required to format your Secret Key.');
      return;
    }
    if (!newKey || newKey.length < 3) {
      setErrorMsg('New Secret Key must be at least 3 characters long.');
      return;
    }
    if (newKey !== confirmKey) {
      setErrorMsg('New Secret Key and confirm key do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = formatAccountSecretKey({
        email,
        password,
        newSecretKey: newKey,
      });
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg('Your Secret Key has been successfully updated! You can now use it to format your password.');
        setTimeout(() => {
          setMode('LOGIN');
        }, 1300);
      }
    }, 350);
  };

  const cardContent = (
    <div className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden my-6">
      
      {/* Header Bar */}
      <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <FlexMeLogo size="sm" showSubtitle={false} />
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-black">
            PASSWORD REQUIRED
          </span>
        </div>
        {!isFullPageGate && onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Strict Security Banner - No Email Exposure Notice */}
      <div className="bg-indigo-50/80 dark:bg-indigo-950/40 px-5 py-2.5 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200">
        <EyeOff className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span className="text-[11px] leading-tight">
          <strong>Zero Email Leak:</strong> Nobody's email is displayed on screen. Type your email & password manually to enter.
        </span>
      </div>

      <div className="p-6 sm:p-7 space-y-5">
        
        {/* Navigation Tabs between Login, Register & Format */}
        <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer text-center ${
              mode === 'LOGIN'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-black'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer text-center ${
              mode === 'REGISTER'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-black'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Register
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('FORMAT_PASSWORD');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer text-center ${
              mode === 'FORMAT_PASSWORD' || mode === 'FORMAT_SECRET_KEY'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm font-black'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Format
          </button>
        </div>

        {/* ========================================================= */}
        {/* MODE 1: STRICT LOGIN WITH PASSWORD                       */}
        {/* ========================================================= */}
        {mode === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
            <div className="text-center space-y-1">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-1.5 shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Sign In with Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Type your email and password. No login without password.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Email *
              </label>
              <input
                type="email"
                required
                autoFocus
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono shadow-2xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setFormatEmail(loginEmail);
                    setMode('FORMAT_PASSWORD');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Type your password..."
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm tracking-wider font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isLoading ? 'Verifying Password...' : 'Sign In with Password'}</span>
            </button>

            <div className="pt-2 text-center text-xs space-y-1.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer block w-full"
              >
                Don't have an account? Register & Create Secret Key →
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormatEmail(loginEmail);
                  setMode('FORMAT_PASSWORD');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-[11px] block w-full cursor-pointer"
              >
                Format Forgotten Password with Secret Key
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* MODE 2: REGISTER WITH MANDATORY SECRET KEY CREATION       */}
        {/* ========================================================= */}
        {mode === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fade-in">
            <div className="text-center space-y-1">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-1 shadow-xs">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Register New Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create your password and custom Secret Key for password formatting.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Vikas Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Type your email (kept strictly private)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 4 chars..."
                    className="w-full px-3.5 py-2.5 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Confirm password..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* MANDATORY SECRET KEY FIELD (USER CREATES THEIR OWN KEY) */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Create Your Secret Key (अनिवार्य / Required) *</span>
                </label>
              </div>

              <input
                type="text"
                required
                value={regSecretKey}
                onChange={(e) => setRegSecretKey(e.target.value.toUpperCase())}
                placeholder="e.g. MY-KEY-999 or SECRET@2026"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-xs font-bold tracking-wider"
              />

              <p className="text-[10px] text-amber-800/90 dark:text-amber-300/90 leading-tight">
                याद रखें: यह सीक्रेट की सिर्फ आपके पास रहेगी। कभी भी पासवर्ड भूल जाने पर इसी सीक्रेट की से पासवर्ड फॉर्मेट (रीसेट) होगा।
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isLoading ? 'Creating Account...' : 'Register & Save Secret Key'}</span>
            </button>

            <div className="pt-2 text-center text-xs">
              <button
                type="button"
                onClick={() => setMode('LOGIN')}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer"
              >
                Already have an account? Sign In with Password →
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* MODE 3: FORMAT PASSWORD USING SECRET KEY                  */}
        {/* ========================================================= */}
        {mode === 'FORMAT_PASSWORD' && (
          <form onSubmit={handleFormatPasswordSubmit} className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMode('LOGIN')}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-bold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('FORMAT_SECRET_KEY')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Format Secret Key Instead
              </button>
            </div>

            <div className="text-center space-y-1">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-1 shadow-xs">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Format Forgotten Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your account email and Secret Key to format and establish a new password.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Email to Format *
              </label>
              <input
                type="email"
                required
                autoFocus
                value={formatEmail}
                onChange={(e) => setFormatEmail(e.target.value)}
                placeholder="Enter your account email..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Secret Key *
              </label>
              <input
                type="password"
                required
                value={formatSecretKey}
                onChange={(e) => setFormatSecretKey(e.target.value)}
                placeholder="Enter Secret Key created during registration..."
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs tracking-wider font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showFormatPassword ? 'text' : 'password'}
                    required
                    value={formatNewPassword}
                    onChange={(e) => setFormatNewPassword(e.target.value)}
                    placeholder="New password..."
                    className="w-full px-3.5 py-2.5 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormatPassword(!showFormatPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showFormatPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={formatConfirmPassword}
                  onChange={(e) => setFormatConfirmPassword(e.target.value)}
                  placeholder="Confirm password..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Formatting...' : 'Format & Save New Password'}</span>
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* MODE 4: FORMAT SECRET KEY USING PASSWORD                  */}
        {/* ========================================================= */}
        {mode === 'FORMAT_SECRET_KEY' && (
          <form onSubmit={handleFormatSecretKeySubmit} className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMode('LOGIN')}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 font-bold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('FORMAT_PASSWORD')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                Format Password Instead
              </button>
            </div>

            <div className="text-center space-y-1">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-1 shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Format / Update Secret Key
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Type your password to verify ownership and assign your new Secret Key.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Email Address *
              </label>
              <input
                type="email"
                required
                autoFocus
                value={secKeyEmail}
                onChange={(e) => setSecKeyEmail(e.target.value)}
                placeholder="Enter account email..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={secKeyPassword}
                onChange={(e) => setSecKeyPassword(e.target.value)}
                placeholder="Type your password to verify..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Secret Key *
                </label>
                <input
                  type="password"
                  required
                  value={secKeyNewKey}
                  onChange={(e) => setSecKeyNewKey(e.target.value)}
                  placeholder="e.g. NEW-KEY-2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Key *
                </label>
                <input
                  type="password"
                  required
                  value={secKeyConfirmKey}
                  onChange={(e) => setSecKeyConfirmKey(e.target.value)}
                  placeholder="Confirm secret key..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Shield className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Saving...' : 'Format & Save New Secret Key'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );

  // If Full Page Gate mode (visitor is not logged in)
  if (isFullPageGate) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-900 dark:text-white relative overflow-hidden">
        {/* Heavy Ambient floating orbs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl animate-float-reverse"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-glow"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          {cardContent}
        </motion.div>
      </div>
    );
  }

  // Modal mode
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md"
      >
        {cardContent}
      </motion.div>
    </div>
  );
};
