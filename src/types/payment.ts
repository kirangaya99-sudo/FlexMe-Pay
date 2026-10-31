export type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'REJECTED';

export type PaymentMethodType = 'UPI_INTENT' | 'UPI_QR' | 'CARD' | 'NETBANKING' | 'WALLET';

export interface PlayStoreVoucherPack {
  id: string;
  amount: number;
  bonusPoints: number;
  popular?: boolean;
  tagline: string;
}

export interface GameProduct {
  id: string;
  name: string;
  category: string;
  icon: string;
  minAmount: number;
  popular: boolean;
  denomination: string;
}

export interface TransactionRecord {
  orderId: string;
  cfPaymentId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  amount: number;
  purpose: string;
  paymentMethod: PaymentMethodType;
  status: PaymentStatus;
  createdAt: string;
  redeemCode?: string;
  isPlayStoreOrder: boolean;
  merchantRef?: string;
  utrNumber?: string;
  adminApprovedAt?: string;
  adminApprovedBy?: string;
  rejectionReason?: string;
}

export interface PaymentLink {
  id: string;
  title: string;
  amount: number | null; // null if customer can enter custom
  description: string;
  customerPhone?: string;
  status: 'ACTIVE' | 'PAID' | 'EXPIRED';
  createdAt: string;
  collectedAmount?: number;
}

export interface CashfreeSettings {
  appId: string;
  secretKey: string;
  environment: 'TEST' | 'PRODUCTION';
  soundboxEnabled: boolean;
  soundboxVoice: 'en' | 'hi';
  merchantName: string;
}
