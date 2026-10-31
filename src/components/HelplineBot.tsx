import React, { useState, useEffect, useRef } from 'react';
import { TransactionRecord } from '../types/payment';
import { generateSupportComplaint, ComplaintTicket } from '../services/emailService';
import { 
  Bot, Send, MessageSquare, AlertCircle, CheckCircle2, Copy, 
  ExternalLink, Mail, MessageCircle, RefreshCw, Sparkles, X, ChevronRight, User, Phone, FileText, Download, ShieldCheck
} from 'lucide-react';

interface HelplineBotProps {
  transactions: TransactionRecord[];
  isFloatingModal?: boolean;
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  ticket?: ComplaintTicket;
  gmailUrl?: string;
  whatsappUrl?: string;
  instagramUrl?: string;
  mailtoUrl?: string;
  options?: { label: string; action: string }[];
}

const COMPLAINT_CATEGORIES = [
  { id: 'CODE_DELAYED', label: '🕒 Redeem Code Delayed / Pending Approval', defaultDesc: 'I completed payment via UPI QR but my Google Play recharge code has not arrived yet. Please verify my UTR and dispatch the code.' },
  { id: 'INVALID_CODE', label: '❌ Invalid / Already Redeemed Code on Play Store', defaultDesc: 'The Google Play code provided shows an error: "This code has already been redeemed" or "Invalid code". Please replace or verify.' },
  { id: 'DEBITED_FAILED', label: '💸 Money Debited but Order Shows Failed/Pending', defaultDesc: 'Money was debited from my bank account via UPI, but the order status is stuck on pending or interrupted. Please verify payment.' },
  { id: 'WRONG_UTR', label: '🔢 Incorrect UTR Submitted / Need Re-verification', defaultDesc: 'I entered the wrong 12-digit UTR during checkout. Please update and verify my actual bank transaction ref.' },
  { id: 'DOUBLE_DEBIT', label: '🔄 Duplicate Deduction / Charged Twice', defaultDesc: 'My bank account was debited twice for the same order. Please verify and refund the excess amount to my UPI ID.' },
  { id: 'REFUND_REQ', label: '💰 Refund / Order Cancellation Request', defaultDesc: 'I wish to cancel my purchase and request a full refund to my original payment UPI account.' },
  { id: 'OTHER', label: '💬 Other Inquiry / Contact FLEX Admin', defaultDesc: 'I have a specific query regarding my purchase or recharge code verification.' },
];

const COMPLAINTS_STORAGE_KEY = 'playstore_pw_user_complaints_v1';

