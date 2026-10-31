import React, { useState, useEffect } from 'react';
import { POPULAR_GAMES } from '../data/mockData';
import { GameProduct } from '../types/payment';
import { Sparkles, ArrowRight, ShieldCheck, Gamepad2, Check, GraduationCap, BookOpen, AlertCircle } from 'lucide-react';

export const PW_CLASS_9TH_TIERS = [
  { amount: 4000, name: 'Class 9th Foundation Batch', desc: 'Science + Maths + Social complete course' },
  { amount: 5500, name: 'Class 9th Udaan Regular', desc: 'Live lectures + DPPs + NCERT discussions' },
  { amount: 6000, name: 'Class 9th Udaan Pro', desc: 'Doubt Engine 24/7 + Test Series' },
  { amount: 7000, name: 'Class 9th Olympiad & NTSE', desc: 'Advanced competition prep + Mentorship' },
  { amount: 8000, name: 'Class 9th 2-Year Foundation', desc: 'Class 9 + Class 10 complete package' },
  { amount: 9000, name: 'Class 9th Elite Mentorship', desc: 'Personal teacher guidance + weekly 1-on-1' },
  { amount: 10000, name: 'Class 9th Ultimate All-Access', desc: 'Unlimited access to all batches & study material' },
];

interface GameTopUpProps {
  onInitiatePayment: (orderData: {
    amount: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    purpose: string;
    isPlayStoreOrder: boolean;
  }) => void;
}

import { useAuth } from '../context/AuthContext';

