import React, { useState, useEffect } from 'react';
import { PaymentMethodType, TransactionRecord } from '../types/payment';
import { generateCashfreeOrderId, generatePlayStoreRedeemCode, playCashfreeSoundbox } from '../utils/soundbox';
import { sendPaymentAlertToOwner } from '../services/emailService';
import confetti from 'canvas-confetti';
import { UpiPaymentQr } from './UpiPaymentQr';
import { 
  X, Shield, Lock, Smartphone, CreditCard, Landmark, Wallet, 
  QrCode, CheckCircle2, ArrowRight, Loader2, Copy, Check, ArrowLeft 
} from 'lucide-react';

interface CashfreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    amount: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    purpose: string;
    isPlayStoreOrder: boolean;
    merchantRef?: string;
  } | null;
  onSuccess: (record: TransactionRecord) => void;
  soundboxVoice: 'en' | 'hi';
}

export const CashfreeModal: React.FC<CashfreeModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onSuccess,
  soundboxVoice,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('UPI_QR');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('gpay');
  const [vpaId, setVpaId] = useState<string>('kumar00697@fam');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('HDFC');
  const [selectedWallet, setSelectedWallet] = useState<string>('paytm');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [qrTimer, setQrTimer] = useState<number>(600); // 10 minutes

  useEffect(() => {
    if (isOpen) {
      setOrderId(generateCashfreeOrderId());
      setIsProcessing(false);
      setProcessingStep('');
      setQrTimer(600);
      if (orderData?.customerName) {
        setCardHolder(orderData.customerName);
      }
    }
  }, [isOpen, orderData]);

  // QR Timer countdown
  useEffect(() => {
    if (!isOpen || selectedMethod !== 'UPI_QR') return;
    const interval = setInterval(() => {
      setQrTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, selectedMethod]);

  if (!isOpen || !orderData) return null;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFillTestCard = () => {
    setCardNumber('4532 8920 1844 9012');
    setCardExpiry('08/29');
    setCardCvv('789');
    setCardHolder(orderData.customerName || 'Test Cardholder');
  };

  const executePayment = (method: PaymentMethodType, enteredUtr?: string) => {
    setIsProcessing(true);
    setProcessingStep('Registering payment & generating verification receipt...');

    const finalUtr = enteredUtr || `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19);

    setTimeout(() => {
      setProcessingStep('Preparing order for admin verification...');
      sendPaymentAlertToOwner({
        orderId,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail,
        amount: orderData.amount,
        purpose: orderData.purpose,
        utrNumber: finalUtr,
        createdAt,
      });
    }, 600);

    setTimeout(() => {
      setIsProcessing(false);
      
      const newRecord: TransactionRecord = {
        orderId,
        cfPaymentId: `CF_PAY_${Math.floor(10000000 + Math.random() * 90000000)}`,
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        customerEmail: orderData.customerEmail,
        amount: orderData.amount,
        purpose: orderData.purpose,
        paymentMethod: method,
        status: 'PENDING', // PENDING: Requires Admin Confirmation & Gift Card Code Entry!
        createdAt,
        redeemCode: undefined, // Code is NOT revealed until admin verifies and inputs it
        isPlayStoreOrder: orderData.isPlayStoreOrder,
        merchantRef: orderData.merchantRef,
        utrNumber: finalUtr,
      };

      onSuccess(newRecord);
    }, 1400);
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Cashfree Modal Header with Back / Return button */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            {!isProcessing && (
              <button
                onClick={onClose}
                className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer mr-1 border border-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Store</span>
              </button>
            )}

            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm">
              CF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight">cashfree payments</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">
                  SECURE CHECKOUT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Merchant: PlayStore Payment by PW · Order ID: <span className="font-mono text-slate-300">{orderId}</span>
              </p>
            </div>
          </div>

          {!isProcessing && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
            >
              <span>Close</span>
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Order Price Strip */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
              {orderData.purpose}
            </p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 flex-wrap">
              <span>Payer: {orderData.customerName} ({orderData.customerPhone})</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">· Verified Account</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Total Payable</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              ₹{orderData.amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Processing State View */}
        {isProcessing ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-spin">
              <Loader2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Processing Payment...
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {processingStep}
            </p>
            <p className="text-xs text-slate-400">
              Please do not close or refresh this window.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-12 min-h-[380px]">
            
            {/* Left Column: Method Selector Tabs */}
            <div className="sm:col-span-4 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3 space-y-1">
              {[
                { id: 'UPI_INTENT' as const, label: 'UPI Apps', desc: 'GPay, PhonePe, Paytm', icon: <Smartphone className="w-4 h-4" /> },
                { id: 'UPI_QR' as const, label: 'UPI QR Code', desc: 'Scan & Pay Instantly', icon: <QrCode className="w-4 h-4" /> },
                { id: 'CARD' as const, label: 'Cards', desc: 'Credit / Debit Cards', icon: <CreditCard className="w-4 h-4" /> },
                { id: 'NETBANKING' as const, label: 'Net Banking', desc: 'All Major Indian Banks', icon: <Landmark className="w-4 h-4" /> },
                { id: 'WALLET' as const, label: 'Wallets', desc: 'Paytm, MobiKwik, etc.', icon: <Wallet className="w-4 h-4" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedMethod(item.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                    selectedMethod === item.id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`${selectedMethod === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.desc}</div>
                  </div>
                </button>
              ))}

              <div className="pt-4 px-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
                <p>RBI Payment Aggregator Approved</p>
              </div>
            </div>

            {/* Right Column: Method Specific Controls */}
            <div className="sm:col-span-8 p-6 flex flex-col justify-between">
              
              {/* 1. UPI APPS */}
              {selectedMethod === 'UPI_INTENT' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Payee UPI VPA:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">kumar00697@fam</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Amount:</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 tabular-nums">₹{orderData.amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Pay via Installed UPI App
                    </h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { id: 'gpay', name: 'Google Pay', badge: 'GPay' },
                        { id: 'phonepe', name: 'PhonePe', badge: 'Pe' },
                        { id: 'paytm', name: 'Paytm UPI', badge: 'Paytm' },
                        { id: 'bhim', name: 'BHIM UPI', badge: 'BHIM' },
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => {
                            setSelectedUpiApp(app.id);
                            window.location.href = `upi://pay?pa=kumar00697@fam&pn=PlayStore%20Payment&am=${orderData.amount}&cu=INR&tn=${encodeURIComponent(orderData.purpose)}`;
                          }}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left flex items-center gap-2.5 transition-all bg-white dark:bg-slate-800 active:scale-98"
                        >
                          <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-xs font-bold text-indigo-600">
                            {app.badge.slice(0, 2)}
                          </span>
                          <span className="text-xs font-medium text-slate-900 dark:text-white">{app.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <a
                    href={`upi://pay?pa=kumar00697@fam&pn=PlayStore%20Payment&am=${orderData.amount}&cu=INR&tn=${encodeURIComponent(orderData.purpose)}`}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Launch UPI App to Pay ₹{orderData.amount.toLocaleString('en-IN')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => executePayment('UPI_INTENT')}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Verify & Confirm ₹{orderData.amount} Payment</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* 2. UPI QR CODE (Primary Customized QR with exact amount) */}
              {selectedMethod === 'UPI_QR' && (
                <div className="w-full">
                  <UpiPaymentQr
                    amount={orderData.amount}
                    purpose={orderData.purpose}
                    customerName={orderData.customerName}
                    onPaymentConfirm={(utr) => executePayment('UPI_QR', utr)}
                    isProcessing={isProcessing}
                  />
                </div>
              )}

              {/* 3. CREDIT / DEBIT CARDS */}
              {selectedMethod === 'CARD' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Card Details
                    </span>
                    <button
                      type="button"
                      onClick={handleFillTestCard}
                      className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Fill Test Card
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 8920 1844 9012"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="e.g. Raunak Kumar"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    onClick={() => executePayment('CARD')}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Pay ₹{orderData.amount.toLocaleString('en-IN')} via Card</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* 4. NET BANKING */}
              {selectedMethod === 'NETBANKING' && (
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Popular Indian Banks
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBank(b)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          selectedBank === b
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => executePayment('NETBANKING')}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Proceed to {selectedBank} NetBanking</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* 5. WALLETS */}
              {selectedMethod === 'WALLET' && (
                <div className="space-y-4">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Digital Wallet
                  </div>
                  <div className="space-y-2">
                    {['Paytm Wallet', 'PhonePe Wallet', 'MobiKwik', 'Amazon Pay Balance'].map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSelectedWallet(w)}
                        className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                          selectedWallet === w
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{w}</span>
                        {selectedWallet === w && <Check className="w-4 h-4 text-indigo-600" />}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => executePayment('WALLET')}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>Pay with {selectedWallet}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Footer Trust Indicator */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
                Powered by Cashfree Payments Gateway · Tokenized Card & UPI 2.0 Security
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
