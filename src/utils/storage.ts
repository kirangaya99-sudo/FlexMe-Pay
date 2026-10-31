import { TransactionRecord, PaymentLink, CashfreeSettings } from '../types/payment';
import { INITIAL_TRANSACTIONS, INITIAL_PAYMENT_LINKS } from '../data/mockData';

const TX_STORAGE_KEY = 'playstore_pw_transactions_v1';
const LINKS_STORAGE_KEY = 'playstore_pw_payment_links_v1';
const SETTINGS_STORAGE_KEY = 'playstore_pw_cashfree_settings_v1';

export const DEFAULT_SETTINGS: CashfreeSettings = {
  appId: 'TEST10482918bb12ac82',
  secretKey: 'cfsk_ma_test_904128471bce184291',
  environment: 'TEST',
  soundboxEnabled: true,
  soundboxVoice: 'en',
  merchantName: 'PLAYSTORE PAYMENT BY PW',
};

export function loadTransactions(): TransactionRecord[] {
  try {
    const raw = localStorage.getItem(TX_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    const parsed: TransactionRecord[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    // Clean out any old mock/fake pending requests so only real user orders appear
    const cleanList = parsed.filter(t => 
      t.orderId !== 'CF_PW_918204_4190' && 
      t.orderId !== 'CF_PW_904128_7721' &&
      t.customerName !== 'Rohit Verma'
    );
    if (cleanList.length !== parsed.length) {
      localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(cleanList));
    }
    return cleanList;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveTransaction(record: TransactionRecord): TransactionRecord[] {
  const current = loadTransactions();
  // Filter out any duplicate with the same orderId
  const withoutDupe = current.filter(t => t.orderId !== record.orderId);
  const updated = [record, ...withoutDupe];
  try {
    localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('app_transactions_updated'));
  } catch (err) {
    console.error('Failed to save transaction:', err);
  }
  return updated;
}

export function updateTransaction(orderId: string, updates: Partial<TransactionRecord>): TransactionRecord[] {
  const current = loadTransactions();
  const updated = current.map((tx) => {
    if (tx.orderId === orderId) {
      return { ...tx, ...updates };
    }
    return tx;
  });
  try {
    localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('app_transactions_updated'));
  } catch (err) {
    console.error('Failed to update transaction:', err);
  }
  return updated;
}

export function loadPaymentLinks(): PaymentLink[] {
  try {
    const raw = localStorage.getItem(LINKS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(INITIAL_PAYMENT_LINKS));
      return INITIAL_PAYMENT_LINKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYMENT_LINKS;
  }
}

export function savePaymentLink(link: PaymentLink): PaymentLink[] {
  const current = loadPaymentLinks();
  const updated = [link, ...current];
  try {
    localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save payment link:', err);
  }
  return updated;
}

export function loadCashfreeSettings(): CashfreeSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveCashfreeSettings(settings: CashfreeSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function exportTransactionsToCSV(records: TransactionRecord[]): void {
  const headers = ['Order ID', 'Cashfree Ref', 'Date', 'Customer Name', 'Phone', 'Email', 'Amount (INR)', 'Purpose', 'Payment Method', 'Status', 'Redeem Code', 'UTR Number'];
  const rows = records.map(r => [
    r.orderId,
    r.cfPaymentId,
    r.createdAt,
    `"${r.customerName}"`,
    r.customerPhone,
    r.customerEmail,
    r.amount,
    `"${r.purpose}"`,
    r.paymentMethod,
    r.status,
    r.redeemCode || 'N/A',
    r.utrNumber || 'N/A'
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `flexme_pay_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
