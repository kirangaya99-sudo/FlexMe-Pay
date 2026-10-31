import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, ExternalLink, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface UpiPaymentQrProps {
  amount: number;
  purpose: string;
  customerName?: string;
  onPaymentConfirm: (utr?: string) => void;
  isProcessing?: boolean;
}

export const UpiPaymentQr: React.FC<UpiPaymentQrProps> = ({
  amount,
  purpose,
  customerName,
  onPaymentConfirm,
  isProcessing = false,
}) => {
  const upiId = 'kumar00697@fam';
  const payeeName = 'PlayStore Payment by PW';

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [viewMode, setViewMode] = useState<'dynamic' | 'original'>('dynamic');

  // Exact UPI intent standard formatted for Indian banking apps
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(purpose || 'PlayStore Payment')}`;

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(upiUrl, {
      width: 320,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url: string) => {
        if (isMounted) {
          setQrDataUrl(url);
        }
      })
      .catch((err: unknown) => {
        console.error('Failed to generate dynamic UPI QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [upiUrl]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleDirectUpiPay = () => {
    window.location.href = upiUrl;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
      
      {/* Amount Header Badge */}
      <div className="w-full mb-3 flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
        <span className="text-slate-500 font-medium">Customized Amount:</span>
        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
          ₹{amount.toLocaleString('en-IN')}
        </span>
      </div>

      {/* QR Code Container matching user's exact uploaded image layout */}
      <div className="relative p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center w-full">
        
        {viewMode === 'dynamic' ? (
          <div className="relative">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Scan to pay ₹${amount} to ${upiId}`}
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain rounded-lg"
              />
            ) : (
              <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
                Generating QR for ₹{amount}...
              </div>
            )}

            {/* Central amount chip overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2.5 py-1 rounded-md shadow-md border border-slate-200 text-center pointer-events-none">
              <span className="text-[11px] font-black text-slate-900 block tabular-nums">₹{amount}</span>
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src="/assets/aistudio/Screenshot_2026-10-31_132408_ffd15349.png"
              alt="Scan and pay QR code"
              className="w-56 h-auto sm:w-64 object-contain rounded-lg"
            />
          </div>
        )}

        {/* View toggle */}
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => setViewMode('dynamic')}
            className={`text-[11px] px-2.5 py-0.5 rounded font-medium transition-colors ${
              viewMode === 'dynamic'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ₹{amount} Dynamic QR
          </button>
          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`text-[11px] px-2.5 py-0.5 rounded font-medium transition-colors ${
              viewMode === 'original'
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Original Card
          </button>
        </div>

        {/* UPI ID Text matching Screenshot exactly */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="text-base font-bold text-slate-700 font-mono tracking-tight select-all">
            {upiId}
          </span>
          <button
            type="button"
            onClick={handleCopyUpi}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Copy UPI ID"
          >
            {copiedUpi ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Caption from Screenshot: "Scan and pay with any BHIM UPI app" */}
        <p className="text-sm font-semibold text-slate-700 mt-2">
          Scan and pay with any BHIM UPI app
        </p>

        {/* Blue Badge from Screenshot: "Online Payment System" */}
        <div className="my-2 inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-sm">
          <span>📇</span>
          <span>Online Payment System</span>
        </div>

        {/* Brand logos row from Screenshot: BHIM, UPI, GPay, PhonePe, Paytm, Amazon Pay */}
        <div className="w-full flex items-center justify-center flex-wrap gap-3 pt-2 pb-1 text-[11px] font-bold text-slate-700 border-t border-slate-100 mt-2">
          <span className="text-indigo-900 tracking-wider">BHIM</span>
          <span className="text-emerald-700">UPI</span>
          <span className="text-blue-600">G Pay</span>
          <span className="text-purple-700">PhonePe</span>
          <span className="text-sky-600">Paytm</span>
          <span className="text-amber-600">amazon pay</span>
        </div>

      </div>

      {/* Direct UPI App intent button (for mobile phones) */}
      <div className="w-full mt-4 space-y-3">
        <button
          type="button"
          onClick={handleDirectUpiPay}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <span>Open in UPI App to Pay ₹{amount.toLocaleString('en-IN')}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        {/* 12-Digit UTR / Transaction ID (Optional) */}
        <div className="pt-2 text-left w-full">
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            UPI Reference / UTR Number (Optional after payment):
          </label>
          <input
            type="text"
            maxLength={12}
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
            placeholder="12-digit UTR e.g. 402918291024"
            className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono"
          />
        </div>

        {/* Confirmation Button */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => onPaymentConfirm(utrNumber.trim() || undefined)}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>I Have Paid ₹{amount.toLocaleString('en-IN')} (Submit for Admin Verification)</span>
        </button>

        <p className="text-[11px] text-slate-400">
          Payment is automatically matched with UPI ID <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">kumar00697@fam</span>
        </p>
      </div>

    </div>
  );
};
