import React, { useState } from 'react';
import { EmailLog } from '../services/emailService';
import { Mail, Check, Copy, ExternalLink, X, Send, UserCheck, Shield, MessageCircle } from 'lucide-react';

interface EmailNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  emails: EmailLog[];
  filterOrderId?: string;
}

export const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({
  isOpen,
  onClose,
  emails,
  filterOrderId,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const displayEmails = filterOrderId
    ? emails.filter((e) => e.orderId === filterOrderId)
    : emails;

  const handleCopyBody = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenClient = (email: EmailLog) => {
    const url = `mailto:${email.to}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.bodyText)}`;
    window.location.href = url;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Email Dispatch & Notification Log</h3>
              <p className="text-[11px] text-slate-400">
                Official alerts dispatched to Store Owner and customers (Credentials Kept Private)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

          {/* List of Sent Emails */}
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            {displayEmails.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No email notifications recorded yet. Complete a payment to see live email dispatches!
              </div>
            ) : (
              displayEmails.map((email) => {
                const isOwner = email.type === 'OWNER_ALERT';
                return (
                  <div
                    key={email.id}
                    className={`p-4 rounded-2xl border text-xs space-y-3 ${
                      isOwner
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                        : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isOwner ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        }`}>
                          {isOwner ? 'OWNER ALERT' : 'CUSTOMER CODE & OTP'}
                        </span>
                        <span className="font-mono text-slate-500">Order #{email.orderId}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{email.sentAt}</span>
                    </div>

                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{email.subject}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Target: <strong className="text-slate-700 dark:text-slate-300">{isOwner ? 'Store Owner Inbox' : 'Customer Account Target'}</strong> · Dispatch Status: Registered
                      </div>
                    </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-[11px] whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    {email.bodyText}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 flex-wrap">
                    {email.gmailUrl && (
                      <a
                        href={email.gmailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Open Gmail</span>
                      </a>
                    )}

                    <a
                      href={email.instagramUrl || "https://instagram.com/flexme.pay"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-95 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span>Instagram @flexme.pay</span>
                    </a>

                    <button
                      onClick={() => handleCopyBody(email.id, email.bodyText)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1 hover:bg-slate-50 cursor-pointer"
                    >
                      {copiedId === email.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === email.id ? 'Copied' : 'Copy Text'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenClient(email)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer hover:bg-slate-200"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Mail App</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Automated email dispatches are saved and can be triggered via mailto client.
          </span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
