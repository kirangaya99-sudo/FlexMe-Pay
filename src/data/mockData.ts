import { PlayStoreVoucherPack, GameProduct, TransactionRecord } from '../types/payment';

export const PLAYSTORE_PACKS: PlayStoreVoucherPack[] = [
  { id: 'p1', amount: 1, bonusPoints: 1, tagline: 'Quick Test Token' },
  { id: 'p100', amount: 100, bonusPoints: 25, tagline: 'Popular Mini' },
  { id: 'p250', amount: 250, bonusPoints: 60, tagline: 'In-Game Season Pass' },
  { id: 'p500', amount: 500, bonusPoints: 140, popular: true, tagline: 'Most Popular Choice' },
  { id: 'p1000', amount: 1000, bonusPoints: 300, popular: true, tagline: 'Best Value Bundle' },
  { id: 'p4000', amount: 4000, bonusPoints: 1200, popular: true, tagline: 'High Roller Voucher' },
  { id: 'p5000', amount: 5000, bonusPoints: 1800, tagline: 'Mega Creator Pass' },
];

export const POPULAR_GAMES: GameProduct[] = [
  { id: 'freefire', name: 'Free Fire MAX', category: 'Battle Royale', icon: '🔥', minAmount: 80, popular: true, denomination: 'Diamonds' },
  { id: 'bgmi', name: 'BGMI (Battlegrounds)', category: 'Battle Royale', icon: '🎯', minAmount: 75, popular: true, denomination: 'Unknown Cash (UC)' },
  { id: 'roblox', name: 'Roblox', category: 'Sandbox & MMO', icon: '🧱', minAmount: 150, popular: true, denomination: 'Robux' },
  { id: 'minecraft', name: 'Minecraft', category: 'Creative Sandbox', icon: '⛏️', minAmount: 290, popular: false, denomination: 'Minecoins' },
  { id: 'pw_course', name: 'PW Class 9th Batches', category: 'Education & Prep', icon: '📚', minAmount: 4000, popular: true, denomination: 'Class 9th Batch' },
  { id: 'codm', name: 'Call of Duty: Mobile', category: 'Action FPS', icon: '🎖️', minAmount: 80, popular: false, denomination: 'CP Points' },
  { id: 'brawl', name: 'Brawl Stars', category: 'Multiplayer Arena', icon: '⭐', minAmount: 199, popular: false, denomination: 'Gems' },
  { id: 'genshin', name: 'Genshin Impact', category: 'Action RPG', icon: '✨', minAmount: 299, popular: false, denomination: 'Genesis Crystals' },
];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    orderId: 'CF_PW_884920_7194',
    cfPaymentId: 'CF_PAY_89214710',
    customerName: 'Raunak Kumar',
    customerPhone: '+91 98765 43210',
    customerEmail: 'customer1@flexme.internal',
    amount: 500,
    purpose: 'Google Play Gift Card ₹500',
    paymentMethod: 'UPI_INTENT',
    status: 'SUCCESS',
    createdAt: '2026-10-30 18:22:15',
    redeemCode: 'GPLY-7KA9-2MX4-Q8NP',
    isPlayStoreOrder: true,
  },
  {
    orderId: 'CF_PW_884112_3021',
    cfPaymentId: 'CF_PAY_77341901',
    customerName: 'Aman Sharma',
    customerPhone: '+91 91234 56789',
    customerEmail: 'customer2@flexme.internal',
    amount: 1000,
    purpose: 'PW Saarthi & PlayStore Voucher',
    paymentMethod: 'UPI_QR',
    status: 'SUCCESS',
    createdAt: '2026-10-30 16:45:00',
    redeemCode: 'GPLY-9P2Z-54RL-18MC',
    isPlayStoreOrder: true,
  },
  {
    orderId: 'CF_PW_883091_4412',
    cfPaymentId: 'CF_PAY_66190842',
    customerName: 'Vikram Singh',
    customerPhone: '+91 99887 76655',
    customerEmail: 'customer3@flexme.internal',
    amount: 250,
    purpose: 'BGMI UC Pass & Play Recharge',
    paymentMethod: 'CARD',
    status: 'SUCCESS',
    createdAt: '2026-10-30 14:10:30',
    redeemCode: 'GPLY-3B7X-99VT-2KJH',
    isPlayStoreOrder: true,
  },
  {
    orderId: 'CF_PW_881902_1290',
    cfPaymentId: 'CF_PAY_55481230',
    customerName: 'Sneha Patel',
    customerPhone: '+91 97654 32109',
    customerEmail: 'customer4@flexme.internal',
    amount: 1500,
    purpose: 'Custom Merchant Invoice #INV-2026-09',
    paymentMethod: 'NETBANKING',
    status: 'SUCCESS',
    createdAt: '2026-10-29 19:30:10',
    isPlayStoreOrder: false,
    merchantRef: 'INV-2026-09',
  }
];

export const INITIAL_PAYMENT_LINKS = [
  {
    id: 'PL_PW_901',
    title: 'Play Store Redeem Code ₹500',
    amount: 500,
    description: 'Instant Google Play Gift Card with Cashfree Fast UPI',
    status: 'ACTIVE' as const,
    createdAt: '2026-10-30 10:00:00',
    collectedAmount: 2500,
  },
  {
    id: 'PL_PW_902',
    title: 'PW Online Course Pass & Play Credits',
    amount: 1000,
    description: 'Physics Wallah Digital Pass + Play Store Bonus',
    status: 'ACTIVE' as const,
    createdAt: '2026-10-29 14:20:00',
    collectedAmount: 7000,
  },
  {
    id: 'PL_PW_903',
    title: 'Open Amount Payment Collector',
    amount: null,
    description: 'Allow customer to enter custom amount via Cashfree Gateway',
    status: 'ACTIVE' as const,
    createdAt: '2026-10-28 09:15:00',
    collectedAmount: 14250,
  }
];
