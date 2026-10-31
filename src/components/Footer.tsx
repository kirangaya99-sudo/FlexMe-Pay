import React from 'react';
import { FlexMeLogo } from './FlexMeLogo';

interface FooterProps {
  onNavClick: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="mb-2">
              <FlexMeLogo size="md" showSubtitle={false} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Instant Google Play redeem codes, TargetSMP Minecraft passes, and secure payment collection powered by Cashfree Payments and protected by FlexMe Admin.
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-slate-500">Official Instagram Support:</span>
              <a
                href="https://instagram.com/flexme.pay"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:underline"
              >
                @flexme.pay
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-slate-600 dark:text-slate-400">
            <button onClick={() => onNavClick('recharge')} className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer">
              Play Store Cards
            </button>
            <button onClick={() => onNavClick('targetsmp')} className="hover:text-emerald-600 dark:hover:text-emerald-400 font-bold transition-colors cursor-pointer text-emerald-700 dark:text-emerald-300">
              ⛏️ TargetSMP Server (₹120/mo)
            </button>
            <button onClick={() => onNavClick('games')} className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer">
              Game Top-Up
            </button>
            <button onClick={() => onNavClick('collect')} className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer">
              Collect Payment
            </button>
            <button onClick={() => onNavClick('track')} className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer">
              Track Order
            </button>
            <button onClick={() => onNavClick('merchant')} className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer">
              Merchant Desk
            </button>
            <button onClick={() => onNavClick('support')} className="hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer text-indigo-600 dark:text-indigo-400 font-semibold">
              Helpline Bot
            </button>
            <a
              href="https://instagram.com/flexme.pay"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-md bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-bold hover:opacity-90 transition-opacity"
            >
              Instagram @flexme.pay
            </a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <p>
            © {new Date().getFullYear()} FlexMe Pay · All rights reserved. FlexMe Admin (raunakgaya99@gmail.com). Powered by Cashfree Payments.
          </p>
          <p>
            Google Play is a registered trademark of Google LLC. Follow <a href="https://instagram.com/flexme.pay" target="_blank" rel="noopener noreferrer" className="font-semibold text-pink-600 hover:underline">@flexme.pay</a> on Instagram for 24/7 support.
          </p>
        </div>

      </div>
    </footer>
  );
};
