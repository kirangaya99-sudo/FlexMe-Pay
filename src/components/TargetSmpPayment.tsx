import React, { useState } from 'react';
import { 
  ShieldCheck, CheckCircle2, Sparkles, Zap, Award, 
  Clock, ArrowRight, User, Phone, Mail, Gamepad2, 
  HelpCircle, Check, Tag, Server, Flame, Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

interface TargetSmpPlan {
  id: string;
  months: number;
  label: string;
  originalPrice: number;
  discount: number;
  finalPrice: number;
  tagline: string;
  isPopular?: boolean;
  isBestValue?: boolean;
}

export const TARGET_SMP_PLANS: TargetSmpPlan[] = [
  {
    id: 'smp-1m',
    months: 1,
    label: '1 Month',
    originalPrice: 150, // Display MRP
    discount: 30, // Displayed discount: -₹30 OFF
    finalPrice: 120, // Net Owner Profit: ₹20 (Cost: ₹100)
    tagline: '30 Days Pass · Special ₹30 Discount (Save 20%)',
  },
  {
    id: 'smp-2m',
    months: 2,
    label: '2 Months',
    originalPrice: 299, // Display MRP
    discount: 59, // Displayed discount: -₹59 OFF
    finalPrice: 240, // Net Owner Profit: ₹40 (Cost: ₹200)
    tagline: '2 Months Duo Pass · Special ₹59 Discount (Save ₹59!)',
    isPopular: true,
  },
  {
    id: 'smp-3m',
    months: 3,
    label: '3 Months',
    originalPrice: 449,
    discount: 99,
    finalPrice: 350,
    tagline: 'Quarterly Season Pass · Mega ₹99 Discount',
  },
  {
    id: 'smp-4m',
    months: 4,
    label: '4 Months',
    originalPrice: 599,
    discount: 129,
    finalPrice: 470,
    tagline: '4 Months Extended Pass · Save ₹129',
  },
  {
    id: 'smp-5m',
    months: 5,
    label: '5 Months',
    originalPrice: 749,
    discount: 159,
    finalPrice: 590,
    tagline: '5 Months Veteran Pass · Save ₹159',
  },
  {
    id: 'smp-6m',
    months: 6,
    label: '6 Months',
    originalPrice: 899,
    discount: 199,
    finalPrice: 700,
    tagline: 'Half-Yearly Elite Pass · Mega ₹199 Discount!',
    isPopular: true,
  },
  {
    id: 'smp-12m',
    months: 12,
    label: '1 Year (Annual)',
    originalPrice: 1799,
    discount: 459,
    finalPrice: 1340,
    tagline: '1 Year Annual Champion VIP · Save ₹459 Instantly!',
    isBestValue: true,
  },
];

interface TargetSmpPaymentProps {
  onInitiatePayment: (orderData: {
    amount: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    purpose: string;
    isPlayStoreOrder: boolean;
  }) => void;
}

export const TargetSmpPayment: React.FC<TargetSmpPaymentProps> = ({ onInitiatePayment }) => {
  const { currentUser, isLoggedIn } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<TargetSmpPlan>(TARGET_SMP_PLANS[0]);
  const [minecraftName, setMinecraftName] = useState<string>('');
  const [realName, setRealName] = useState<string>(currentUser?.name || '');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  React.useEffect(() => {
    if (currentUser) {
      if (!realName) setRealName(currentUser.name);
      if (!email) setEmail(currentUser.email);
    }
  }, [currentUser]);

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};

    if (!minecraftName.trim()) {
      errs.minecraftName = 'Minecraft Player Name (In-Game Name) is required';
    } else if (minecraftName.trim().length < 3) {
      errs.minecraftName = 'Minecraft username must be at least 3 characters';
    }

    if (!realName.trim()) {
      errs.realName = 'Please enter your Full Real Name';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!phone.trim() || cleanPhone.length < 10) {
      errs.phone = 'Valid 10-digit mobile number required for SMS & confirmation';
    }

    if (!email.trim() || !email.includes('@')) {
      errs.email = 'Valid email address required for server role dispatch';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onInitiatePayment({
      amount: selectedPlan.finalPrice,
      customerName: realName.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim(),
      purpose: `TargetSMP Server Pass (${selectedPlan.label}) - Player: ${minecraftName.trim()}`,
      isPlayStoreOrder: false,
    });
  };

  return (
    <section id="targetsmp-section" className="py-10 bg-slate-50/70 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section with Minecraft Aesthetic */}
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 mb-10 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white border border-emerald-800/60 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Official TargetSMP Minecraft Server
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              TargetSMP Monthly Server Access & VIP Passes
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Pay your monthly <strong className="text-emerald-400 font-bold">TargetSMP</strong> server pass securely via Cashfree UPI. Base rate is <strong className="text-white">₹120/month</strong> with automatic discounts up to ₹100 on multi-month bundles. Enter your Minecraft Player Name and Real Name below to whitelist your access.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">Java & Bedrock 1.20+</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-300">24/7 Survival & PvP</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-slate-300">Anti-Grief & Land Claim</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">Instant VIP Whitelist</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Plan Duration Selector */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Step 1: Choose Your TargetSMP Plan Duration
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your membership duration — multi-month plans include exclusive discounts:
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                Base: ₹120 / Month
              </span>
            </div>

            {/* Grid of Plans */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {TARGET_SMP_PLANS.map((plan) => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <motion.button
                    key={plan.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 ring-2 ring-emerald-500/30 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-700 shadow-2xs'
                    }`}
                  >
                    {/* Badges */}
                    {plan.isPopular && (
                      <span className="absolute -top-2.5 right-4 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-xs">
                        Popular
                      </span>
                    )}
                    {plan.isBestValue && (
                      <span className="absolute -top-2.5 right-4 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-600 text-white shadow-xs">
                        Save ₹100
                      </span>
                    )}

                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {plan.label}
                      </span>
                      <div className="text-right">
                        {plan.discount > 0 && (
                          <span className="text-xs text-slate-400 line-through mr-1.5 font-mono">
                            ₹{plan.originalPrice}
                          </span>
                        )}
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
                          ₹{plan.finalPrice}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {plan.tagline}
                    </p>

                    {plan.discount > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>Discount Applied</span>
                        </span>
                        <span>-₹{plan.discount} OFF</span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Server Guidelines Notice */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                <span>TargetSMP Server Payment Rules</span>
              </div>
              <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-500 dark:text-slate-400">
                <li>Write your exact <strong>Minecraft Player Name (In-Game Name)</strong> — numeric player ID is not needed.</li>
                <li><strong>No Play Store Code:</strong> TargetSMP passes are whitelisted directly on <strong>play.targetsmp.in</strong> upon payment confirmation.</li>
                <li>Your server membership pass is verified and whitelisted by <strong>FlexMe Admin</strong> immediately upon payment confirmation.</li>
                <li>Support & server inquiries are handled directly on Instagram <a href="https://instagram.com/flexme.pay" target="_blank" rel="noopener noreferrer" className="font-bold text-pink-600 hover:underline">@flexme.pay</a>.</li>
              </ul>
            </div>

          </div>

          {/* Right Column: Checkout Form */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Step 2: Player Information
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  TargetSMP Registration
                </h3>
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                
                {/* Minecraft Player Name (IGN) */}
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Minecraft Player Name (In-Game Name / IGN) *
                  </label>
                  <div className="relative">
                    <Gamepad2 className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={minecraftName}
                      onChange={(e) => {
                        setMinecraftName(e.target.value);
                        if (errors.minecraftName) setErrors(prev => ({ ...prev, minecraftName: '' }));
                      }}
                      placeholder="e.g. Raunak_SMP / SteveGamer99"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    (Player ID लिखने की जरूरत नहीं है — सिर्फ अपना गेम नाम लिखें)
                  </span>
                  {errors.minecraftName && (
                    <span className="text-[11px] text-rose-500 font-semibold block mt-1">{errors.minecraftName}</span>
                  )}
                </div>

                {/* Full Real Name */}
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Your Full Real Name (रियल नेम) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={realName}
                      onChange={(e) => {
                        setRealName(e.target.value);
                        if (errors.realName) setErrors(prev => ({ ...prev, realName: '' }));
                      }}
                      placeholder="e.g. Raunak Kumar"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {errors.realName && (
                    <span className="text-[11px] text-rose-500 font-semibold block mt-1">{errors.realName}</span>
                  )}
                </div>

                {/* Mobile Phone */}
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Mobile Phone Number (SMS & UTR Verification) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      placeholder="e.g. 9876543210"
                      maxLength={15}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {errors.phone && (
                    <span className="text-[11px] text-rose-500 font-semibold block mt-1">{errors.phone}</span>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Email Address (For Server Access & Receipt) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={isLoggedIn && email === currentUser?.email ? "password" : "email"}
                      required
                      value={isLoggedIn && email === currentUser?.email ? '••••••••••••••••' : email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                      onFocus={() => {
                        if (isLoggedIn && email === currentUser?.email) {
                          setEmail('');
                        }
                      }}
                      placeholder="e.g. player@domain.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isLoggedIn ? 'Account email is active and masked for privacy (never displayed on screen).' : 'Used strictly for sending official order verification.'}
                  </p>
                  {errors.email && (
                    <span className="text-[11px] text-rose-500 font-semibold block mt-1">{errors.email}</span>
                  )}
                </div>

                {/* Order Summary Box */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Server:</span>
                    <strong className="text-slate-900 dark:text-white">TargetSMP (Minecraft)</strong>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Selected Plan:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedPlan.label}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Base Price ({selectedPlan.months} mo × ₹120):</span>
                    <span className="font-mono">₹{selectedPlan.originalPrice}</span>
                  </div>
                  {selectedPlan.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>Plan Bundle Discount:</span>
                      <span className="font-mono">-₹{selectedPlan.discount}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-900 dark:text-white">Total Payable:</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      ₹{selectedPlan.finalPrice}
                    </span>
                  </div>
                </div>

                {/* Submit Payment Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Pay ₹{selectedPlan.finalPrice} for TargetSMP Pass</span>
                </button>

                <p className="text-[11px] text-center text-slate-400">
                  Instant UPI QR / Cashfree Gateway · Verified by FLEX Admin
                </p>

              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
