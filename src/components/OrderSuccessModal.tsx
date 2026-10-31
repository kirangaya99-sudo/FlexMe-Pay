import React, { useState, useEffect } from 'react';
import { TransactionRecord } from '../types/payment';
import { loadTransactions, updateTransaction } from '../utils/storage';
import { playCashfreeSoundbox, generatePlayStoreRedeemCode } from '../utils/soundbox';
import { 
  sendVoucherCodeToCustomer, 
  loadSentEmails, 
  getOwnerNotificationUrls, 
  getCustomerNotificationUrls, 
  EmailLog 
} from '../services/emailService';
import { EmailNotificationModal } from './EmailNotificationModal';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Copy, Check, ExternalLink, Printer, Volume2, 
  X, ShieldCheck, Download, Smartphone, Gift, Clock, AlertCircle, RefreshCw, KeyRound, Sparkles, ArrowLeft, Mail, Send, MessageCircle,
  Server, GraduationCap
} from 'lucide-react';

interface OrderSuccessModalProps {
  isOpen?: boolean;
  transaction: TransactionRecord | null;
  onClose: () => void;
  onGoToTrack?: () => void;
  soundboxVoice: 'en' | 'hi';
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen = true,
  transaction: initialTx,
  onClose,
  onGoToTrack,
  soundboxVoice,
}) => {
  const [currentTx, setCurrentTx] = useState<TransactionRecord | null>(initialTx);
  const [copied, setCopied] = useState<boolean>(false);
  const [isLiveChecking, setIsLiveChecking] = useState<boolean>(false);

  const handleClose = () => {
    setCurrentTx(null);
    onClose();
  };

  // Admin fast-approve modal state inside waiting room
  const [showAdminEntry, setShowAdminEntry] = useState<boolean>(false);
  const [adminInputCode, setAdminInputCode] = useState<string>('');

  // Email log modal
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [sentEmails, setSentEmails] = useState<EmailLog[]>(loadSentEmails);

  useEffect(() => {
    setCurrentTx(initialTx);
  }, [initialTx]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Live polling & listening for admin approval from any tab/device
  useEffect(() => {
    if (!currentTx || currentTx.status !== 'PENDING') return;

    const checkStatus = () => {
      const allTx = loadTransactions();
      const updated = allTx.find((t) => t.orderId === currentTx.orderId);
      if (updated && updated.status !== currentTx.status) {
        setCurrentTx(updated);
        setSentEmails(loadSentEmails());
        if (updated.status === 'SUCCESS') {
          playCashfreeSoundbox(updated.amount, soundboxVoice);
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#10b981', '#06b6d4', '#f59e0b']
          });
        }
      }
    };

    const interval = setInterval(checkStatus, 2000);
    const handleStorageUpdate = () => checkStatus();
    window.addEventListener('app_transactions_updated', handleStorageUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('app_transactions_updated', handleStorageUpdate);
    };
  }, [currentTx, soundboxVoice]);

  if (!isOpen || !currentTx) return null;

  const handleManualRefresh = () => {
    setIsLiveChecking(true);
    setTimeout(() => {
      const allTx = loadTransactions();
      const updated = allTx.find((t) => t.orderId === currentTx.orderId);
      if (updated) setCurrentTx(updated);
      setSentEmails(loadSentEmails());
      setIsLiveChecking(false);
    }, 600);
  };

  const isSmp = currentTx.purpose.toLowerCase().includes('targetsmp') || currentTx.purpose.toLowerCase().includes('target smp');
  const isPw = currentTx.purpose.toLowerCase().includes('pw ') || currentTx.purpose.toLowerCase().includes('class 9') || currentTx.purpose.toLowerCase().includes('physics wallah');

  const handleAdminDirectApprove = (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    let finalCode = customCode;
    if (!finalCode) {
      if (isSmp) {
        finalCode = 'TARGETSMP_ACTIVE';
      } else if (isPw) {
        finalCode = 'PW_CLASS9_ACTIVE';
      } else {
        finalCode = adminInputCode.trim() || generatePlayStoreRedeemCode();
      }
    }
    const approvedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    
    updateTransaction(currentTx.orderId, {
      status: 'SUCCESS',
      redeemCode: finalCode,
      adminApprovedAt: approvedAt,
      adminApprovedBy: 'FLEX Admin (Owner)',
    });

    // Dispatch email to customer with code and OTP
    sendVoucherCodeToCustomer({
      orderId: currentTx.orderId,
      customerName: currentTx.customerName,
      customerEmail: currentTx.customerEmail,
      amount: currentTx.amount,
      redeemCode: finalCode,
      adminApprovedAt: approvedAt,
    });
    setSentEmails(loadSentEmails());

    const updated = {
      ...currentTx,
      status: 'SUCCESS' as const,
      redeemCode: finalCode,
      adminApprovedAt: approvedAt,
      adminApprovedBy: 'FLEX Admin (Owner)',
    };
    setCurrentTx(updated);
    setShowAdminEntry(false);

    playCashfreeSoundbox(currentTx.amount, soundboxVoice);
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore in tests/headless
    }
  };

  const handleAdminDirectCancel = (reason?: string) => {
    if (!currentTx) return;
    const approvedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const rejectionReason = reason || 'Payment not verified by admin / UTR mismatch';
    updateTransaction(currentTx.orderId, {
      status: 'REJECTED',
      rejectionReason,
      adminApprovedAt: approvedAt,
      adminApprovedBy: 'FLEX Admin',
    });
    const updated = {
      ...currentTx,
      status: 'REJECTED' as const,
      rejectionReason,
      adminApprovedAt: approvedAt,
      adminApprovedBy: 'FLEX Admin',
    };
    setCurrentTx(updated);
    setShowAdminEntry(false);
  };

  const handleCopyCode = () => {
    if (currentTx.redeemCode) {
      navigator.clipboard.writeText(currentTx.redeemCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isPending = currentTx.status === 'PENDING';
  const isSuccess = currentTx.status === 'SUCCESS';
  const isRejected = currentTx.status === 'REJECTED';

  const ownerUrls = currentTx ? getOwnerNotificationUrls({
    orderId: currentTx.orderId,
    customerName: currentTx.customerName,
    customerPhone: currentTx.customerPhone,
    customerEmail: currentTx.customerEmail,
    amount: currentTx.amount,
    purpose: currentTx.purpose,
    utrNumber: currentTx.utrNumber || 'N/A',
    createdAt: currentTx.createdAt,
  }) : null;

  const customerUrls = (currentTx && currentTx.redeemCode) ? getCustomerNotificationUrls({
    orderId: currentTx.orderId,
    customerName: currentTx.customerName,
    customerEmail: currentTx.customerEmail,
    amount: currentTx.amount,
    redeemCode: currentTx.redeemCode,
    otpCode: `PW-${Math.floor(100000 + Math.random() * 900000)}`,
    adminApprovedAt: currentTx.adminApprovedAt || currentTx.createdAt,
  }) : null;

  return (
    <>
      <div 
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
      >
        <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
          
          {/* Header Ribbon Based on State with Prominent Back Button */}
          {isPending && (
            <div className="bg-amber-600 text-white p-6 text-center relative">
              {/* Prominent Back Button Top Left */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 left-4 bg-black/25 hover:bg-black/40 text-white py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Store</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 text-amber-100 hover:text-white p-1 rounded-full hover:bg-amber-700/60 transition-colors cursor-pointer"
                title="Close bill"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 bg-white text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md animate-pulse mt-4 sm:mt-0">
                <Clock className="w-8 h-8" />
              </div>

              <span className="text-xs uppercase tracking-widest font-bold text-amber-100 block mb-1">
                Payment Submitted · Processing Verification
              </span>
              <h3 className="text-2xl font-black tracking-tight">
                Awaiting Admin Confirmation
              </h3>
              <p className="text-xs text-amber-100 mt-1">
                Order ID: <span className="font-mono text-white font-bold">{currentTx.orderId}</span> · Amount: <span className="font-bold">₹{currentTx.amount}</span>
              </p>
            </div>
          )}

          {isSuccess && (
            <div className="bg-emerald-600 text-white p-6 text-center relative">
              {/* Prominent Back Button Top Left */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 left-4 bg-black/25 hover:bg-black/40 text-white py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Store</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 text-emerald-100 hover:text-white p-1 rounded-full hover:bg-emerald-700/60 transition-colors cursor-pointer"
                title="Close bill"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 bg-white text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md mt-4 sm:mt-0">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <span className="text-xs uppercase tracking-widest font-bold text-emerald-200 block mb-1">
                Admin Verified · Code Dispatched
              </span>
              <h3 className="text-2xl font-black tracking-tight">
                ₹{currentTx.amount.toLocaleString('en-IN')} Approved & Dispatched
              </h3>
              <p className="text-xs text-emerald-100 mt-1">
                Order ID: <span className="font-mono text-white">{currentTx.orderId}</span>
              </p>
            </div>
          )}

          {isRejected && (
            <div className="bg-rose-600 text-white p-6 text-center relative">
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 left-4 bg-black/25 hover:bg-black/40 text-white py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Store</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="absolute top-4 right-4 text-rose-100 hover:text-white p-1 rounded-full hover:bg-rose-700/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 bg-white text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md mt-4 sm:mt-0">
                <AlertCircle className="w-9 h-9" />
              </div>

              <span className="text-xs uppercase tracking-widest font-bold text-rose-200 block mb-1">
                Verification Failed
              </span>
              <h3 className="text-2xl font-black tracking-tight">
                Payment Not Confirmed
              </h3>
              <p className="text-xs text-rose-100 mt-1">
                Reason: {currentTx.rejectionReason || 'UTR not verified in bank statement'}
              </p>
            </div>
          )}

          {/* Content Body */}
          <div className="p-6 sm:p-8 space-y-5">
            
            {/* EMAIL DISPATCH ACTION CARDS */}
            {isPending && ownerUrls && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50/50 to-indigo-50 dark:from-amber-950/30 dark:via-slate-800 dark:to-indigo-950/30 border-2 border-amber-400 dark:border-amber-700 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      🔔 Notify Store Owner
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(true)}
                    className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                  >
                    View Log
                  </button>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  Your payment has been submitted! Send an instant notification or DM to FLEX Admin on Instagram (<strong>@flexme.pay</strong>) or via Gmail with your name (<strong>{currentTx.customerName}</strong>), phone, UTR (<strong>{currentTx.utrNumber}</strong>), and amount (<strong>₹{currentTx.amount}</strong>):
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <a
                    href="https://instagram.com/flexme.pay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 text-center cursor-pointer active:scale-98"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>📸 Message @flexme.pay (Instagram)</span>
                  </a>

                  <a
                    href={ownerUrls.gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 text-center cursor-pointer active:scale-98"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span>🚀 Open in Gmail (Store Owner Desk)</span>
                  </a>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-amber-200/60 dark:border-amber-800/40 pt-2">
                  <span>Prepared for FLEX Admin verification</span>
                  <a
                    href="https://instagram.com/flexme.pay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 dark:text-pink-400 hover:underline font-semibold"
                  >
                    Instagram Support: @flexme.pay ↗
                  </a>
                </div>
              </div>
            )}

            {isSuccess && customerUrls && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-emerald-950/40 dark:to-indigo-950/40 border border-emerald-300 dark:border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Dispatch Gift Code & OTP to Customer
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-mono px-2 py-0.5 rounded-full font-bold">
                    Recipient Attached (Private)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={customerUrls.gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Code to Customer ↗</span>
                  </a>

                  <a
                    href="https://instagram.com/flexme.pay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Contact @flexme.pay ↗</span>
                  </a>
                </div>
              </div>
            )}

            {/* Workflow Step Tracker */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Order Verification Pipeline</span>
                <button
                  onClick={handleManualRefresh}
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLiveChecking ? 'animate-spin' : ''}`} />
                  <span>Refresh Status</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  <span>1. Payment Paid</span>
                </div>

                <div className={`p-2 rounded-xl border font-semibold ${
                  isSuccess
                    ? 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 animate-pulse'
                }`}>
                  {isSuccess ? (
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 mx-auto mb-1 text-amber-600 animate-spin" />
                  )}
                  <span>2. Admin Review</span>
                </div>

                <div className={`p-2 rounded-xl border font-semibold ${
                  isSuccess
                    ? 'bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}>
                  <Gift className="w-4 h-4 mx-auto mb-1" />
                  <span>3. Code Reveal</span>
                </div>
              </div>

              {isPending && (
                <div className="text-xs text-slate-600 dark:text-slate-300 bg-amber-50/50 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/40 space-y-2">
                  <p className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Your order is in Live Payment Processing.</span>
                  </p>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                    FLEX Admin has received your payment details with UTR: <strong>{currentTx.utrNumber}</strong>. You can monitor live approval in the Track & Processing section.
                  </p>
                  {onGoToTrack && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onGoToTrack();
                      }}
                      className="w-full mt-2 py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Track Order in Payment Processing Desk ↗</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ADMIN QUICK ACTION */}
            {isPending && (
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Admin Quick Action (Owner Desk)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdminEntry(!showAdminEntry)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {showAdminEntry ? 'Hide Admin Box' : isSmp ? 'Whitelist Player' : isPw ? 'Enroll Student' : 'Approve & Put Code'}
                  </button>
                </div>

                {showAdminEntry ? (
                  isSmp ? (
                    <div className="space-y-3 pt-2">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                        <span className="font-bold block mb-1">TargetSMP Pass Whitelist (No Code Required)</span>
                        <span>TargetSMP passes activate direct server whitelist on play.targetsmp.in without generating a Google Play code.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdminDirectApprove(undefined, 'TARGETSMP_ACTIVE')}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm & Whitelist TargetSMP Pass</span>
                      </button>
                    </div>
                  ) : isPw ? (
                    <div className="space-y-3 pt-2">
                      <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200">
                        <span className="font-bold block mb-1">PW Class 9th Batch Activation (No Code Required)</span>
                        <span>Physics Wallah batch enrollment activates admission directly on the student mobile number without a Google Play code.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAdminDirectApprove(undefined, 'PW_CLASS9_ACTIVE')}
                        className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm & Enroll PW Class 9th Batch</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleAdminDirectApprove} className="space-y-3 pt-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Enter Google Play Redeem Code to Issue:
                        </label>
                        <input
                          type="text"
                          value={adminInputCode}
                          onChange={(e) => setAdminInputCode(e.target.value)}
                          placeholder="e.g. GPLY-7KA9-2MX4-Q8NP"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setAdminInputCode(generatePlayStoreRedeemCode())}
                          className="py-2 px-3 rounded-lg border border-indigo-300 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Auto-Generate Code
                        </button>

                        <button
                          type="submit"
                          className="flex-1 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Confirm Payment</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAdminDirectCancel('Payment cancelled / rejected by owner')}
                          className="py-2 px-3 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Cancel Request
                        </button>
                      </div>
                    </form>
                  )
                ) : (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    As the owner/admin, you can approve or cancel from here or from the <strong>Payment Requests / Merchant Desk</strong> tab at any time.
                  </p>
                )}
              </div>
            )}

            {/* IF SUCCESS: Display Service Details or Redeem Code */}
            {isSuccess && (
              isSmp ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 shadow-sm text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    <Server className="w-4 h-4" />
                    <span>TargetSMP Minecraft Membership Active</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 py-3 px-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 shadow-inner space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Minecraft Server Address</span>
                    <div className="font-mono text-lg font-black tracking-wider text-slate-900 dark:text-white select-all">
                      play.targetsmp.in
                    </div>
                    <span className="text-[11px] text-slate-500 block">Port: 25565 (Java) / 19132 (Bedrock)</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('play.targetsmp.in');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2500);
                      }}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied Server IP!' : 'Copy Server IP'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                    Player is whitelisted by FlexMe Admin. Join play.targetsmp.in directly in Minecraft! (No Play Store code needed).
                  </p>
                </div>
              ) : isPw ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-800 dark:via-slate-800 dark:to-indigo-950/40 border-2 border-indigo-300 dark:border-indigo-700 shadow-sm text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4" />
                    <span>Physics Wallah Class 9th Admission Confirmed</span>
                  </div>

                  <div className="bg-white dark:bg-slate-900 py-3 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800/80 shadow-inner space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Enrolled Class 9th Course</span>
                    <div className="text-sm font-black text-slate-900 dark:text-white">
                      {currentTx.purpose}
                    </div>
                    <span className="text-[11px] text-slate-500 block">Student: {currentTx.customerName}</span>
                  </div>

                  <p className="text-[11px] text-indigo-800 dark:text-indigo-300 font-medium">
                    Your Class 9th course admission is verified by FlexMe Admin. Login on the official PW mobile app with your registered number to start studying! (No Play Store code needed).
                  </p>
                </div>
              ) : currentTx.redeemCode && !currentTx.redeemCode.startsWith('TARGETSMP') && !currentTx.redeemCode.startsWith('PW') ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950/30 border-2 border-indigo-200 dark:border-indigo-800/60 shadow-sm text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                    <Gift className="w-4 h-4" />
                    <span>Your Google Play Store Redeem Code</span>
                  </div>

                  <div className="font-mono text-xl sm:text-2xl font-black tracking-wider text-slate-900 dark:text-white py-2 px-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-inner select-all">
                    {currentTx.redeemCode}
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-1">
                    <button
                      onClick={handleCopyCode}
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                    </button>

                    <a
                      href={`https://play.google.com/redeem?code=${currentTx.redeemCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-98"
                    >
                      <span>Redeem on Play Store</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Verified by Store Administrator at {currentTx.adminApprovedAt || currentTx.createdAt}.
                  </p>
                </div>
              ) : null
            )}

            {/* Receipt Details Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span>Transaction Summary</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isSuccess ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}>
                  {currentTx.status}
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-500">Order ID</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{currentTx.orderId}</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-500">UPI / UTR Ref</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{currentTx.utrNumber || 'N/A'}</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-500">Payer Name</span>
                  <span className="font-medium text-slate-900 dark:text-white">{currentTx.customerName} ({currentTx.customerPhone})</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-500">Payer Email</span>
                  <span className="font-medium text-slate-900 dark:text-white">•••••••••••••• (Private)</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-black text-slate-900 dark:text-white tabular-nums">₹{currentTx.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span className="text-slate-500">Admin Authority</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">Store Administrator (Verified)</span>
                </div>
              </div>
            </div>

            {/* Action Row with Clear Back & Close Buttons */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer flex-1"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={() => setShowEmailModal(true)}
                  className="py-2.5 px-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 cursor-pointer flex-1"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Log</span>
                </button>
              </div>

              {/* Large Dedicated Back to Store & Close Bill Button */}
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-99"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Close Bill & Return to Store</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Email Log Modal */}
      <EmailNotificationModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        emails={sentEmails}
        filterOrderId={currentTx.orderId}
      />
    </>
  );
};
