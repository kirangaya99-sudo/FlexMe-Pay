import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { PlayStoreRecharge } from './components/PlayStoreRecharge';
import { CollectPaymentForm } from './components/CollectPaymentForm';
import { GameTopUp } from './components/GameTopUp';
import { TargetSmpPayment } from './components/TargetSmpPayment';
import { TrackPayment } from './components/TrackPayment';
import { MerchantDashboard } from './components/MerchantDashboard';
import { SecurityTrust } from './components/SecurityTrust';
import { Footer } from './components/Footer';
import { CashfreeModal } from './components/CashfreeModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { HelplineBot } from './components/HelplineBot';
import { LoginModal } from './components/LoginModal';
import { Bot, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';

import { 
  TransactionRecord, PaymentLink, CashfreeSettings 
} from './types/payment';
import { 
  loadTransactions, saveTransaction, 
  loadPaymentLinks, savePaymentLink, 
  loadCashfreeSettings, saveCashfreeSettings 
} from './utils/storage';

function AppContent() {
  const { currentUser, isLoggedIn, isLoginModalOpen, closeLoginModal, loginModalInitialMode } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('recharge');
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [settings, setSettings] = useState<CashfreeSettings>(loadCashfreeSettings);

  const [currentOrder, setCurrentOrder] = useState<{
    amount: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    purpose: string;
    isPlayStoreOrder: boolean;
    merchantRef?: string;
  } | null>(null);
  const [isCashfreeOpen, setIsCashfreeOpen] = useState<boolean>(false);

  const [completedTx, setCompletedTx] = useState<TransactionRecord | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState<boolean>(false);
  const [prefillLinkId, setPrefillLinkId] = useState<string | undefined>(undefined);
  const [isFloatingBotOpen, setIsFloatingBotOpen] = useState<boolean>(false);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Load persistent data & listen for cross-component updates
  useEffect(() => {
    const refreshData = () => {
      setTransactions(loadTransactions());
      setPaymentLinks(loadPaymentLinks());
      setSettings(loadCashfreeSettings());
    };

    refreshData();

    window.addEventListener('app_transactions_updated', refreshData);

    // Check query params for ?link=PL_PW_...
    const urlParams = new URLSearchParams(window.location.search);
    const linkParam = urlParams.get('link');
    if (linkParam) {
      setPrefillLinkId(linkParam);
      setActiveTab('collect');
    }

    return () => {
      window.removeEventListener('app_transactions_updated', refreshData);
    };
  }, []);

  const toggleDark = () => {
    setIsDark(prev => !prev);
  };

  const handleInitiatePayment = (orderData: {
    amount: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    purpose: string;
    isPlayStoreOrder: boolean;
    merchantRef?: string;
  }) => {
    // Bind authenticated user identity so every request is genuine and verified
    const verifiedEmail = currentUser?.email || orderData.customerEmail;
    const verifiedName = orderData.customerName || currentUser?.name || 'Verified Member';
    setCurrentOrder({
      ...orderData,
      customerName: verifiedName,
      customerEmail: verifiedEmail,
    });
    setIsCashfreeOpen(true);
  };

  const handlePaymentSuccess = (record: TransactionRecord) => {
    const updated = saveTransaction(record);
    setTransactions(updated);
    setIsCashfreeOpen(false);
    setCompletedTx(record);
    setIsSuccessOpen(true);
  };

  const handleAddPaymentLink = (newLink: PaymentLink) => {
    const updated = savePaymentLink(newLink);
    setPaymentLinks(updated);
  };

  const handleUpdateSettings = (newSettings: CashfreeSettings) => {
    saveCashfreeSettings(newSettings);
    setSettings(newSettings);
  };

  const handleQuickPay = () => {
    handleInitiatePayment({
      amount: 500,
      customerName: currentUser?.name || 'Customer Member',
      customerPhone: '9876543210',
      customerEmail: currentUser?.email || 'customer@playstore.pw',
      purpose: 'PlayStore Express Top-Up (Cashfree Fast Checkout)',
      isPlayStoreOrder: true,
    });
  };

  const handleQuickPayWithLink = (link: PaymentLink) => {
    handleInitiatePayment({
      amount: link.amount || 500,
      customerName: currentUser?.name || 'Customer Member',
      customerPhone: '9876543210',
      customerEmail: currentUser?.email || 'customer@playstore.pw',
      purpose: link.title,
      isPlayStoreOrder: link.title.toLowerCase().includes('play') || link.title.toLowerCase().includes('google'),
      merchantRef: link.id,
    });
  };

  const handleSelectTransactionForReceipt = (tx: TransactionRecord) => {
    setCompletedTx(tx);
    setIsSuccessOpen(true);
  };

  // MANDATORY AUTH GATE: Cannot enter or use website without logging in with Google or Email/Password
  if (!isLoggedIn) {
    return (
      <LoginModal
        isOpen={true}
        isFullPageGate={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-indigo-500 selection:text-white relative">
      
      {/* Heavy animated background gradient meshes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-pink-500/10 dark:bg-pink-500/15 rounded-full blur-3xl animate-float-reverse"></div>
        <div className="absolute -bottom-40 left-1/3 w-[450px] h-[450px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* 3-Zone Top Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDark={isDark}
          toggleDark={toggleDark}
          onOpenQuickPay={handleQuickPay}
          pendingCount={transactions.filter(t => t.status === 'PENDING').length}
        />

        {/* Main Content Area with Animated Transitions */}
        <main className="flex-1">
          
          {/* Dynamic Hero Section */}
          <HeroSection
            onStartRecharge={() => setActiveTab('recharge')}
            onStartCollect={() => setActiveTab('collect')}
            onOpenMerchant={() => setActiveTab('merchant')}
            onStartTargetSmp={() => setActiveTab('targetsmp')}
          />

          <AnimatePresence mode="wait">
            {/* Tab 1: Google Play Store Recharge Cards */}
            {activeTab === 'recharge' && (
              <motion.div
                key="recharge"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <PlayStoreRecharge onInitiatePayment={handleInitiatePayment} />
              </motion.div>
            )}

            {/* Tab 2: Popular Game & Course Pass Top-Ups */}
            {activeTab === 'games' && (
              <motion.div
                key="games"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <GameTopUp onInitiatePayment={handleInitiatePayment} />
              </motion.div>
            )}

            {/* Tab 2.5: TargetSMP Minecraft Server Payments */}
            {activeTab === 'targetsmp' && (
              <motion.div
                key="targetsmp"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <TargetSmpPayment onInitiatePayment={handleInitiatePayment} />
              </motion.div>
            )}

            {/* Tab 3: Collect Payment by Cashfree (Universal Bill / Invoice Collector) */}
            {activeTab === 'collect' && (
              <motion.div
                key="collect"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <CollectPaymentForm
                  onInitiatePayment={handleInitiatePayment}
                  prefillLinkId={prefillLinkId}
                />
              </motion.div>
            )}

            {/* Tab 4: Track Order & Redeem Codes / Payment Requests */}
            {activeTab === 'track' && (
              <motion.div
                key="track"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <TrackPayment
                  transactions={transactions}
                  onSelectTransaction={handleSelectTransactionForReceipt}
                />
              </motion.div>
            )}

            {/* Tab 5: Merchant Dashboard & API Desk */}
            {activeTab === 'merchant' && (
              <motion.div
                key="merchant"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <MerchantDashboard
                  transactions={transactions}
                  paymentLinks={paymentLinks}
                  onAddPaymentLink={handleAddPaymentLink}
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onOpenQuickPayWithLink={handleQuickPayWithLink}
                  onSelectTransaction={handleSelectTransactionForReceipt}
                />
              </motion.div>
            )}

            {/* Tab 6: 24/7 Helpline Support Bot */}
            {activeTab === 'support' && (
              <motion.div
                key="support"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="py-8 px-4 sm:px-6 lg:px-8"
              >
                <HelplineBot transactions={transactions} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security, RBI PA Compliance, and FAQs */}
          <SecurityTrust />

        </main>

        {/* Quiet Corporate Compliant Footer */}
        <Footer onNavClick={(tab) => setActiveTab(tab)} />

        {/* Floating 24/7 Helpline Support Bot Trigger with Animated Bounce */}
        <div className="fixed bottom-6 right-6 z-40">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={() => setIsFloatingBotOpen(prev => !prev)}
            className="px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 transition-all cursor-pointer border border-white/20"
            title="Open 24/7 Helpline Support"
          >
            <Bot className="w-5 h-5 animate-pulse" />
            <span className="hidden sm:inline">24/7 Helpline Bot</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          </motion.button>
        </div>

        {/* Floating Bot Drawer Modal */}
        <AnimatePresence>
          {isFloatingBotOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-2 sm:p-6 bg-slate-950/60 backdrop-blur-xs">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-lg h-[92vh] sm:h-[650px] shadow-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <HelplineBot
                  transactions={transactions}
                  isFloatingModal={true}
                  onClose={() => setIsFloatingBotOpen(false)}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Cashfree Payment Gateway Checkout Modal */}
        <CashfreeModal
          isOpen={isCashfreeOpen}
          onClose={() => setIsCashfreeOpen(false)}
          orderData={currentOrder}
          onSuccess={handlePaymentSuccess}
          soundboxVoice={settings.soundboxVoice}
        />

        {/* Payment Success & Redeem Code Voucher Modal */}
        <OrderSuccessModal
          isOpen={isSuccessOpen}
          transaction={completedTx}
          onClose={() => {
            setIsSuccessOpen(false);
            setCompletedTx(null);
          }}
          onGoToTrack={() => {
            setIsSuccessOpen(false);
            setCompletedTx(null);
            setActiveTab('track');
          }}
          soundboxVoice={settings.soundboxVoice}
        />

        {/* Authentication Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={closeLoginModal}
          initialMode={loginModalInitialMode}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