export const HelplineBot: React.FC<HelplineBotProps> = ({
  transactions,
  isFloatingModal = false,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'm-welcome',
      sender: 'bot',
      text: 'Hello! I am the 24/7 Helpline Support Bot for FLEX Pay. How can I assist you today? If you have encountered an issue with your payment, UTR verification, or Google Play recharge code, select an option below to generate an official complaint ticket for FLEX Admin, or chat directly on Instagram @flexme.pay.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options: COMPLAINT_CATEGORIES.map(c => ({ label: c.label, action: `CATEGORY_${c.id}` }))
    }
  ]);

  const [inputVal, setInputVal] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form mode for structured complaint generation
  const [isGeneratingTicket, setIsGeneratingTicket] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(COMPLAINT_CATEGORIES[0].label);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [customUtr, setCustomUtr] = useState<string>('');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [issueDetails, setIssueDetails] = useState<string>(COMPLAINT_CATEGORIES[0].defaultDesc);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGeneratingTicket]);

  // Autofill with latest transaction if available
  useEffect(() => {
    if (transactions.length > 0) {
      const latest = transactions[0];
      setCustomerName(latest.customerName || '');
      setCustomerPhone(latest.customerPhone || '');
      setCustomerEmail(latest.customerEmail || '');
      setSelectedOrderId(latest.orderId);
      setCustomUtr(latest.utrNumber || '');
      setCustomAmount(latest.amount.toString());
    }
  }, [transactions]);

  const handleSelectOption = (action: string) => {
    const catId = action.replace('CATEGORY_', '');
    const found = COMPLAINT_CATEGORIES.find(c => c.id === catId);
    if (!found) return;

    setSelectedCategory(found.label);
    setIssueDetails(found.defaultDesc);

    // User message
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: `Issue: ${found.label}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Bot response initiating ticket wizard
    const botMsg: ChatMessage = {
      id: `b-${Date.now() + 1}`,
      sender: 'bot',
      text: `I understand your issue regarding "${found.label}". Let's create an official priority complaint ticket. Please verify your details below so Store Owner raunakgaya99@gmail.com can investigate and resolve it immediately.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setIsGeneratingTicket(true);
  };

  const handleSendCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    setInputVal('');

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Bot intelligence parsing
    let autoCategory = COMPLAINT_CATEGORIES[0].label;
    let autoDesc = userText;

    if (userText.toLowerCase().includes('code') || userText.toLowerCase().includes('redeem')) {
      autoCategory = COMPLAINT_CATEGORIES[1].label;
    } else if (userText.toLowerCase().includes('refund') || userText.toLowerCase().includes('cancel')) {
      autoCategory = COMPLAINT_CATEGORIES[5].label;
    } else if (userText.toLowerCase().includes('debit') || userText.toLowerCase().includes('bank') || userText.toLowerCase().includes('money')) {
      autoCategory = COMPLAINT_CATEGORIES[2].label;
    }

    setSelectedCategory(autoCategory);
    setIssueDetails(autoDesc);

    const botReply: ChatMessage = {
      id: `b-${Date.now() + 1}`,
      sender: 'bot',
      text: `Thanks for the details. I have prepared your complaint draft under category: "${autoCategory}". Please verify the order and contact information below to finalize the ticket and email it directly to the store owner.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg, botReply]);
    setIsGeneratingTicket(true);
  };

  const handleFinalizeTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim()) {
      alert('Please provide your name and email address so the store owner can respond to you.');
      return;
    }

    const { ticket, bodyText, gmailUrl, whatsappUrl, instagramUrl, mailtoUrl } = generateSupportComplaint({
      category: selectedCategory,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || 'N/A',
      customerEmail: customerEmail.trim(),
      orderId: selectedOrderId || undefined,
      utrNumber: customUtr.trim() || undefined,
      amount: customAmount ? parseFloat(customAmount) : undefined,
      issueDescription: issueDetails.trim(),
      urgency: 'HIGH',
    });

    // Save ticket locally
    try {
      const existingRaw = localStorage.getItem(COMPLAINTS_STORAGE_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify([ticket, ...existing]));
    } catch (err) {
      console.warn('Failed saving complaint:', err);
    }

    const confirmationMsg: ChatMessage = {
      id: `b-confirmed-${Date.now()}`,
      sender: 'bot',
      text: `Your Official FLEX Helpline Ticket #${ticket.ticketId} has been generated! You can send it directly to FLEX Admin via Instagram (@flexme.pay) or click "Open in Gmail" below to dispatch it to the Store Owner desk:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ticket,
      gmailUrl,
      whatsappUrl,
      instagramUrl,
      mailtoUrl,
    };

    setMessages(prev => [...prev, confirmationMsg]);
    setIsGeneratingTicket(false);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownloadTicket = (ticket: ComplaintTicket) => {
    const content = `PLAYSTORE PAYMENT BY PW - HELPLINE TICKET\n\nTicket ID: #${ticket.ticketId}\nCategory: ${ticket.category}\nDate: ${ticket.createdAt}\nStatus: ${ticket.status}\n\nCustomer: ${ticket.customerName} (${ticket.customerPhone})\nEmail: ${ticket.customerEmail}\nOrder ID: ${ticket.orderId || 'N/A'}\nUTR: ${ticket.utrNumber || 'N/A'}\nAmount: ₹${ticket.amount || 'N/A'}\n\nDescription:\n${ticket.issueDescription}\n\nEscalated to Store Owner: raunakgaya99@gmail.com`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Support_Ticket_${ticket.ticketId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const containerClasses = isFloatingModal
    ? 'flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden'
    : 'max-w-4xl mx-auto my-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[640px]';

  return (
    <div className={containerClasses}>
      
      {/* Bot Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold tracking-tight">
                24/7 Helpline Support Bot
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                LIVE ASSISTANT
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Instant Complaint Filing & Direct Escalation to Store Owner
            </p>
          </div>
        </div>

        {isFloatingModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="bg-indigo-50/80 dark:bg-indigo-950/40 px-4 py-2 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>All payment disputes are resolved with priority within 2-4 hours.</span>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          Support Desk: Active
        </span>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[500px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Bot Quick Complaint Options */}
              {msg.options && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Select your complaint reason:
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {msg.options.map((opt) => (
                      <button
                        key={opt.action}
                        type="button"
                        onClick={() => handleSelectOption(opt.action)}
                        className="text-left py-2 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center justify-between group cursor-pointer shadow-xs"
                      >
                        <span>{opt.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Ticket Card */}
              {msg.ticket && (
                <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-indigo-300 dark:border-indigo-700 text-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="font-bold text-slate-900 dark:text-white uppercase">
                        Complaint Ticket #{msg.ticket.ticketId}
                      </span>
                    </div>
                    <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold px-2 py-0.5 rounded-full">
                      {msg.ticket.urgency} PRIORITY
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div><strong>Issue:</strong> {msg.ticket.category}</div>
                    <div><strong>Customer:</strong> {msg.ticket.customerName} ({msg.ticket.customerPhone})</div>
                    <div><strong>Email:</strong> •••••••••••• (Protected)</div>
                    <div><strong>Order ID:</strong> {msg.ticket.orderId || 'N/A'}</div>
                    <div><strong>Submitted UTR:</strong> {msg.ticket.utrNumber || 'N/A'}</div>
                    <div><strong>Amount:</strong> {msg.ticket.amount ? `₹${msg.ticket.amount}` : 'N/A'}</div>
                    <div><strong>Recipient:</strong> Store Administrator Desk</div>
                  </div>

                  {/* High-visibility Action Buttons to Send to Owner */}
                  <div className="pt-2 space-y-2">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Send Complaint to FLEX Admin:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a
                        href="https://instagram.com/flexme.pay"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      >
                        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        <span>📸 Message @flexme.pay</span>
                      </a>

                      {msg.gmailUrl && (
                        <a
                          href={msg.gmailUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                        >
                          <Mail className="w-4 h-4 shrink-0" />
                          <span>🚀 Open in Gmail (Store Owner Desk)</span>
                        </a>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.ticket!.ticketId, msg.ticket!.issueDescription)}
                        className="py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1 hover:bg-slate-50 cursor-pointer"
                      >
                        {copiedId === msg.ticket.ticketId ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === msg.ticket.ticketId ? 'Copied to Clipboard!' : 'Copy Complaint Text'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadTicket(msg.ticket!)}
                        className="py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1 hover:bg-slate-50 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Ticket (.txt)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <span className="text-[10px] text-slate-400 mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {/* Structured Ticket Wizard Form */}
        {isGeneratingTicket && (
          <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border-2 border-indigo-400 dark:border-indigo-700 space-y-4 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Fill Complaint Information
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsGeneratingTicket(false)}
                className="text-slate-500 hover:text-slate-800 text-[11px]"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleFinalizeTicket} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Complaint Category:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  {COMPLAINT_CATEGORIES.map(c => (
                    <option key={c.id} value={c.label}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone Number:
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Email Address:
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Amount (₹):
                  </label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Order ID (if known):
                  </label>
                  <input
                    type="text"
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    placeholder="e.g. ORD_PW_12345"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank UTR / Transaction Ref:
                  </label>
                  <input
                    type="text"
                    value={customUtr}
                    onChange={(e) => setCustomUtr(e.target.value)}
                    placeholder="12-digit UTR ref"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Complaint Description:
                </label>
                <textarea
                  rows={3}
                  required
                  value={issueDetails}
                  onChange={(e) => setIssueDetails(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsGeneratingTicket(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Official Ticket & Prepare Email</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Bar */}
      <form onSubmit={handleSendCustomText} className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask a question or explain your problem to the bot..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};
