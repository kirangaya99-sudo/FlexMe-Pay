import React, { useState, useEffect } from 'react';
import { PLAYSTORE_PACKS } from '../data/mockData';
import { PlayStoreVoucherPack } from '../types/payment';
import { Gift, ShieldCheck, Zap, Sparkles, Check, ArrowRight, HelpCircle, UserCheck, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface PlayStoreRechargeProps {
  onInitiatePayment: (orderData: {
    amount: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    purpose: string;
    isPlayStoreOrder: boolean;
  }) => void;
}

export const PlayStoreRecharge: React.FC<PlayStoreRechargeProps> = ({ onInitiatePayment }) => {
  const { currentUser, isLoggedIn, openLoginModal } = useAuth();
  const [selectedPack, setSelectedPack] = useState<PlayStoreVoucherPack>(PLAYSTORE_PACKS[3]); // ₹500 default
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<string>('750');

  const [customerName, setCustomerName] = useState<string>(() => currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>(() => currentUser?.email || '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Auto-sync with logged in Google account
  useEffect(() => {
    if (currentUser) {
      if (!customerName || customerName === 'Customer') setCustomerName(currentUser.name);
      if (!customerEmail || customerEmail === 'customer@playstore.pw') setCustomerEmail(currentUser.email);
    }
  }, [currentUser]);

  const effectiveAmount = isCustomAmount ? (parseInt(customAmount, 10) || 0) : selectedPack.amount;

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!customerName.trim()) {
      errs.name = 'Please enter recipient name';
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Valid 10-digit mobile number required for SMS code delivery';
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      errs.email = 'Valid email required for official invoice and backup code';
    }
    if (isCustomAmount) {
      const amt = parseInt(customAmount, 10);
      if (isNaN(amt) || amt < 10 || amt > 50000) {
        errs.amount = 'Amount must be between ₹10 and ₹50,000';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onInitiatePayment({
      amount: effectiveAmount,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      purpose: `Google Play Gift Card ₹${effectiveAmount}`,
      isPlayStoreOrder: true,
    });
  };

  return (
    <section id="recharge-section" className="py-12 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">
            Instant Digital Fulfillment
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Purchase Google Play Store Recharge Code
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Select an amount below to receive an authentic 16-digit Google Play redeem code immediately after Cashfree payment. Zero convenience fee applied.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Form & Amount Grid */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Denominations Selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white">
                    Select Gift Card Amount
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomAmount(!isCustomAmount)}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {isCustomAmount ? 'Choose Standard Pack' : 'Enter Custom Amount'}
                  </button>
                </div>

                {!isCustomAmount ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PLAYSTORE_PACKS.map((pack) => {
                      const isSelected = selectedPack.id === pack.id;
                      return (
                        <motion.button
                          key={pack.id}
                          whileHover={{ scale: 1.04, y: -2 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          onClick={() => {
                            setSelectedPack(pack);
                            setIsCustomAmount(false);
                          }}
                          className={`relative text-left p-3.5 rounded-2xl border transition-all text-xs cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-600/30 shadow-md'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-2xs'
                          }`}
                        >
                          {pack.popular && (
                            <span className="absolute -top-2 right-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-xs">
                              HOT
                            </span>
                          )}
                          <div className="font-black text-lg text-slate-900 dark:text-white tabular-nums">
                            ₹{pack.amount.toLocaleString('en-IN')}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 mt-1 truncate font-medium">
                            {pack.tagline}
                          </div>
                          <div className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] mt-1.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>+{pack.bonusPoints} Flex Points</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Custom Amount (₹10 - ₹50,000)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="10"
                        max="50000"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="e.g. 750"
                        className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    {errors.amount && (
                      <p className="text-xs text-rose-500 mt-1 font-medium">{errors.amount}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Details */}
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Customer & Delivery Details</span>
                    <span className="text-xs font-normal text-slate-500">(For code dispatch)</span>
                  </h3>

                  {isLoggedIn ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Account Connected: {currentUser?.name}</span>
                      <button
                        type="button"
                        onClick={() => openLoginModal()}
                        className="underline hover:text-emerald-900 dark:hover:text-white ml-1 cursor-pointer"
                      >
                        Switch
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openLoginModal()}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-medium border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      <Lock className="w-3 h-3 text-indigo-500" />
                      <span>Sign in with password to pre-fill</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Raunak Kumar"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number (For Instant SMS) *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-500 mt-1 font-medium">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address (For Official Receipt & Backup) *
                  </label>
                  <input
                    type={isLoggedIn && customerEmail === currentUser?.email ? "password" : "email"}
                    value={isLoggedIn && customerEmail === currentUser?.email ? '••••••••••••••••' : customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    onFocus={() => {
                      if (isLoggedIn && customerEmail === currentUser?.email) {
                        setCustomerEmail('');
                      }
                    }}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isLoggedIn ? 'Account email is active and masked for privacy (never displayed in plain text).' : 'Used strictly for sending your official redeem code voucher.'}
                  </p>
                  {errors.email && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Order Summary & Pay Action */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                  <span>Google Play Voucher Value</span>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                    ₹{effectiveAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                  <span>Cashfree Processing Fee</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹0 (FREE)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-3">
                  <span>Instant Delivery Guarantee</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 5-10 Seconds
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs text-slate-500">Total Payable Amount</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                      ₹{effectiveAmount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Secured by</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Cashfree Payments</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-99"
                >
                  <span>Proceed to Cashfree Checkout (₹{effectiveAmount.toLocaleString('en-IN')})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Visual Showcase & Instructions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Visual Card with Generated High Fidelity Image */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-md">
              <div className="relative aspect-[4/3]">
                <img
                  src="/src/assets/images/playstore_giftcards_collection_1793430820134.jpg"
                  alt="Official Google Play recharge cards and voucher tokens"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white">
                    <p className="text-xs uppercase font-semibold text-emerald-400">Official Google Play Balance</p>
                    <p className="text-sm font-bold">100% Valid Indian Regional Codes</p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-800/90 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  How PlayStore Payment Works
                </h4>
                
                <ol className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <span>Choose amount & provide your mobile number.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <span>Pay instantly using any UPI app (GPay, PhonePe, Paytm) or Cards on Cashfree.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <span>Redeem code displays instantly on screen and is dispatched via SMS.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      4
                    </span>
                    <span>Click "Redeem on Play Store" to top up your Google account with 1 tap.</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Refund & Safety Guarantee Notice */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>PlayStore Payment by PW Assurance</span>
              </div>
              <p>
                All Google Play codes are generated in real-time through verified distributor APIs. In the rare event of a failed transaction, Cashfree automated refunds process within 24 hours back to your original source.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
