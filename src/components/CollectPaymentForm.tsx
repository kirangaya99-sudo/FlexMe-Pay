import React, { useState, useEffect } from 'react';
import { CreditCard, QrCode, ShieldCheck, ArrowRight, Zap, CheckCircle2, Lock, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CollectPaymentFormProps {
  onInitiatePayment: (orderData: {
    amount: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    purpose: string;
    isPlayStoreOrder: boolean;
    merchantRef?: string;
  }) => void;
  prefillLinkId?: string;
}

export const CollectPaymentForm: React.FC<CollectPaymentFormProps> = ({
  onInitiatePayment,
  prefillLinkId,
}) => {
  const { currentUser, isLoggedIn, openLoginModal } = useAuth();
  const [amount, setAmount] = useState<string>('500');
  const [customerName, setCustomerName] = useState<string>(() => currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>(() => currentUser?.email || '');
  const [purpose, setPurpose] = useState<string>('PlayStore Digital Services');
  const [invoiceRef, setInvoiceRef] = useState<string>(prefillLinkId ? `LINK-${prefillLinkId}` : '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Auto-sync when logged in
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!customerEmail) setCustomerEmail(currentUser.email);
    }
  }, [currentUser]);

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      errs.amount = 'Please enter a valid amount greater than ₹0';
    }
    if (!customerName.trim()) {
      errs.name = 'Payer name is required';
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      errs.phone = '10-digit mobile number required for Cashfree payment receipt';
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      errs.email = 'Valid email is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onInitiatePayment({
      amount: parseFloat(amount),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      purpose: purpose + (invoiceRef ? ` (${invoiceRef})` : ''),
      isPlayStoreOrder: purpose.toLowerCase().includes('playstore') || purpose.toLowerCase().includes('play store'),
      merchantRef: invoiceRef.trim() || undefined,
    });
  };

  return (
    <section id="collect-payment-section" className="py-12 bg-slate-50/60 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mb-10">
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
            Collect Payment by Cashfree
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Universal Cashfree Payment Collection Gateway
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Accept or make payments securely via Cashfree Payments. Supports instant UPI (Google Pay, PhonePe, Paytm), RuPay & Visa cards, and dynamic QR collection with soundbox confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Collection Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Payment Purpose Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Select Collection Category / Purpose
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'PlayStore Digital Services', label: 'PlayStore Digital Services' },
                    { id: 'Google Play Gift Voucher', label: 'Google Play Gift Voucher' },
                    { id: 'PW Educational Course Pass', label: 'PW Educational Course Pass' },
                    { id: 'Custom Merchant Invoice Payment', label: 'Custom Merchant Invoice' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setPurpose(cat.id)}
                      className={`px-3.5 py-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                        purpose === cat.id
                          ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount & Reference Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount to Pay / Collect (INR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-500">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Invoice or Reference ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={invoiceRef}
                    onChange={(e) => setInvoiceRef(e.target.value)}
                    placeholder="e.g. INV-2026-904"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Quick Amount Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500">Quick set:</span>
                {[1, 100, 500, 1000, 4000, 5000].map((quickAmt) => (
                  <button
                    key={quickAmt}
                    type="button"
                    onClick={() => setAmount(quickAmt.toString())}
                    className="px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors tabular-nums"
                  >
                    ₹{quickAmt}
                  </button>
                ))}
              </div>

              {/* Payer Details */}
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Payer Information & Receipt Target
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
                      <Lock className="w-3 h-3 text-emerald-500" />
                      <span>Sign in with password to pre-fill</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Payer Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Raunak Kumar"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Payer Mobile Number (UPI/SMS) *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-500 mt-1 font-medium">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payer Email (Cashfree E-Receipt) *
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
                    placeholder="e.g. payer@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isLoggedIn ? 'Account email is active and masked for privacy (never displayed in plain text).' : 'Used strictly for sending digital tax receipt.'}
                  </p>
                  {errors.email && (
                    <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-99"
                >
                  <Lock className="w-4 h-4" />
                  <span>Collect Payment Now (₹{parseFloat(amount || '0').toLocaleString('en-IN')})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-2">
                  Transactions are encrypted and processed by Cashfree Payments India Pvt Ltd.
                </p>
              </div>

            </form>
          </div>

          {/* Right Column: Cashfree Terminal & Features Info */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-md">
              <div className="relative aspect-[4/3]">
                <img
                  src="/src/assets/images/cashfree_checkout_terminal_1793430820307.jpg"
                  alt="Cashfree Soundbox and UPI QR terminal"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex items-end p-5">
                  <div className="text-white">
                    <p className="text-xs uppercase font-semibold text-emerald-400">Cashfree Smart Soundbox</p>
                    <p className="text-sm font-bold">Instant Audio & Webhook Confirmation</p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white dark:bg-slate-800/90 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Payment Collection Features
                </h4>
                
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dynamic UPI QR generation with 10-minute expiry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-time voice soundbox chime and TTS audio alert</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant downloadable GST-ready transaction receipt</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Shareable payment links for Instagram (@flexme.pay) & SMS</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Cashfree Payment Modes Matrix */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 space-y-2 text-xs">
              <span className="font-semibold text-slate-900 dark:text-white block">
                Accepted Cashfree Methods
              </span>
              <div className="flex flex-wrap gap-2 text-slate-600 dark:text-slate-300 text-[11px]">
                <span className="bg-slate-100 dark:bg-slate-700/60 px-2 py-1 rounded">Google Pay</span>
                <span className="bg-slate-100 dark:bg-slate-700/60 px-2 py-1 rounded">PhonePe</span>
                <span className="bg-slate-100 dark:bg-slate-700/60 px-2 py-1 rounded">Paytm UPI</span>
                <span className="bg-slate-100 dark:bg-slate-700/60 px-2 py-1 rounded">BHIM / CRED</span>
                <span className="bg-slate-100 dark:bg-slate-700/60 px-2 py-1 rounded">RuPay Cards</span>
                <span className="bg-slate-100 dark:bg-slate-700/60 px-2 py-1 rounded">Visa / Mastercard</span>
                <span className="bg-slate-100 dark:bg-slate-700/60 px-2 py-1 rounded">NetBanking (50+ Banks)</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
