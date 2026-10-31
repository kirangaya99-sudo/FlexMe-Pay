export const INSTAGRAM_USERNAME = '@flexme.pay';
export const INSTAGRAM_URL = 'https://instagram.com/flexme.pay';

export interface EmailLog {
  id: string;
  to: string;
  from: string;
  subject: string;
  orderId: string;
  bodyText: string;
  htmlPreview: string;
  sentAt: string;
  type: 'OWNER_ALERT' | 'CUSTOMER_CODE';
  status: 'SENT' | 'PENDING' | 'CLICK_TO_SEND';
  gmailUrl?: string;
  mailtoUrl?: string;
  whatsappUrl?: string;
  instagramUrl?: string;
  instagramUser?: string;
}

const EMAIL_STORAGE_KEY = 'playstore_pw_emails_v1';

export function loadSentEmails(): EmailLog[] {
  try {
    const raw = localStorage.getItem(EMAIL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSentEmail(email: EmailLog): EmailLog[] {
  const current = loadSentEmails();
  const updated = [email, ...current];
  try {
    localStorage.setItem(EMAIL_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('app_emails_updated'));
  } catch (err) {
    console.error('Failed to save email log:', err);
  }
  return updated;
}

export function getOwnerNotificationUrls(data: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  amount: number;
  purpose: string;
  utrNumber: string;
  createdAt: string;
}) {
  const ownerEmail = 'raunakgaya99@gmail.com';
  const subject = `🔔 New Payment Alert: ₹${data.amount} Received from ${data.customerName} - Order #${data.orderId}`;
  
  const bodyText = `Hello Raunak (Owner),

A new customer payment of ₹${data.amount} has been submitted on PlayStore Payment by PW and is waiting for your verification:

- Customer Name: ${data.customerName}
- Customer Mobile: ${data.customerPhone}
- Customer Email: ${data.customerEmail}
- Amount Paid: ₹${data.amount}
- Order ID: ${data.orderId}
- Bank UTR / Transaction Ref: ${data.utrNumber}
- Purpose: ${data.purpose}
- Date & Time: ${data.createdAt}

Please verify the payment in your bank account and dispatch the Google Play redeem code from the Merchant Control Desk.`.trim();

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${ownerEmail}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  const mailtoUrl = `mailto:${ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  
  const waMessage = `🔔 *New Payment Alert for Owner* 🔔\n\n*Amount:* ₹${data.amount}\n*Customer:* ${data.customerName}\n*Phone:* ${data.customerPhone}\n*Email:* ${data.customerEmail}\n*UTR:* ${data.utrNumber}\n*Order ID:* ${data.orderId}\n*Purpose:* ${data.purpose}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`;
  const instagramUrl = INSTAGRAM_URL;
  const instagramUser = INSTAGRAM_USERNAME;

  return { ownerEmail, subject, bodyText, gmailUrl, mailtoUrl, whatsappUrl, instagramUrl, instagramUser };
}

export function getCustomerNotificationUrls(data: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  redeemCode: string;
  otpCode: string;
  adminApprovedAt: string;
}) {
  const subject = `🎉 Payment Verified: Your Google Play Redeem Code is Ready! (Order #${data.orderId})`;
  
  const bodyText = `Dear ${data.customerName},

Your payment of ₹${data.amount} has been verified and confirmed by the Admin!

Your Google Play Store Redeem Code:
>>> ${data.redeemCode} <<<

Redeem Verification Security OTP: ${data.otpCode}

How to Redeem on Google Play:
1. Open Google Play Store on your Android phone.
2. Tap your profile icon -> Payments & subscriptions -> Redeem code.
3. Paste: ${data.redeemCode}
Direct Redeem Link: https://play.google.com/redeem?code=${data.redeemCode}

Verified by Admin (raunakgaya99@gmail.com) at ${data.adminApprovedAt}.
Thank you for using PlayStore Payment by PW!`.trim();

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(data.customerEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  const mailtoUrl = `mailto:${encodeURIComponent(data.customerEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  
  const waMessage = `🎉 *Google Play Redeem Code Generated* 🎉\n\n*Order ID:* ${data.orderId}\n*Amount:* ₹${data.amount}\n*Redeem Code:* ${data.redeemCode}\n*Security OTP:* ${data.otpCode}\n\n*Redeem Link:* https://play.google.com/redeem?code=${data.redeemCode}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`;
  const instagramUrl = INSTAGRAM_URL;
  const instagramUser = INSTAGRAM_USERNAME;

  return { subject, bodyText, gmailUrl, mailtoUrl, whatsappUrl, instagramUrl, instagramUser };
}

// 1. Notify Owner when payment is submitted
export function sendPaymentAlertToOwner(data: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  amount: number;
  purpose: string;
  utrNumber: string;
  createdAt: string;
}): EmailLog {
  const { ownerEmail, subject, bodyText, gmailUrl, mailtoUrl, whatsappUrl, instagramUrl, instagramUser } = getOwnerNotificationUrls(data);

  // Do NOT send automatic silent background emails without explicit user action
  // Instead, prepare the verified direct URLs so the user can send via Gmail/Instagram on click

  const emailLog: EmailLog = {
    id: `EML_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    to: ownerEmail,
    from: 'payments@playstore.pw (Cashfree Gate)',
    subject,
    orderId: data.orderId,
    bodyText,
    htmlPreview: `
      <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #059669; margin-top: 0;">New Payment Received (₹${data.amount})</h2>
        <p>A new customer payment was submitted via Cashfree / UPI and is pending your review.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Order ID:</td><td>${data.orderId}</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Amount:</td><td style="color: #059669; font-weight: bold; font-size: 16px;">₹${data.amount}</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Customer Name:</td><td>${data.customerName}</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Phone Number:</td><td>${data.customerPhone}</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Customer Email:</td><td>${data.customerEmail}</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Submitted UTR:</td><td style="font-family: monospace; font-weight: bold;">${data.utrNumber}</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; font-weight: bold;">Date & Time:</td><td>${data.createdAt}</td></tr>
        </table>
        <p style="color: #64748b; font-size: 12px;">Sent to Admin: ${ownerEmail} · PlayStore Payment by PW</p>
      </div>
    `,
    sentAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    type: 'OWNER_ALERT',
    status: 'SENT',
    gmailUrl,
    mailtoUrl,
    whatsappUrl,
    instagramUrl,
    instagramUser,
  };

  saveSentEmail(emailLog);
  return emailLog;
}

// 2. Notify Customer with the Google Play Redeem Code + OTP when Admin confirms
export function sendVoucherCodeToCustomer(data: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  redeemCode: string;
  adminApprovedAt: string;
}): EmailLog {
  const otpCode = `PW-${Math.floor(100000 + Math.random() * 900000)}`;
  const { subject, bodyText, gmailUrl, mailtoUrl, whatsappUrl, instagramUrl, instagramUser } = getCustomerNotificationUrls({
    ...data,
    otpCode,
  });

  // Direct delivery URLs provided for manual dispatch on button click
  const emailLog: EmailLog = {
    id: `EML_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
    to: data.customerEmail,
    from: 'raunakgaya99@gmail.com (FLEX Admin)',
    subject,
    orderId: data.orderId,
    bodyText,
    htmlPreview: `
      <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 550px;">
        <h2 style="color: #6366f1; margin-top: 0;">FLEX · Payment Verified · Gift Card Ready</h2>
        <p>Hello <strong>${data.customerName}</strong>, your payment of ₹${data.amount} has been approved by FLEX Admin.</p>
        
        <div style="background: #f8fafc; border: 2px dashed #6366f1; border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
          <div style="font-size: 11px; color: #6366f1; font-weight: bold; text-transform: uppercase;">Google Play Redeem Code</div>
          <div style="font-size: 22px; font-weight: 900; font-family: monospace; letter-spacing: 2px; color: #0f172a; margin: 8px 0;">
            ${data.redeemCode}
          </div>
          <div style="font-size: 12px; color: #64748b;">Verification Security OTP: <strong>${otpCode}</strong></div>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <a href="https://play.google.com/redeem?code=${data.redeemCode}" target="_blank" style="background: #059669; color: white; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
            Redeem on Google Play Store
          </a>
        </div>

        <p style="font-size: 12px; color: #64748b; margin-top: 25px;">
          Order ID: ${data.orderId} · Approved at ${data.adminApprovedAt} by FLEX Admin | Instagram: @flexme.pay
        </p>
      </div>
    `,
    sentAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    type: 'CUSTOMER_CODE',
    status: 'CLICK_TO_SEND',
    gmailUrl,
    mailtoUrl,
    whatsappUrl,
    instagramUrl,
    instagramUser,
  };

  saveSentEmail(emailLog);
  return emailLog;
}

export interface ComplaintTicket {
  ticketId: string;
  category: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderId?: string;
  utrNumber?: string;
  amount?: number;
  issueDescription: string;
  urgency: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  createdAt: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
}

export function generateSupportComplaint(data: {
  category: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderId?: string;
  utrNumber?: string;
  amount?: number;
  issueDescription: string;
  urgency?: 'HIGH' | 'CRITICAL' | 'MEDIUM';
}) {
  const ticketId = `TKT-PW-${Math.floor(100000 + Math.random() * 900000)}`;
  const ownerEmail = 'raunakgaya99@gmail.com';
  const createdAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const urgency = data.urgency || 'HIGH';

  const subject = `[FLEX SUPPORT COMPLAINT #${ticketId}] ${data.category} - ${data.customerName}`;
  
  const bodyText = `
=========================================
FLEX PAY · 24/7 HELPLINE SUPPORT TICKET
=========================================
Ticket ID: #${ticketId}
Date & Time: ${createdAt}
Priority: ${urgency}
Status: OPEN (Escalated to FLEX Admin)

[CUSTOMER DETAILS]
- Full Name: ${data.customerName}
- Mobile / Phone: ${data.customerPhone}
- Email: ${data.customerEmail}

[TRANSACTION & PAYMENT RECORD]
- Order ID: ${data.orderId || 'N/A (General Inquiry)'}
- Bank UTR / Ref: ${data.utrNumber || 'N/A'}
- Payment Amount: ${data.amount ? `₹${data.amount}` : 'N/A'}
- Merchant UPI ID: kumar00697@fam

[COMPLAINT CATEGORY & STATEMENT]
- Category: ${data.category}
- Detailed Description:
${data.issueDescription}

[REQUESTED RESOLUTION]
Please review my transaction and resolve this issue as soon as possible.
=========================================
Submitted via FLEX Helpline Support.
Instagram Support: ${INSTAGRAM_USERNAME} (${INSTAGRAM_URL})
Owner & Admin: FLEX Admin (${ownerEmail})
`.trim();

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${ownerEmail}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  const mailtoUrl = `mailto:${ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

  const waMessage = `🚨 *FLEX COMPLAINT TICKET #${ticketId}* 🚨\n\n*Issue:* ${data.category}\n*Customer:* ${data.customerName}\n*Phone:* ${data.customerPhone}\n*Email:* ${data.customerEmail}\n*Order ID:* ${data.orderId || 'N/A'}\n*UTR:* ${data.utrNumber || 'N/A'}\n*Amount:* ${data.amount ? `₹${data.amount}` : 'N/A'}\n\n*Details:* ${data.issueDescription}\n\n_Escalated to FLEX Admin (${ownerEmail}) · Instagram @flexme.pay_`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`;
  const instagramUrl = INSTAGRAM_URL;
  const instagramUser = INSTAGRAM_USERNAME;

  const ticket: ComplaintTicket = {
    ticketId,
    category: data.category,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    orderId: data.orderId,
    utrNumber: data.utrNumber,
    amount: data.amount,
    issueDescription: data.issueDescription,
    urgency,
    createdAt,
    status: 'OPEN',
  };

  return { ticket, subject, bodyText, gmailUrl, mailtoUrl, whatsappUrl, instagramUrl, instagramUser, ownerEmail };
}