export const GameTopUp: React.FC<GameTopUpProps> = ({ onInitiatePayment }) => {
  const { currentUser } = useAuth();
  const [selectedGame, setSelectedGame] = useState<GameProduct>(POPULAR_GAMES[0]);
  const [playerId, setPlayerId] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<number>(POPULAR_GAMES[0].minAmount);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>(() => currentUser?.email || '');
  const [customerName, setCustomerName] = useState<string>(() => currentUser?.name || '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!customerEmail) setCustomerEmail(currentUser.email);
    }
  }, [currentUser]);

  const isPw = selectedGame.id === 'pw_course';

  const gameTiers = isPw
    ? PW_CLASS_9TH_TIERS.map(t => t.amount)
    : [
        selectedGame.minAmount,
        Math.round(selectedGame.minAmount * 2.5),
        Math.round(selectedGame.minAmount * 5),
        Math.round(selectedGame.minAmount * 10),
      ];

  const handleSelectGame = (game: GameProduct) => {
    setSelectedGame(game);
    if (game.id === 'pw_course') {
      setSelectedTier(4000);
    } else {
      setSelectedTier(game.minAmount);
    }
    setErrors({});
  };

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (isPw) {
      const cleanPwPhone = playerId.replace(/\D/g, '');
      if (!playerId.trim() || cleanPwPhone.length < 10) {
        errs.playerId = 'Valid 10-digit PW registered mobile number is required';
      }
      if (!customerName.trim()) {
        errs.customerName = 'Please enter student full name';
      }
    } else {
      if (!playerId.trim()) {
        errs.playerId = `Please enter your ${selectedGame.name} Player ID / UID`;
      }
      if (!customerName.trim()) {
        errs.customerName = 'Please enter your name';
      }
    }

    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Valid 10-digit mobile number required for SMS receipt';
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      errs.email = 'Valid email required for confirmation';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isPw) {
      const selectedBatch = PW_CLASS_9TH_TIERS.find(t => t.amount === selectedTier);
      const batchTitle = selectedBatch ? selectedBatch.name : `Class 9th Batch ₹${selectedTier}`;

      // User explicit rule: "PW में तुम कोड नहीं डालना" -> isPlayStoreOrder: false
      onInitiatePayment({
        amount: selectedTier,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        purpose: `PW ${batchTitle} - Student: ${customerName.trim()} (PW Mobile: ${playerId.trim()})`,
        isPlayStoreOrder: false,
      });
    } else {
      // User explicit rule: "Target SMP और FF Max, BGMI आदि में Play Store का कोड डालना ठीक है" -> isPlayStoreOrder: true
      onInitiatePayment({
        amount: selectedTier,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        purpose: `${selectedGame.name} (${selectedGame.denomination}) - Player UID: ${playerId.trim()}`,
        isPlayStoreOrder: true,
      });
    }
  };

  return (
    <section id="game-topup-section" className="py-12 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mb-10">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
            Game Top-Up & PW Class 9th Batches
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Direct In-Game Top-Up & Course Enrollment
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Recharge Free Fire Diamonds, BGMI UC with instant Google Play codes, or enroll in Physics Wallah Class 9th official batches directly with zero gateway surcharge.
          </p>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-10">
          {POPULAR_GAMES.map((game) => {
            const isSelected = selectedGame.id === game.id;
            const isGamePw = game.id === 'pw_course';
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => handleSelectGame(game)}
                className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {isGamePw && (
                  <span className="absolute -top-2 right-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                    Class 9th
                  </span>
                )}
                <div className="text-2xl mb-2">{game.icon}</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {game.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {game.denomination}
                </div>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-2 tabular-nums">
                  From ₹{game.minAmount.toLocaleString('en-IN')}
                </div>
              </button>
            );
          })}
        </div>

        {/* Top-Up Form */}
        <div className="bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-700/60">
              <span className="text-3xl">{selectedGame.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{isPw ? 'PW Physics Wallah (Class 9th Batches)' : `Recharge ${selectedGame.name}`}</span>
                  {isPw && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                      Class 9th Exclusive
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isPw 
                    ? 'Official Class 9th course activation · Verified by FLEX Admin directly (No Play Store code required)' 
                    : 'Instant Play Store redeem code / in-game delivery via Cashfree fast checkout'}
                </p>
              </div>
            </div>

            {/* Select Denomination Tier */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {isPw ? 'Select PW Class 9th Batch Tier *' : `Select ${selectedGame.denomination} Pack *`}
                </label>
                {isPw && (
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    7 Batches (₹4,000 - ₹10,000)
                  </span>
                )}
              </div>

              {isPw ? (
                /* PW Class 9th Dedicated 7 Tiers */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PW_CLASS_9TH_TIERS.map((tier) => {
                    const isSelected = selectedTier === tier.amount;
                    return (
                      <button
                        key={tier.amount}
                        type="button"
                        onClick={() => setSelectedTier(tier.amount)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-indigo-600 dark:border-indigo-500 bg-white dark:bg-slate-800 ring-2 ring-indigo-500/20 shadow-md'
                            : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {tier.name}
                          </span>
                          <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                            ₹{tier.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {tier.desc}
                        </p>
                        {isSelected && (
                          <div className="mt-2 pt-1.5 border-t border-indigo-100 dark:border-indigo-900/60 flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                            <Check className="w-3 h-3" />
                            <span>Selected Class 9th Batch</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Regular Games Tiers */
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {gameTiers.map((tierAmt) => (
                    <button
                      key={tierAmt}
                      type="button"
                      onClick={() => setSelectedTier(tierAmt)}
                      className={`py-3 px-4 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedTier === tierAmt
                          ? 'border-indigo-600 dark:border-indigo-500 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-base font-black tabular-nums">₹{tierAmt.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Play Store Code Delivered
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notice for PW vs Games */}
            {isPw ? (
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Physics Wallah Class 9th Batch Enrollment Rules</span>
                </div>
                <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80">
                  PW में Play Store का कोड नहीं दिया जाएगा। आपका क्लास 9th बैच सीधे आपके रजिस्टर्ड PW मोबाइल नंबर पर एक्टिवेट और एनरोल होगा।
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Play Store redeem code automatically issued and delivered upon admin confirmation.</span>
              </div>
            )}

            {/* Identification & Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isPw ? 'PW Registered Mobile Number *' : `${selectedGame.name} Player ID / UID *`}
                </label>
                <input
                  type={isPw ? 'tel' : 'text'}
                  value={playerId}
                  onChange={(e) => {
                    setPlayerId(e.target.value);
                    if (errors.playerId) setErrors(prev => ({ ...prev, playerId: '' }));
                  }}
                  placeholder={isPw ? 'e.g. 9876543210 (PW Registered Number)' : 'e.g. 5184910284'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {isPw ? '(Enter the 10-digit mobile number linked to your PW app account)' : '(Enter your in-game numeric player ID / character UID)'}
                </span>
                {errors.playerId && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.playerId}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isPw ? 'Student Full Name *' : 'Your Full Name *'}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName) setErrors(prev => ({ ...prev, customerName: '' }));
                  }}
                  placeholder={isPw ? 'e.g. Raunak Kumar (Student Name)' : 'e.g. Raunak Kumar'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.customerName && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.customerName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Billing Contact Mobile Number *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.phone && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isPw ? 'Student / Parent Email Address *' : 'Email Address *'}
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="e.g. student@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Checkout Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto py-3.5 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-99"
              >
                <span>
                  {isPw 
                    ? `Enroll in Class 9th Batch (₹${selectedTier.toLocaleString('en-IN')})` 
                    : `Pay via Cashfree (₹${selectedTier.toLocaleString('en-IN')})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        </div>

      </div>
    </section>
  );
};
