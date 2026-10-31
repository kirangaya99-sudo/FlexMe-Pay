import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck, Moon, Sun, ArrowUpRight, LogOut, ChevronDown,
  CheckCircle2, User, KeyRound, Lock, Shield, Zap, Sparkles, MessageCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { FlexMeLogo } from './FlexMeLogo';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  toggleDark: () => void;
  onOpenQuickPay: () => void;
  pendingCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  toggleDark,
  onOpenQuickPay,
  pendingCount = 0,
}) => {
  const { currentUser, isLoggedIn, isAdmin, openLoginModal, logout } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl transition-colors shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Zone 1: FlexMe Brand Logo & Wordmark */}
        <div 
          onClick={() => setActiveTab('recharge')}
          className="cursor-pointer transition-transform active:scale-95"
          title="FlexMe Pay Home"
        >
          <FlexMeLogo size="md" />
        </div>

        {/* Zone 2: Navigation Links with Animated Pill Indicators */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setActiveTab('recharge')}
            className={`px-3.5 py-2 rounded-xl transition-all relative cursor-pointer ${
              activeTab === 'recharge' 
                ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/25' 
                : 'hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            Google Play Cards
          </button>

          <button
            onClick={() => setActiveTab('targetsmp')}
            className={`px-3.5 py-2 rounded-xl transition-all relative flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'targetsmp' 
                ? 'text-white bg-emerald-600 shadow-md shadow-emerald-600/25' 
                : 'hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 text-emerald-600 dark:text-emerald-400 font-extrabold'
            }`}
          >
            <span>⛏️ TargetSMP Pass</span>
            <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              ₹120
            </span>
          </button>

          <button
            onClick={() => setActiveTab('games')}
            className={`px-3.5 py-2 rounded-xl transition-all relative cursor-pointer ${
              activeTab === 'games' 
                ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/25' 
                : 'hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            Game & PW Top-Up
          </button>

          <button
            onClick={() => setActiveTab('collect')}
            className={`px-3.5 py-2 rounded-xl transition-all relative cursor-pointer ${
              activeTab === 'collect' 
                ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/25' 
                : 'hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            Collect Payment
          </button>

          {/* DEDICATED PAYMENT REQUESTS TAB FOR OWNER WITH ANIMATED BADGE */}
          <button
            onClick={() => setActiveTab('track')}
            className={`px-3.5 py-2 rounded-xl transition-all relative flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'track' 
                ? 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-600/25 font-black' 
                : 'hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 text-indigo-600 dark:text-indigo-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Payment Requests</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-bounce shadow-xs">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('merchant')}
            className={`px-3 py-2 rounded-xl transition-all relative flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'merchant' 
                ? 'text-white bg-indigo-600 shadow-md' 
                : 'hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span>Merchant Desk</span>
            {isAdmin && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`px-3 py-2 rounded-xl transition-all relative flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'support' 
                ? 'text-white bg-indigo-600 shadow-md' 
                : 'hover:text-slate-950 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <span>Helpline Bot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>
        </nav>

        {/* Zone 3: Verified Status + Instagram + Auth + Pay Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

          {/* Authenticated Role Badge */}
          <div className="hidden xl:flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-[11px] font-bold">
            {isAdmin ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>🛡️ FlexMe Admin (Owner)</span>
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Verified Member: {currentUser?.name}</span>
              </span>
            )}
          </div>
          
          {/* Instagram Support @flexme.pay Button with Animated Pulsing Glow */}
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://instagram.com/flexme.pay"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram Support: @flexme.pay"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 shadow-md shadow-pink-500/20 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="hidden sm:inline">@flexme.pay</span>
          </motion.a>

          {/* Theme Toggle */}
          <button
            onClick={toggleDark}
            aria-label="Toggle Color Theme"
            className="p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* User Auth Profile Trigger */}
          {!currentUser ? (
            <button
              onClick={() => openLoginModal()}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs transition-all whitespace-nowrap active:scale-95 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Sign In / Admin</span>
            </button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
              >
                <div className="relative">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover border-2 border-indigo-500"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  {isAdmin ? (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900" title="FlexMe Admin"></span>
                  ) : (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-slate-900"></span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {isAdmin ? '🛡️ FLEX Admin (Owner)' : 'Member Account'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Menu Dropdown */}
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          {isAdmin ? 'Store Owner Account' : 'Customer Account'}
                        </span>
                      </div>
                      <div className="font-black text-sm text-slate-900 dark:text-white truncate">
                        {currentUser.name}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Zero-Leak Secure Session</span>
                      </div>
                    </div>

                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          setActiveTab('track');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer font-bold"
                      >
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-500" />
                          <span>Payment Requests Queue</span>
                        </span>
                        {pendingCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                            {pendingCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('merchant');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4 text-amber-500" />
                        <span>Merchant Approvals Desk</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          openLoginModal();
                        }}
                        className="w-full px-4 py-2 text-left text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 font-bold cursor-pointer"
                      >
                        <User className="w-4 h-4 text-indigo-500" />
                        <span>Switch Account / Sign In</span>
                      </button>

                      <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          openLoginModal('FORMAT_PASSWORD');
                        }}
                        className="w-full px-4 py-2 text-left text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer text-[11px]"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                        <span>Format Password (Secret Key)</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full px-4 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 font-bold cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Quick Pay CTA */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenQuickPay}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-md transition-all whitespace-nowrap active:scale-95 cursor-pointer"
          >
            <span className="hidden sm:inline">Pay via Cashfree</span>
            <span className="sm:hidden">Pay</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Subnav Bar with Heavy Touch-Friendly Tabs */}
      <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/60 scrollbar-none gap-2 bg-slate-50/70 dark:bg-slate-950/70">
        {[
          { id: 'recharge', label: 'Play Cards' },
          { id: 'targetsmp', label: '⛏️ TargetSMP' },
          { id: 'games', label: 'Top-Ups' },
          { id: 'collect', label: 'Collect' },
          { id: 'track', label: `Requests (${pendingCount})`, highlight: pendingCount > 0 },
          { id: 'merchant', label: 'Merchant' },
          { id: 'support', label: '🤖 Bot' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
              activeTab === item.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : item.highlight
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                : 'text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </motion.header>
  );
};
