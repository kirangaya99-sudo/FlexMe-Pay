import React, { useState } from 'react';
import { ShieldCheck, Lock, Headphones, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

export const SecurityTrust: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How quickly will I receive my Google Play Store redeem code?',
      a: 'Instantly! As soon as Cashfree confirms your payment (usually 2-5 seconds), the 16-character alphanumeric code appears right on your screen, and is dispatched to your mobile number via SMS and email.',
    },
    {
      q: 'Which payment methods are supported by Cashfree on this portal?',
      a: 'We accept all major payment modes: All UPI apps (Google Pay, PhonePe, Paytm, BHIM, CRED), Dynamic UPI QR Codes, Visa/Mastercard/RuPay Credit & Debit Cards, Net Banking from 50+ Indian banks, and popular digital wallets.',
    },
    {
      q: 'How do I redeem my code in the Google Play Store?',
      a: 'Open the Google Play Store app on your Android device, tap your profile icon at top-right, choose "Payments & subscriptions", then tap "Redeem code". Paste the code and tap "Redeem" to add funds directly to your Google Play balance.',
    },
    {
      q: 'What is the Cashfree Smart Soundbox voice confirmation?',
      a: 'For merchants and buyers, Cashfree Soundbox plays an instant audio chime and voice announcement in English or Hindi confirming the exact rupee amount received, guaranteeing immediate transaction confirmation.',
    },
    {
      q: 'Is my transaction safe and what if my payment fails?',
      a: 'All transactions are protected by Cashfree Payments PCI-DSS Level 1 certified gateway and RBI-compliant security. If funds are deducted but your order fails, automatic reconciliation refunds the exact amount to your bank account within 24 hours.',
    },
  ];

  return (
    <section className="py-14 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges 4-Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              RBI Licensed PA
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Compliant with Reserve Bank of India Payment Aggregator guidelines.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              PCI-DSS Level 1
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Top global financial grade security with 256-bit SHA encryption.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Instant Auto-Refunds
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Seamless reversal to original payment method if network disconnects.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Headphones className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              24x7 Priority Support
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live assistance for code redemption and Cashfree transaction help.
            </p>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Everything you need to know about PlayStore Payment by PW and Cashfree collections.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-800/50"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 shrink-0 text-slate-400" /> : <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
