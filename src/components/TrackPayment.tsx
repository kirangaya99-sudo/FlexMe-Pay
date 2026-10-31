import React, { useState, useEffect } from 'react';
import { TransactionRecord } from '../types/payment';
import {
  Search, CheckCircle2, AlertCircle, Clock, Copy, Check, ExternalLink,
  Printer, Shield, KeyRound, Sparkles, RefreshCw, Send,
  CheckCheck, ArrowRight, Phone, Mail, User, Filter, AlertTriangle,
  Gift, Lock, Zap, Server, GraduationCap, X, Ban, ThumbsUp, ThumbsDown,
  Volume2, Eye, ShieldAlert, ArrowLeft, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { updateTransaction, loadTransactions, saveTransaction } from '../utils/storage';
import { playCashfreeSoundbox, generatePlayStoreRedeemCode, generateCashfreeOrderId } from '../utils/soundbox';
import { sendVoucherCodeToCustomer } from '../services/emailService';
import confetti from 'canvas-confetti';

export const isTargetSmpOrder = (tx: TransactionRecord): boolean => {
  return tx.purpose.toLowerCase().includes('targetsmp') || tx.purpose.toLowerCase().includes('target smp');
};

export const isPwOrder = (tx: TransactionRecord): boolean => {
  return tx.purpose.toLowerCase().includes('pw ') ||
         tx.purpose.toLowerCase().includes('class 9') ||
         tx.purpose.toLowerCase().includes('physics wallah');
};

interface TrackPaymentProps {
  transactions: TransactionRecord[];
  onSelectTransaction: (tx: TransactionRecord) => void;
}

export const TrackPayment: React.FC<TrackPaymentProps> = ({ transactions: initialTransactions, onSelectTransaction }) => {
  const { currentUser, isAdmin, logout } = useAuth();
  
  // Real-time local transactions state to support instant live refresh
  const [liveTransactions, setLiveTransactions] = useState<TransactionRecord[]>(loadTransactions);
  const [query, setQuery] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Active view role
  const [viewRole, setViewRole] = useState<'OWNER' | 'CUSTOMER'>(isAdmin ? 'OWNER' : 'CUSTOMER');

  useEffect(() => {
    setViewRole(isAdmin ? 'OWNER' : 'CUSTOMER');
  }, [isAdmin]);

  // Owner approval modal state
  const [approvingTx, setApprovingTx] = useState<TransactionRecord | null>(null);
  const [adminCustomCode, setAdminCustomCode] = useState<string>('');
  const [isSubmittingApproval, setIsSubmittingApproval] = useState<boolean>(false);
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  // Owner reject / cancel modal state
  const [cancellingTx, setCancellingTx] = useState<TransactionRecord | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('UTR not matching with bank credit / Payment not received');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  // Filter for Owner queue: 'ALL' | 'PENDING' | 'SUCCESS' | 'REJECTED'
  const [ownerFilter, setOwnerFilter] = useState<'ALL' | 'PENDING' | 'SUCCESS' | 'REJECTED'>('PENDING');

  // Keep liveTransactions synchronized with props and storage
  useEffect(() => {
    setLiveTransactions(loadTransactions());
  }, [initialTransactions]);

  // Sync with global cross-component event
  useEffect(() => {
    const handleUpdate = () => {
      setLiveTransactions(loadTransactions());
    };
    window.addEventListener('app_transactions_updated', handleUpdate);
    return () => window.removeEventListener('app_transactions_updated', handleUpdate);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    const updated = loadTransactions();
    setLiveTransactions(updated);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Open owner confirmation modal for a specific transaction
  const handleOpenApprovalModal = (tx: TransactionRecord) => {
    setApprovingTx(tx);
    if (!isTargetSmpOrder(tx) && !isPwOrder(tx)) {
      setAdminCustomCode(generatePlayStoreRedeemCode());
    } else {
      setAdminCustomCode('');
    }
    setApprovalFeedback(null);
  };

  // Confirm payment request by Owner
  const handleConfirmAndApprove = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!approvingTx) return;
    setIsSubmittingApproval(true);
    const approvedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    let finalCode: string | undefined;
    let feedbackMsg = '';

    if (isTargetSmpOrder(approvingTx)) {
      finalCode = 'TARGETSMP_ACTIVE';
      feedbackMsg = `TargetSMP Pass verified for ${approvingTx.customerName}! Minecraft player is now Whitelisted. (No Play Store code issued).`;
    } else if (isPwOrder(approvingTx)) {
      finalCode = 'PW_CLASS9_ACTIVE';
      feedbackMsg = `Physics Wallah Class 9th batch confirmed for student ${approvingTx.customerName}! (No Play Store code issued).`;
    } else {
      finalCode = adminCustomCode.trim() || generatePlayStoreRedeemCode();
      feedbackMsg = `Order #${approvingTx.orderId} verified successfully! Google Play code ${finalCode} is now active.`;
    }

    // 1. Update in persistent storage
    const updated = updateTransaction(approvingTx.orderId, {
      status: 'SUCCESS',
      redeemCode: finalCode,
      adminApprovedAt: approvedAt,
      adminApprovedBy: 'FLEX Admin',
    });
    setLiveTransactions(updated);

    // 2. Play Soundbox confirmation chime
    playCashfreeSoundbox(approvingTx.amount, 'en');

    // 3. Dispatch celebratory confetti
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    // 4. Log customer dispatch email/Instagram notification
    try {
      sendVoucherCodeToCustomer({
        orderId: approvingTx.orderId,
        customerName: approvingTx.customerName,
        customerEmail: approvingTx.customerEmail,
        amount: approvingTx.amount,
        redeemCode: finalCode,
        adminApprovedAt: approvedAt,
      });
    } catch (err) {
      console.warn('Customer notification logged:', err);
    }

    setApprovalFeedback(feedbackMsg);
    setIsSubmittingApproval(false);

    // Close modal after brief pause
    setTimeout(() => {
      setApprovingTx(null);
      setApprovalFeedback(null);
    }, 1500);
  };

  // Cancel / Reject payment request by Owner
  const handleCancelRequest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cancellingTx) return;
    setIsSubmittingCancel(true);

    const approvedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const reason = cancelReason.trim() || 'Payment could not be verified by owner';

    const updated = updateTransaction(cancellingTx.orderId, {
      status: 'REJECTED',
      rejectionReason: reason,
      adminApprovedAt: approvedAt,
      adminApprovedBy: 'FLEX Admin',
    });
    setLiveTransactions(updated);
    setIsSubmittingCancel(false);
    setCancellingTx(null);
  };



  // Search filter
  const searchResults = liveTransactions.filter((tx) => {
    if (!query.trim()) return false;
    const q = query.trim().toLowerCase();
    return (
      tx.orderId.toLowerCase().includes(q) ||
      tx.cfPaymentId.toLowerCase().includes(q) ||
      tx.customerPhone.includes(q) ||
      tx.customerEmail.toLowerCase().includes(q) ||
      tx.customerName.toLowerCase().includes(q) ||
      (tx.utrNumber && tx.utrNumber.toLowerCase().includes(q)) ||
      (tx.redeemCode && tx.redeemCode.toLowerCase().includes(q))
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  // Queue metrics
  const pendingRequests = liveTransactions.filter(t => t.status === 'PENDING');
  const approvedRequests = liveTransactions.filter(t => t.status === 'SUCCESS');
  const cancelledRequests = liveTransactions.filter(t => t.status === 'REJECTED');
  const totalVolume = liveTransactions.reduce((sum, t) => sum + (t.status === 'SUCCESS' ? t.amount : 0), 0);
  const pendingVolume = pendingRequests.reduce((sum, t) => sum + t.amount, 0);

  const ownerDisplayedRequests = liveTransactions.filter(tx => {
    if (ownerFilter === 'PENDING') return tx.status === 'PENDING';
    if (ownerFilter === 'SUCCESS') return tx.status === 'SUCCESS';
    if (ownerFilter === 'REJECTED') return tx.status === 'REJECTED';
    return true;
  });

  return (
    <section id="track-section" className="relative py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      
      {/* Heavy Animated Ambient Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none animate-float-reverse"></div>
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>

      <div className="relative z-10 space-y-8">

        {/* Master Control Bar: Switch between Owner Request Queue and Customer Tracking */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <KeyRound className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  Payment Requests Desk & Verification
                </h2>
                {pendingRequests.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 animate-bounce shadow-sm">
                    {pendingRequests.length} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                FLEX Admin verification terminal · Confirm or Cancel any customer payment
              </p>
            </div>
          </div>

          {/* Symmetrical Mode Switcher Toggle */}
          {isAdmin ? (
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewRole('OWNER')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  viewRole === 'OWNER'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Owner Queue</span>
                {pendingRequests.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping"></span>
                )}
              </button>
              <button
                onClick={() => setViewRole('CUSTOMER')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  viewRole === 'CUSTOMER'
                    ? 'bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-100 dark:to-white text-white dark:text-slate-900 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer View</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <span>Account: <strong>{currentUser?.name}</strong></span>
            </div>
          )}
        </motion.div>

        {/* ========================================================= */}
        {/* VIEW 1: OWNER PAYMENT REQUESTS QUEUE (CONFIRM & CANCEL)  */}
        {/* ========================================================= */}
        {viewRole === 'OWNER' ? (
          <div className="space-y-6">
            
            {/* Owner Stats & Live Banner */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white border-2 border-indigo-500/30 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Owner Request Queue Active
                    </span>
                    <span className="text-xs text-slate-400 font-mono">FLEX Admin</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    Incoming Customer Payment Requests
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    Every member / customer payment automatically appears in this queue. Review the submitted UTR and click <strong className="text-emerald-400">"Confirm Payment"</strong> to approve or <strong className="text-rose-400">"Cancel Request"</strong> to reject. Zero requests bug fixed permanently!
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md transition-all cursor-pointer border border-white/15"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Refreshing...' : 'Live Refresh'}</span>
                  </button>
                </div>
              </div>

              {/* 4 Interactive KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setOwnerFilter('PENDING')}
                  className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                    ownerFilter === 'PENDING'
                      ? 'bg-amber-500/25 border-2 border-amber-400'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span>Pending Queue</span>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-200 mt-1 tabular-nums">
                    {pendingRequests.length}
                  </div>
                  <div className="text-[10px] text-amber-300/80 mt-0.5">
                    ₹{pendingVolume.toLocaleString('en-IN')} to confirm
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOwnerFilter('SUCCESS')}
                  className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                    ownerFilter === 'SUCCESS'
                      ? 'bg-emerald-500/25 border-2 border-emerald-400'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                    <span>Approved & Whitelisted</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-200 mt-1 tabular-nums">
                    {approvedRequests.length}
                  </div>
                  <div className="text-[10px] text-emerald-300/80 mt-0.5">
                    ₹{totalVolume.toLocaleString('en-IN')} confirmed
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOwnerFilter('REJECTED')}
                  className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                    ownerFilter === 'REJECTED'
                      ? 'bg-rose-500/25 border-2 border-rose-400'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                    <span>Cancelled / Rejected</span>
                    <Ban className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-rose-200 mt-1 tabular-nums">
                    {cancelledRequests.length}
                  </div>
                  <div className="text-[10px] text-rose-300/80 mt-0.5">
                    Rejected orders
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setOwnerFilter('ALL')}
                  className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                    ownerFilter === 'ALL'
                      ? 'bg-indigo-500/25 border-2 border-indigo-400'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                    <span>All Requests</span>
                    <Filter className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-indigo-200 mt-1 tabular-nums">
                    {liveTransactions.length}
                  </div>
                  <div className="text-[10px] text-indigo-300/80 mt-0.5">
                    Total lifetime orders
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Filter Pills + Live Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
                <button
                  onClick={() => setOwnerFilter('PENDING')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                    ownerFilter === 'PENDING'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Requests ({pendingRequests.length})</span>
                </button>

                <button
                  onClick={() => setOwnerFilter('SUCCESS')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    ownerFilter === 'SUCCESS'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Approved ({approvedRequests.length})
                </button>

                <button
                  onClick={() => setOwnerFilter('REJECTED')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    ownerFilter === 'REJECTED'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Cancelled ({cancelledRequests.length})
                </button>

                <button
                  onClick={() => setOwnerFilter('ALL')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    ownerFilter === 'ALL'
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({liveTransactions.length})
                </button>
              </div>

              {/* Filter search */}
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter by UTR, Name or Phone..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
              </div>
            </div>

            {/* List of Incoming Requests */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {ownerDisplayedRequests
                  .filter(tx => {
                    if (!query.trim()) return true;
                    const q = query.trim().toLowerCase();
                    return (
                      tx.orderId.toLowerCase().includes(q) ||
                      tx.customerName.toLowerCase().includes(q) ||
                      tx.customerPhone.includes(q) ||
                      tx.customerEmail.toLowerCase().includes(q) ||
                      (tx.utrNumber && tx.utrNumber.toLowerCase().includes(q))
                    );
                  })
                  .map((tx, idx) => {
                    const isSmp = isTargetSmpOrder(tx);
                    const isPw = isPwOrder(tx);
                    const isPending = tx.status === 'PENDING';
                    const isApproved = tx.status === 'SUCCESS';
                    const isRejected = tx.status === 'REJECTED';

                    return (
                      <motion.div
                        key={tx.orderId}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35, delay: idx * 0.05 }}
                        className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                          isPending
                            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-700 shadow-xl shadow-amber-500/10'
                            : isApproved
                            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                            : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 shadow-xs'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                          
                          {/* Request Meta & Customer Info */}
                          <div className="space-y-2.5 flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${
                                isPending
                                  ? 'bg-amber-100 text-amber-950 dark:bg-amber-900/80 dark:text-amber-100 border border-amber-300 dark:border-amber-700'
                                  : isApproved
                                  ? 'bg-emerald-100 text-emerald-950 dark:bg-emerald-900/80 dark:text-emerald-100 border border-emerald-300 dark:border-emerald-700'
                                  : 'bg-rose-100 text-rose-950 dark:bg-rose-900/80 dark:text-rose-100 border border-rose-300 dark:border-rose-700'
                              }`}>
                                {isPending ? (
                                  <>
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                                    <span>PENDING OWNER ACTION</span>
                                  </>
                                ) : isApproved ? (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>{isSmp ? 'TargetSMP Whitelisted' : isPw ? 'PW Enrolled' : 'Confirmed & Code Issued'}</span>
                                  </>
                                ) : (
                                  <>
                                    <Ban className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                    <span>CANCELLED / REJECTED</span>
                                  </>
                                )}
                              </span>

                              {isSmp && (
                                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                  TargetSMP Server
                                </span>
                              )}

                              {isPw && (
                                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                                  Class 9th Batch
                                </span>
                              )}

                              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                                #{tx.orderId}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                {tx.createdAt}
                              </span>
                            </div>

                            {/* Customer Contact Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                                <User className="w-4 h-4 text-indigo-500 shrink-0" />
                                <span className="truncate"><strong>Name:</strong> {tx.customerName}</span>
                              </div>
                              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span className="font-mono"><strong>Phone:</strong> {tx.customerPhone}</span>
                              </div>
                              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                <span className="truncate"><strong>Account:</strong> Verified (Email Protected)</span>
                              </div>
                            </div>

                            {/* UTR & Purpose Row */}
                            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1 flex-wrap">
                              <div className="flex items-center gap-1.5 bg-indigo-50/80 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800">
                                <span className="font-bold text-indigo-900 dark:text-indigo-300">Bank UTR Ref:</span>
                                <span className="font-mono font-black text-indigo-700 dark:text-indigo-300">
                                  {tx.utrNumber || tx.cfPaymentId}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-700 dark:text-slate-300">Purpose:</span>
                                <span className="font-medium text-slate-800 dark:text-slate-200">{tx.purpose}</span>
                              </div>
                            </div>

                            {/* Rejection notice if cancelled */}
                            {isRejected && (
                              <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>Cancellation Reason: <strong>{tx.rejectionReason || 'UTR not verified'}</strong></span>
                              </div>
                            )}

                            {/* Approved Code or Server Info */}
                            {isApproved && (
                              isSmp ? (
                                <div className="mt-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <Server className="w-4 h-4 text-emerald-600" />
                                    <span className="font-bold text-emerald-900 dark:text-emerald-200">play.targetsmp.in</span>
                                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">· Minecraft Player Whitelisted</span>
                                  </div>
                                  <span className="text-[11px] text-slate-500">Port: 25565 / 19132</span>
                                </div>
                              ) : isPw ? (
                                <div className="mt-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                                    <span className="font-bold text-indigo-900 dark:text-indigo-200">Class 9th Admission Confirmed</span>
                                  </div>
                                  <span className="text-[11px] text-slate-500">Student: {tx.customerName}</span>
                                </div>
                              ) : tx.redeemCode && !tx.redeemCode.startsWith('TARGETSMP') && !tx.redeemCode.startsWith('PW') ? (
                                <div className="mt-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <Gift className="w-4 h-4 text-indigo-600" />
                                    <span className="font-bold text-slate-700 dark:text-slate-300">Google Play Code:</span>
                                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white select-all">{tx.redeemCode}</span>
                                  </div>
                                  <button
                                    onClick={() => handleCopy(tx.redeemCode!)}
                                    className="p-1.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 cursor-pointer"
                                    title="Copy Code"
                                  >
                                    {copiedCode === tx.redeemCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                  </button>
                                </div>
                              ) : null
                            )}
                          </div>

                          {/* Right Column: Amount & Action Buttons (CONFIRM & CANCEL) */}
                          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800">
                            <div className="text-left lg:text-right">
                              <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Customer Paid</span>
                              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                                ₹{tx.amount.toLocaleString('en-IN')}
                              </span>
                            </div>

                            {/* THE CORE BUTTONS: CONFIRM AND CANCEL */}
                            {isPending ? (
                              <div className="flex items-center gap-2.5">
                                {/* Confirm Button */}
                                <motion.button
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => handleOpenApprovalModal(tx)}
                                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                                  title="Confirm payment and dispatch product"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Confirm Payment</span>
                                </motion.button>

                                {/* Cancel Button */}
                                <motion.button
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => setCancellingTx(tx)}
                                  className="px-3.5 py-2.5 rounded-xl border-2 border-rose-300 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                  title="Cancel or reject this payment request"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>Cancel</span>
                                </motion.button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onSelectTransaction(tx)}
                                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer"
                                >
                                  Receipt
                                </button>
                                <a
                                  href="https://instagram.com/flexme.pay"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white text-xs font-bold hover:opacity-95"
                                >
                                  DM @flexme.pay
                                </a>
                              </div>
                            )}

                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>

              {ownerDisplayedRequests.length === 0 && (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-pulse" />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    No requests found under "{ownerFilter}"
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try switching filters above or click "+ Add Test Request" to simulate a customer payment and test Confirm & Cancel!
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: CUSTOMER ORDER TRACKER VIEW                       */
          /* ========================================================= */
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Customer Order Status & Voucher Retrieval
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Track your pending payments or retrieve Google Play redeem codes and server passes.
                </p>
              </div>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setHasSearched(false);
                    }}
                    placeholder="Enter Order ID (CF_PW_...), Mobile Number, or 12-digit UTR..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer whitespace-nowrap"
                >
                  Track Order
                </button>
              </form>
            </div>

            {/* Customer Results */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {hasSearched ? `Search Results (${searchResults.length})` : `Recent Orders (${liveTransactions.slice(0, 4).length})`}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(hasSearched ? searchResults : liveTransactions.slice(0, 4)).map((tx) => {
                  const isSmp = isTargetSmpOrder(tx);
                  const isPw = isPwOrder(tx);
                  return (
                    <div
                      key={tx.orderId}
                      className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          #{tx.orderId}
                        </span>
                        <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                          tx.status === 'SUCCESS'
                            ? 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'
                            : tx.status === 'PENDING'
                            ? 'text-amber-800 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                            : 'text-rose-700 bg-rose-100 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {tx.status === 'SUCCESS' ? 'APPROVED' : tx.status === 'PENDING' ? 'PENDING VERIFICATION' : 'CANCELLED'}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                        <div><strong>Amount:</strong> ₹{tx.amount}</div>
                        <div><strong>Purpose:</strong> {tx.purpose}</div>
                        <div><strong>UTR Ref:</strong> <span className="font-mono">{tx.utrNumber || 'N/A'}</span></div>
                        <div><strong>Date:</strong> {tx.createdAt}</div>
                      </div>

                      {tx.status === 'SUCCESS' && (
                        isSmp ? (
                          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs">
                            <span className="text-[10px] font-bold text-emerald-600 block uppercase">Minecraft Server</span>
                            <span className="font-mono text-sm font-black text-slate-900 dark:text-white">play.targetsmp.in (Active)</span>
                          </div>
                        ) : isPw ? (
                          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 text-xs">
                            <span className="text-[10px] font-bold text-indigo-600 block uppercase">PW Class 9th</span>
                            <span className="text-sm font-black text-indigo-900 dark:text-white">Admission Active</span>
                          </div>
                        ) : tx.redeemCode && !tx.redeemCode.startsWith('TARGETSMP') && !tx.redeemCode.startsWith('PW') ? (
                          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-emerald-600 block uppercase">Redeem Code</span>
                              <span className="font-mono text-sm font-black text-slate-900 dark:text-white select-all">{tx.redeemCode}</span>
                            </div>
                            <button
                              onClick={() => handleCopy(tx.redeemCode!)}
                              className="p-2 text-emerald-600 cursor-pointer"
                            >
                              {copiedCode === tx.redeemCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        ) : null
                      )}

                      <div className="pt-2 flex items-center justify-between">
                        <button
                          onClick={() => onSelectTransaction(tx)}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          View Full Bill
                        </button>
                        <a
                          href="https://instagram.com/flexme.pay"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline"
                        >
                          Instagram Help @flexme.pay
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: OWNER CONFIRM PAYMENT MODAL                       */}
        {/* ========================================================= */}
        {approvingTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Confirm Customer Payment
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Order #{approvingTx.orderId}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setApprovingTx(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl p-1.5 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Order Snapshot */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Name:</span>
                  <strong className="text-slate-900 dark:text-white">{approvingTx.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{approvingTx.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount to Confirm:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 text-base">₹{approvingTx.amount.toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer UTR:</span>
                  <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                    {approvingTx.utrNumber || approvingTx.cfPaymentId}
                  </span>
                </div>
              </div>

              <form onSubmit={handleConfirmAndApprove} className="space-y-4">
                {isTargetSmpOrder(approvingTx) ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs space-y-1">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 block">
                      TargetSMP Direct Whitelist
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      This confirms server access on <strong>play.targetsmp.in</strong> without issuing a Play Store code.
                    </p>
                  </div>
                ) : isPwOrder(approvingTx) ? (
                  <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 text-xs space-y-1">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 block">
                      PW Class 9th Admission Activation
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      This activates admission directly on the student registered number without a Play Store code.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        16-Digit Google Play Store Code:
                      </label>
                      <button
                        type="button"
                        onClick={() => setAdminCustomCode(generatePlayStoreRedeemCode())}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Random</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={adminCustomCode}
                      onChange={(e) => setAdminCustomCode(e.target.value.toUpperCase())}
                      placeholder="GPLY-XXXX-XXXX-XXXX"
                      className="w-full font-mono text-base font-black px-4 py-3 rounded-2xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/40 text-slate-900 dark:text-white tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {approvalFeedback && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{approvalFeedback}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setApprovingTx(null)}
                    className="py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingApproval}
                    className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSubmittingApproval ? 'Confirming...' : 'Confirm & Approve'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: OWNER CANCEL / REJECT MODAL                       */}
        {/* ========================================================= */}
        {cancellingTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md">
                    <Ban className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-rose-600 dark:text-rose-400">
                      Cancel Payment Request
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Order #{cancellingTx.orderId}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCancellingTx(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xl p-1.5 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs space-y-1">
                <div><strong>Customer:</strong> {cancellingTx.customerName} ({cancellingTx.customerPhone})</div>
                <div><strong>Amount:</strong> ₹{cancellingTx.amount}</div>
                <div><strong>UTR Ref:</strong> <span className="font-mono">{cancellingTx.utrNumber || 'None'}</span></div>
              </div>

              <form onSubmit={handleCancelRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Cancellation / Rejection Reason:
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="UTR not matching with bank credit / Payment not received">
                      UTR not matching with bank credit / Payment not received
                    </option>
                    <option value="Incorrect payment amount received">
                      Incorrect payment amount received
                    </option>
                    <option value="Cancelled by customer request">
                      Cancelled by customer request
                    </option>
                    <option value="Duplicate payment submission">
                      Duplicate payment submission
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancellingTx(null)}
                    className="py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                  >
                    Keep Request
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCancel}
                    className="py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Ban className="w-4 h-4" />
                    <span>{isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancel'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </div>
    </section>
  );
};
