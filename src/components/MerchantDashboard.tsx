import React, { useState, useEffect } from 'react';
import { TransactionRecord, PaymentLink, CashfreeSettings } from '../types/payment';
import { exportTransactionsToCSV, updateTransaction } from '../utils/storage';
import { playCashfreeSoundbox, generatePlayStoreRedeemCode } from '../utils/soundbox';
import { sendVoucherCodeToCustomer, loadSentEmails, getOwnerNotificationUrls, EmailLog } from '../services/emailService';
import { EmailNotificationModal } from './EmailNotificationModal';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { OWNER_ADMIN_EMAIL } from '../types/auth';
import { 
  Plus, Download, Share2, Copy, Check, QrCode, Key, Volume2, 
  Settings, ArrowUpRight, TrendingUp, DollarSign, Users, ShieldCheck, 
  CheckCircle2, Clock, AlertCircle, Sparkles, KeyRound, X, Mail, MessageCircle, ShieldAlert 
} from 'lucide-react';

interface MerchantDashboardProps {
  transactions: TransactionRecord[];
  paymentLinks: PaymentLink[];
  onAddPaymentLink: (link: PaymentLink) => void;
  settings: CashfreeSettings;
  onUpdateSettings: (settings: CashfreeSettings) => void;
  onOpenQuickPayWithLink: (link: PaymentLink) => void;
  onSelectTransaction: (tx: TransactionRecord) => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  transactions,
  paymentLinks,
  onAddPaymentLink,
  settings,
  onUpdateSettings,
  onOpenQuickPayWithLink,
  onSelectTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'transactions' | 'links' | 'settings'>('approvals');
  const [showCreateLinkModal, setShowCreateLinkModal] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Approval Modal State
  const [selectedTxForApproval, setSelectedTxForApproval] = useState<TransactionRecord | null>(null);
  const [adminGiftCode, setAdminGiftCode] = useState<string>('');
  const [approvalError, setApprovalError] = useState<string>('');

  // Reject Modal State
  const [selectedTxForReject, setSelectedTxForReject] = useState<TransactionRecord | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('UTR not matching with bank credit');

  // Email Log State
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [sentEmails, setSentEmails] = useState<EmailLog[]>(loadSentEmails);

  useEffect(() => {
    const handleEmailUpdate = () => setSentEmails(loadSentEmails());
    window.addEventListener('app_emails_updated', handleEmailUpdate);
    return () => window.removeEventListener('app_emails_updated', handleEmailUpdate);
  }, []);

  // Create Link form state
  const [linkTitle, setLinkTitle] = useState<string>('');
  const [linkAmount, setLinkAmount] = useState<string>('');
  const [linkDesc, setLinkDesc] = useState<string>('');
  const [isOpenAmount, setIsOpenAmount] = useState<boolean>(false);

  // Settings form state
  const [localSettings, setLocalSettings] = useState<CashfreeSettings>(settings);
  const [settingsSavedToast, setSettingsSavedToast] = useState<boolean>(false);

