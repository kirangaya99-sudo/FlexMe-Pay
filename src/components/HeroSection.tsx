import React from 'react';
import { ArrowRight, Zap, Shield, CheckCircle2, Lock, Smartphone, Sparkles, Server, Gift } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onStartRecharge: () => void;
  onStartCollect: () => void;
  onOpenMerchant: () => void;
  onStartTargetSmp?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartRecharge,
  onStartCollect,
  onOpenMerchant,
  onStartTargetSmp,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/30 dark:from-slate-950 dark:via-slate-900/60 dark:to-slate-950">
      
      {/* Heavy Animated Ambient Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-0 right-10 w-[450px] h-[450px] bg-pink-500/10 rounded-full blur-3xl pointer-events-none animate-float-reverse"></div>
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Proposition and Actions */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-7 flex flex-col justify-center space-y-6"
          >
            
            {/* Animated Metadata Trust Line */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 font-extrabold flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
                FLEXME PAY OFFICIAL
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                FlexMe Admin Protected
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <a 
                href="https://instagram.com/flexme.pay" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-pink-600 dark:text-pink-400 font-extrabold hover:underline flex items-center gap-1"
              >
                <span>Instagram: @flexme.pay</span>
              </a>
            </div>

            {/* Headline with balanced wrap and gradient flourish */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]" style={{ textWrap: 'balance' }}>
              FlexMe Pay: <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">Play Store Recharge</span> & TargetSMP Server Passes.
            </h1>

            {/* Subheading / Value Proposition */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Buy 100% genuine Google Play redeem codes, renew your <strong className="text-emerald-600 dark:text-emerald-400 font-bold">TargetSMP</strong> Minecraft server pass, and collect UPI payments instantly with <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">FlexMe Pay</strong>. Verified by <strong className="text-slate-900 dark:text-white">FlexMe Admin</strong> with 24/7 Instagram support (<a href="https://instagram.com/flexme.pay" target="_blank" rel="noopener noreferrer" className="text-pink-600 dark:text-pink-400 font-bold hover:underline">@flexme.pay</a>).
            </p>

            {/* Heavy Animated CTA Button Group */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={onStartRecharge}
                className="flex items-center gap-2.5 px-6 py-4 text-sm font-black text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:opacity-95 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
              >
                <Gift className="w-4 h-4 text-indigo-200" />
                <span>Buy Play Store Code</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              {onStartTargetSmp && (
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onStartTargetSmp}
                  className="flex items-center gap-2 px-5 py-4 text-sm font-black text-emerald-950 dark:text-emerald-100 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/25 transition-all whitespace-nowrap cursor-pointer"
                >
                  <Server className="w-4 h-4" />
                  <span>⛏️ TargetSMP Pass (₹120/mo)</span>
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={onStartCollect}
                className="flex items-center gap-2 px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl transition-all whitespace-nowrap cursor-pointer shadow-xs"
              >
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>Collect Payment</span>
              </motion.button>

              <button
                onClick={onOpenMerchant}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline underline-offset-4 decoration-slate-300 hover:decoration-slate-900 transition-colors py-2 px-2 whitespace-nowrap cursor-pointer"
              >
                Merchant Desk & API →
              </button>
            </div>

            {/* Trust Evidence Adjacency */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Instant 5s Code SMS</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Cashfree 256-Bit SSL</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>All UPI Apps Supported</span>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Visual Focal Carrier with 3D Tilt Hover and Floating Elements */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-900 aspect-[16/11] group">
              <img
                src="/src/assets/images/playstore_payment_hero_1793430819286.jpg"
                alt="Cashfree payment collection terminal and Google Play Store voucher"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              
              {/* Overlay trust scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-extrabold text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      Verified Integration
                    </p>
                    <p className="text-base font-black text-white">Cashfree Payments Gateway v2.4</p>
                  </div>
                  <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1 rounded-xl text-xs font-mono font-bold backdrop-blur-xs">
                    ONLINE · 99.98% UP
                  </div>
                </div>
              </div>
            </div>

            {/* Quick floating voucher preview card with animation */}
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-5 -left-3 sm:-bottom-6 sm:-left-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-2xl flex items-center gap-3.5 z-20"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-md">
                <Lock className="w-5 h-5 font-black" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Instant UPI Soundbox</p>
                  {/* Animated soundbox equalizer bars */}
                  <span className="flex items-center gap-0.5 h-3">
                    <span className="sound-bar"></span>
                    <span className="sound-bar"></span>
                    <span className="sound-bar"></span>
                    <span className="sound-bar"></span>
                  </span>
                </div>
                <p className="text-xs font-black text-slate-900 dark:text-white">Live Voice Confirmation</p>
              </div>
            </motion.div>

            {/* Floating TargetSMP Badge Top-Right */}
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-3 sm:-top-5 sm:-right-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl p-3 shadow-xl flex items-center gap-2.5 z-20 border border-emerald-400/40"
            >
              <Server className="w-5 h-5" />
              <div>
                <p className="text-[10px] uppercase font-black text-emerald-200">play.targetsmp.in</p>
                <p className="text-xs font-extrabold">TargetSMP Pass ₹120</p>
              </div>
            </motion.div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};