  // Computed metrics
  const pendingTransactions = transactions.filter(tx => tx.status === 'PENDING');
  const successTransactions = transactions.filter(tx => tx.status === 'SUCCESS');
  const totalCollected = successTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const successCount = successTransactions.length;
  const avgTicket = successCount > 0 ? Math.round(totalCollected / successCount) : 0;

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim()) return;

    const amt = isOpenAmount ? null : (parseFloat(linkAmount) || 100);
    const newLink: PaymentLink = {
      id: `PL_PW_${Math.floor(100 + Math.random() * 900)}`,
      title: linkTitle.trim(),
      amount: amt,
      description: linkDesc.trim() || 'Payment via Cashfree',
      status: 'ACTIVE',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      collectedAmount: 0,
    };

    onAddPaymentLink(newLink);
    setLinkTitle('');
    setLinkAmount('');
    setLinkDesc('');
    setShowCreateLinkModal(false);
  };

  const handleCopyLink = (link: PaymentLink) => {
    const url = `${window.location.origin}?link=${link.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareInstagram = (link: PaymentLink) => {
    const amtText = link.amount ? `₹${link.amount}` : 'an amount';
    const text = `FLEX Pay: Please pay ${amtText} for "${link.title}" via Cashfree. Link: ${window.location.origin}?link=${link.id} (Instagram: @flexme.pay)`;
    navigator.clipboard.writeText(text);
    window.open('https://instagram.com/flexme.pay', '_blank');
  };

  const handleOpenApprovalModal = (tx: TransactionRecord) => {
    setSelectedTxForApproval(tx);
    setAdminGiftCode(tx.isPlayStoreOrder ? generatePlayStoreRedeemCode() : '');
    setApprovalError('');
  };

  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxForApproval) return;

    const isSmp = selectedTxForApproval.purpose.toLowerCase().includes('targetsmp') || selectedTxForApproval.purpose.toLowerCase().includes('target smp');
    const isPw = selectedTxForApproval.purpose.toLowerCase().includes('pw ') || selectedTxForApproval.purpose.toLowerCase().includes('class 9') || selectedTxForApproval.purpose.toLowerCase().includes('physics wallah');

    let codeToSave: string | undefined;
    if (isSmp) {
      codeToSave = 'TARGETSMP_ACTIVE';
    } else if (isPw) {
      codeToSave = 'PW_CLASS9_ACTIVE';
    } else {
      codeToSave = adminGiftCode.trim() || generatePlayStoreRedeemCode();
    }
    const approvedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);

    updateTransaction(selectedTxForApproval.orderId, {
      status: 'SUCCESS',
      redeemCode: codeToSave,
      adminApprovedAt: approvedAt,
      adminApprovedBy: 'FLEX Admin',
    });

    // Send email with code and OTP to customer
    sendVoucherCodeToCustomer({
      orderId: selectedTxForApproval.orderId,
      customerName: selectedTxForApproval.customerName,
      customerEmail: selectedTxForApproval.customerEmail,
      amount: selectedTxForApproval.amount,
      redeemCode: codeToSave,
      adminApprovedAt: approvedAt,
    });
    setSentEmails(loadSentEmails());

    playCashfreeSoundbox(selectedTxForApproval.amount, settings.soundboxVoice);
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
    });

    setSelectedTxForApproval(null);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxForReject) return;

    updateTransaction(selectedTxForReject.orderId, {
      status: 'REJECTED',
      rejectionReason: rejectReason.trim() || 'Payment could not be verified by admin.',
      adminApprovedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      adminApprovedBy: 'FLEX Admin (Owner)',
    });

    setSelectedTxForReject(null);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  return (
    <section id="merchant-section" className="py-12 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
              <span>Admin / Owner Control Desk</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">Verified Administrator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Merchant Operations & Code Approval Queue
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Verify pending customer payments, insert Google Play redeem codes, confirm settlements, and export accounting reports.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowEmailModal(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Logs ({sentEmails.length})</span>
            </button>

            <button
              onClick={() => setShowCreateLinkModal(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Create Payment Link</span>
            </button>

            <button
              onClick={() => exportTransactionsToCSV(transactions)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`p-5 rounded-2xl border transition-all ${
            pendingTransactions.length > 0 
              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 ring-2 ring-amber-500/20' 
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center justify-between text-xs font-medium text-amber-700 dark:text-amber-300">
              <span>Pending Admin Verification</span>
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 dark:text-amber-200 mt-1 tabular-nums">
              {pendingTransactions.length} Orders
            </div>
            <div className="text-[11px] text-amber-700/80 dark:text-amber-400 font-medium mt-1">
              Requires Code Entry & Confirmation
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Approved Volume
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
              ₹{totalCollected.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              Settled to Bank Account
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Delivered Vouchers
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
              {successCount} Codes
            </div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">
              Admin Verified by Owner
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Average Ticket Size
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
              ₹{avgTicket.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
              Across UPI & QR Payments
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Functional Segmented Control) */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl max-w-xl mb-6">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'approvals'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Pending Approvals</span>
            {pendingTransactions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono">
                {pendingTransactions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'transactions'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Ledger ({transactions.length})
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'links'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Payment Links ({paymentLinks.length})
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            API & Soundbox
          </button>
        </div>

        {/* TAB: PENDING APPROVALS QUEUE */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            {pendingTransactions.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  All Payments Verified & Clear!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  There are no pending transactions waiting for code entry. When a customer pays via UPI/QR, it will show up here for you to approve.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingTransactions.map((tx) => (
                  <div
                    key={tx.orderId}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-800/80 shadow-md flex flex-col justify-between space-y-4 relative"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            {tx.orderId}
                          </span>
                        </div>
                        <span className="text-xs font-black text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded">
                          PENDING VERIFICATION
                        </span>
                      </div>

                      <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums mb-3">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </div>

                      <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div><strong className="text-slate-900 dark:text-white">Customer:</strong> {tx.customerName} ({tx.customerPhone})</div>
                        <div><strong className="text-slate-900 dark:text-white">Purpose:</strong> {tx.purpose}</div>
                        <div><strong className="text-slate-900 dark:text-white">Submitted UTR:</strong> <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{tx.utrNumber || 'None entered'}</span></div>
                        <div><strong className="text-slate-900 dark:text-white">Time:</strong> <span className="font-mono">{tx.createdAt}</span></div>
                      </div>

                      {/* Direct Owner Notification Quick Actions */}
                      <div className="flex items-center justify-between text-[11px] pt-2 px-1">
                        <span className="text-slate-500">Owner Alert:</span>
                        <div className="flex items-center gap-3">
                          <a
                            href={getOwnerNotificationUrls({
                              orderId: tx.orderId,
                              customerName: tx.customerName,
                              customerPhone: tx.customerPhone,
                              customerEmail: tx.customerEmail,
                              amount: tx.amount,
                              purpose: tx.purpose,
                              utrNumber: tx.utrNumber || 'N/A',
                              createdAt: tx.createdAt,
                            }).gmailUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Gmail Compose ↗</span>
                          </a>
                          <a
                            href="https://instagram.com/flexme.pay"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 dark:text-pink-400 hover:text-pink-700 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <svg className="w-3 h-3 fill-current shrink-0" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            <span>Instagram @flexme.pay ↗</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenApprovalModal(tx)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Enter Gift Code</span>
                      </button>

                      <button
                        onClick={() => setSelectedTxForReject(tx)}
                        className="py-2.5 px-3 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 1: ALL TRANSACTIONS TABLE */}
        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">UTR Ref</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Gift Code</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {transactions.map((tx) => (
                    <tr key={tx.orderId} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">{tx.orderId}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{tx.createdAt}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">{tx.customerName}</div>
                        <div className="text-[11px] text-slate-400">{tx.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                        {tx.purpose}
                      </td>
                      <td className="py-3 px-4 font-black text-slate-900 dark:text-white tabular-nums">
                        ₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {tx.utrNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {tx.status === 'SUCCESS' && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                          </span>
                        )}
                        {tx.status === 'PENDING' && (
                          <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 animate-spin" /> PENDING
                          </span>
                        )}
                        {tx.status === 'REJECTED' && (
                          <span className="text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> REJECTED
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {tx.redeemCode ? (
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{tx.redeemCode}</span>
                        ) : (
                          <span className="text-slate-400 italic">Not issued</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {tx.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenApprovalModal(tx)}
                              className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                            >
                              Approve
                            </button>
                            <span className="text-slate-300">·</span>
                            <button
                              onClick={() => setSelectedTxForReject(tx)}
                              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onSelectTransaction(tx)}
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                          >
                            Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PAYMENT LINKS */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paymentLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-slate-400">{link.id}</span>
                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">
                        ACTIVE
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {link.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {link.description}
                    </p>
                    <div className="mt-3 text-lg font-black text-slate-900 dark:text-white tabular-nums">
                      {link.amount ? `₹${link.amount.toLocaleString('en-IN')}` : 'Open Custom Amount'}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyLink(link)}
                      className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedId === link.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === link.id ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleShareInstagram(link)}
                      className="py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      title="Share link to Instagram @flexme.pay"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>@flexme.pay</span>
                    </button>

                    <button
                      onClick={() => onOpenQuickPayWithLink(link)}
                      className="py-1.5 px-3 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS & CASHFREE API */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>Cashfree API Credentials & Admin Configuration</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Official Administrator Credentials: <strong className="text-slate-700 dark:text-slate-200">Active & Authorized (Private)</strong>
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Merchant / Admin Name
                </label>
                <input
                  type="text"
                  value={localSettings.merchantName}
                  onChange={(e) => setLocalSettings({ ...localSettings, merchantName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Cashfree App ID (Client ID)
                </label>
                <input
                  type="text"
                  value={localSettings.appId}
                  onChange={(e) => setLocalSettings({ ...localSettings, appId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Cashfree Secret Key
                </label>
                <input
                  type="password"
                  value={localSettings.secretKey}
                  onChange={(e) => setLocalSettings({ ...localSettings, secretKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Environment Mode
                  </label>
                  <select
                    value={localSettings.environment}
                    onChange={(e) => setLocalSettings({ ...localSettings, environment: e.target.value as 'TEST' | 'PRODUCTION' })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="TEST">TEST / Sandbox (Manual + Soundbox)</option>
                    <option value="PRODUCTION">PRODUCTION (Live Cashfree Gateway)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Soundbox Voice Language
                  </label>
                  <select
                    value={localSettings.soundboxVoice}
                    onChange={(e) => setLocalSettings({ ...localSettings, soundboxVoice: e.target.value as 'en' | 'hi' })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="en">English ("Payment of ₹500 received")</option>
                    <option value="hi">Hindi ("कैशफ्री पर 500 रुपये प्राप्त हुए")</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Save Admin Settings
                </button>

                {settingsSavedToast && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Settings Saved!
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* MODAL: ADMIN APPROVE & ENTER GIFT CARD CODE */}
        {selectedTxForApproval && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Confirm Payment & Dispatch Gift Code
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      Order: {selectedTxForApproval.orderId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTxForApproval(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Info Strip */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Received:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 tabular-nums text-sm">₹{selectedTxForApproval.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedTxForApproval.customerName} ({selectedTxForApproval.customerPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer UTR:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{selectedTxForApproval.utrNumber || 'N/A'}</span>
                </div>
              </div>

              <form onSubmit={handleConfirmApproval} className="space-y-4">
                {selectedTxForApproval.purpose.toLowerCase().includes('targetsmp') || selectedTxForApproval.purpose.toLowerCase().includes('target smp') ? (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs space-y-1">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 block">TargetSMP Direct Whitelist</span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      Whitelists the player on <strong>play.targetsmp.in</strong> directly upon confirmation without issuing a Play Store code.
                    </p>
                  </div>
                ) : selectedTxForApproval.purpose.toLowerCase().includes('pw ') || selectedTxForApproval.purpose.toLowerCase().includes('class 9') || selectedTxForApproval.purpose.toLowerCase().includes('physics wallah') ? (
                  <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 text-xs space-y-1">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200 block">PW Class 9th Admission Activation</span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                      Activates the student admission on their registered mobile number directly upon confirmation without issuing a Play Store code.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Enter Google Play Redeem Code *
                      </label>
                      <button
                        type="button"
                        onClick={() => setAdminGiftCode(generatePlayStoreRedeemCode())}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Auto-Generate 16-Digit Code</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      required
                      value={adminGiftCode}
                      onChange={(e) => setAdminGiftCode(e.target.value.toUpperCase())}
                      placeholder="GPLY-XXXX-XXXX-XXXX"
                      className="w-full px-4 py-3 rounded-xl border-2 border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-base font-black tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Once approved, this code will immediately be revealed on the customer's screen and order status will shift to SUCCESS.
                    </p>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTxForApproval(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve & Dispatch Code (SUCCESS)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADMIN REJECT ORDER */}
        {selectedTxForReject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white text-rose-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>Reject Order {selectedTxForReject.orderId}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to mark this transaction as failed?
              </p>

              <form onSubmit={handleConfirmReject} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Rejection Reason
                  </label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTxForReject(null)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Payment Link */}
        {showCreateLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Create Cashfree Payment Link
                </h3>
                <button
                  onClick={() => setShowCreateLinkModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Title / Purpose *
                  </label>
                  <input
                    type="text"
                    required
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    placeholder="e.g. Google Play Code ₹1000 or Batch Fee"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Amount (INR)
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] text-indigo-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isOpenAmount}
                        onChange={(e) => setIsOpenAmount(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>Let customer enter amount</span>
                    </label>
                  </div>
                  {!isOpenAmount && (
                    <input
                      type="number"
                      required
                      min="1"
                      value={linkAmount}
                      onChange={(e) => setLinkAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold font-mono"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description / Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={linkDesc}
                    onChange={(e) => setLinkDesc(e.target.value)}
                    placeholder="e.g. Valid for 24 hours. Pay via GPay/PhonePe."
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateLinkModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    Generate Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Email Logs Viewer Modal */}
        <EmailNotificationModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          emails={sentEmails}
        />

      </div>
    </section>
  );
};
