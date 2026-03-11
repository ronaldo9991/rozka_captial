import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';

// Email configuration from environment variables
// Mailgun SMTP Configuration
const SMTP_CONFIG = {
  host: process.env.SMTP_SERVER || 'smtp.eu.mailgun.org',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // Mailgun uses STARTTLS on port 587
  auth: {
    user: process.env.SMTP_LOGIN || 'accounts@mg.rozkacapitals.com',
    pass: process.env.SMTP_PASSWORD || '',
  },
  // Mailgun specific settings
  tls: {
    rejectUnauthorized: false, // Mailgun uses self-signed certificates
  },
};

const FROM_EMAIL = process.env.SMTP_FROM || 'accounts@mg.rozkacapitals.com';
const FROM_NAME = process.env.SMTP_FROM_NAME || 'Rozka Capitals';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://rozkacapitals.com';

// Load logo as base64 for embedding in emails
let LOGO_BASE64: string | null = null;
function getLogoBase64(): string {
  if (!LOGO_BASE64) {
    try {
      // Use ROZKA.png from root directory
      const logoPath = join(process.cwd(), 'ROZKA.png');
      const logoBuffer = readFileSync(logoPath);
      LOGO_BASE64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Failed to load logo for email:', error);
      // Fallback to URL if file not found
      LOGO_BASE64 = `${FRONTEND_URL}/ROZKA.png`;
    }
  }
  return LOGO_BASE64;
}

// Create reusable transporter
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport(SMTP_CONFIG);
  }
  return transporter;
}

// Check if email is configured
export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_LOGIN && process.env.SMTP_PASSWORD);
}

// ULTRA-MINIMAL base template - NO LOGO, EXACT FRONTEND COLORS, NO CLIPPING
function getBaseTemplate(content: string, preheader: string = ''): string {
  const whatsappLink = `https://wa.me/971547199005?text=${encodeURIComponent('Hi, I need help with Rozka Capitals Trading')}`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rozka Capitals</title></head><body style="margin:0;padding:0;background:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${preheader}</div><table role="presentation" style="width:100%;border-collapse:collapse;background:#000000"><tr><td align="center" style="padding:8px"><table role="presentation" style="width:100%;max-width:520px;border-collapse:collapse;margin:0 auto;background:#111111;border-radius:4px;border:1px solid #2B2B2B"><tr><td style="padding:16px;text-align:center;background:#000000;border-bottom:1px solid #D4AF37"><h1 style="margin:0;font-size:20px;font-weight:700;color:#D4AF37;letter-spacing:1.5px;text-transform:uppercase">R.O.Z.K.A CAPTIAL</h1></td></tr><tr><td style="padding:18px 16px;background:#111111">${content}</td></tr><tr><td style="padding:12px 16px;background:#000000;border-top:1px solid #2B2B2B;border-radius:0 0 4px 4px;text-align:center"><p style="margin:0 0 8px;font-size:12px;color:#F5F5F5;font-weight:600">💬 Need Help?</p><a href="${whatsappLink}" style="display:inline-block;padding:8px 20px;background:#25D366;color:#fff;text-decoration:none;border-radius:4px;font-weight:600;font-size:12px;margin-bottom:10px">💬 WhatsApp</a><p style="margin:10px 0 2px;font-size:9px;color:#2B2B2B">© ${new Date().getFullYear()} Rozka Capitals</p><p style="margin:0;font-size:8px;color:#2B2B2B"><a href="${FRONTEND_URL}" style="color:#D4AF37;text-decoration:none">Website</a> • <a href="${FRONTEND_URL}/dashboard" style="color:#D4AF37;text-decoration:none">Dashboard</a></p></td></tr></table></td></tr></table></body></html>`;
}

// Ultra compact base template for password reset emails - EXACT FRONTEND COLORS
function getCompactBaseTemplate(content: string, preheader: string = ''): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reset Password</title></head><body style="margin:0;padding:0;background:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"><div style="display:none;max-height:0;overflow:hidden">${preheader}</div><table role="presentation" style="width:100%;border-collapse:collapse;background:#000000"><tr><td align="center" style="padding:10px"><table role="presentation" style="width:100%;max-width:500px;border-collapse:collapse;margin:0 auto;background:#111111;border-radius:6px;border:1px solid #2B2B2B"><tr><td style="padding:15px;text-align:center;border-bottom:1px solid #D4AF37;background:#000000"><h1 style="margin:0;font-size:20px;color:#D4AF37;font-weight:700;letter-spacing:2px;text-transform:uppercase">R.O.Z.K.A CAPTIAL</h1></td></tr><tr><td style="padding:20px 15px;background:#111111">${content}</td></tr><tr><td style="padding:10px 15px;text-align:center;border-top:1px solid #2B2B2B;background:#000000;border-radius:0 0 6px 6px"><p style="margin:0;font-size:9px;color:#2B2B2B">© ${new Date().getFullYear()} Rozka Capitals</p></td></tr></table></td></tr></table></body></html>`;
}

// Helper function to create styled buttons - OPTIMIZED
function createButton(text: string, url: string, primary: boolean = true): string {
  const bgStyle = primary 
    ? 'background:#D4AF37;color:#000000;'
    : 'background:transparent;color:#D4AF37;border:2px solid #D4AF37;';
  
  return `<a href="${url}" style="display:inline-block;padding:11px 24px;${bgStyle}text-decoration:none;border-radius:4px;font-weight:600;font-size:13px;margin:4px">${text}</a>`;
}

// Helper function to create info boxes - OPTIMIZED
function createInfoBox(label: string, value: string, highlight: boolean = false): string {
  return `<div style="background:${highlight ? 'rgba(212,175,55,0.08)' : '#000000'};border:1px solid ${highlight ? '#D4AF37' : '#2B2B2B'};border-radius:4px;padding:10px;margin:8px 0"><p style="margin:0 0 4px;font-size:11px;color:#2B2B2B;text-transform:uppercase;letter-spacing:0.5px">${label}</p><p style="margin:0;font-size:14px;color:${highlight ? '#D4AF37' : '#F5F5F5'};font-weight:600">${value}</p></div>`;
}

// ============================================
// EMAIL TEMPLATES
// ============================================

// 1. Welcome Email - OPTIMIZED SPACING & SIZING, NO CLIPPING
export function getWelcomeEmailContent(userName: string, referralId: string): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#F5F5F5;line-height:1.2">Welcome, ${userName}!</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Your Trading Journey Begins</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Your account has been created. You're part of an elite trading community.</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0"><h3 style="margin:0 0 10px;font-size:14px;color:#D4AF37;font-weight:600;text-align:center">Quick Start</h3><div style="display:block"><div style="display:flex;align-items:start;gap:10px;padding:10px 8px;background:#000000;border-radius:3px;border-left:2px solid #D4AF37;margin-bottom:10px"><span style="font-size:16px;color:#D4AF37;flex-shrink:0;font-weight:700;width:20px">1</span><div style="flex:1"><p style="margin:0;font-size:13px;color:#F5F5F5;font-weight:500;line-height:1.3">Upload ID proof</p><p style="margin:3px 0 0;font-size:11px;color:#2B2B2B;line-height:1.2">Secure processing</p></div></div><div style="display:flex;align-items:start;gap:10px;padding:10px 8px;background:#000000;border-radius:3px;border-left:2px solid #D4AF37;margin-bottom:10px"><span style="font-size:16px;color:#D4AF37;flex-shrink:0;font-weight:700;width:20px">2</span><div style="flex:1"><p style="margin:0;font-size:13px;color:#F5F5F5;font-weight:500;line-height:1.3">Processed in 24-48h</p><p style="margin:3px 0 0;font-size:11px;color:#2B2B2B;line-height:1.2">Auto verification</p></div></div><div style="display:flex;align-items:start;gap:10px;padding:10px 8px;background:#000000;border-radius:3px;border-left:2px solid #D4AF37;margin-bottom:10px"><span style="font-size:16px;color:#D4AF37;flex-shrink:0;font-weight:700;width:20px">3</span><div style="flex:1"><p style="margin:0;font-size:13px;color:#F5F5F5;font-weight:500;line-height:1.3">Create trading account</p><p style="margin:3px 0 0;font-size:11px;color:#2B2B2B;line-height:1.2">Multiple types</p></div></div><div style="display:flex;align-items:start;gap:10px;padding:10px 8px;background:#000000;border-radius:3px;border-left:2px solid #D4AF37"><span style="font-size:16px;color:#D4AF37;flex-shrink:0;font-weight:700;width:20px">4</span><div style="flex:1"><p style="margin:0;font-size:13px;color:#F5F5F5;font-weight:500;line-height:1.3">Deposit and trade</p><p style="margin:3px 0 0;font-size:11px;color:#2B2B2B;line-height:1.2">Multiple methods</p></div></div></div></div><div style="text-align:center;margin:16px 0 0"><a href="${FRONTEND_URL}/signin" style="display:inline-block;padding:11px 24px;background:#D4AF37;color:#000000;text-decoration:none;border-radius:4px;font-weight:600;font-size:13px">Launch Dashboard</a></div>`;

  return {
    subject: `🚀 Welcome to Rozka Capitals, ${userName}!`,
    html: getBaseTemplate(content, `Welcome to Rozka Capitals!`),
  };
}

// 2. Email Verification - OPTIMIZED
export function getVerificationEmailContent(userName: string, verificationLink: string): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#F5F5F5;line-height:1.2">Verify Your Email</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Complete Your Registration</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Hi ${userName}, please verify your email address to complete your registration.</p><div style="text-align:center;margin:16px 0"><a href="${verificationLink}" style="display:inline-block;padding:11px 24px;background:#D4AF37;color:#000000;text-decoration:none;border-radius:4px;font-weight:600;font-size:13px">Verify Email</a></div><p style="margin:12px 0;font-size:11px;color:#2B2B2B;text-align:center">This link will expire in 24 hours.</p><div style="background:#000000;border:1px solid #2B2B2B;border-radius:4px;padding:10px;margin:12px 0;text-align:center"><p style="margin:0;font-size:10px;color:#D4AF37;word-break:break-all"><a href="${verificationLink}" style="color:#D4AF37;text-decoration:underline">${verificationLink}</a></p></div>`;

  return {
    subject: 'Verify Your Rozka Capitals Account',
    html: getBaseTemplate(content, 'Please verify your email address to complete registration.'),
  };
}

// 3. Password Reset - OPTIMIZED
export function getPasswordResetEmailContent(userName: string, resetLink: string): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin:0 0 12px"><a href="${resetLink}" style="display:inline-block;padding:11px 24px;background:#D4AF37;color:#000000;text-decoration:none;border-radius:4px;font-weight:600;font-size:13px">Reset Password</a></div><p style="margin:0 0 10px;font-size:13px;color:#F5F5F5;text-align:center;line-height:1.4">Hi ${userName}, click above to reset. Expires in 1 hour.</p><div style="background:#000000;border:1px solid #2B2B2B;border-radius:4px;padding:10px;margin:10px 0;text-align:center"><p style="margin:0;font-size:10px;color:#D4AF37;word-break:break-all"><a href="${resetLink}" style="color:#D4AF37;text-decoration:underline">${resetLink}</a></p></div><p style="margin:10px 0 0;font-size:11px;color:#EF4444;text-align:center">Didn't request this? Ignore this email.</p>`;

  return {
    subject: 'Reset Your Rozka Capitals Password',
    html: getCompactBaseTemplate(content, 'Reset password. Expires in 1 hour.'),
  };
}

// 4. Deposit Confirmation - OPTIMIZED
export function getDepositConfirmationEmailContent(
  userName: string,
  amount: string,
  method: string,
  accountId: string,
  transactionId: string
): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><div style="width:50px;height:50px;background:rgba(34,197,94,0.15);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">✅</span></div><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#22c55e;line-height:1.2">Deposit Successful!</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Funds Added to Account</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Hi ${userName}, your deposit has been processed successfully.</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0">${createInfoBox('Amount Deposited', `$${amount}`, true)}${createInfoBox('Payment Method', method)}${createInfoBox('Trading Account', accountId)}${createInfoBox('Transaction ID', transactionId)}${createInfoBox('Date', new Date().toLocaleDateString('en-US', { dateStyle: 'short' }))}</div><div style="text-align:center;margin:16px 0">${createButton('View Account', `${FRONTEND_URL}/dashboard/accounts`)}</div><p style="margin:12px 0 0;font-size:11px;color:#2B2B2B;text-align:center">Your funds are now available for trading. Good luck! 🚀</p>`;

  return {
    subject: `Deposit Confirmed: $${amount} Added to Your Account`,
    html: getBaseTemplate(content, `Your deposit of $${amount} has been processed successfully.`),
  };
}

// 5. Deposit Pending - OPTIMIZED
export function getDepositPendingEmailContent(
  userName: string,
  amount: string,
  method: string
): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><div style="width:50px;height:50px;background:rgba(212,175,55,0.15);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">⏳</span></div><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#D4AF37;line-height:1.2">Deposit Request Received</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Processing in Progress</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Hi ${userName}, we've received your deposit request and it's being processed.</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0">${createInfoBox('Amount', `$${amount}`, true)}${createInfoBox('Payment Method', method)}${createInfoBox('Status', 'Pending')}</div><div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.3);border-radius:4px;padding:12px;margin:16px 0"><p style="margin:0;font-size:12px;color:#D4AF37;line-height:1.4">💡 Processing typically takes 1-24 hours. You'll receive a confirmation email once complete.</p></div><div style="text-align:center;margin:16px 0">${createButton('View Deposit Status', `${FRONTEND_URL}/dashboard/history`)}</div>`;

  return {
    subject: `Deposit Request: $${amount} Being Processed`,
    html: getBaseTemplate(content, `Your deposit request for $${amount} is being processed.`),
  };
}

// 6. Withdrawal Request - OPTIMIZED
export function getWithdrawalRequestEmailContent(
  userName: string,
  amount: string,
  method: string,
  accountId: string
): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><div style="width:50px;height:50px;background:rgba(59,130,246,0.15);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">📤</span></div><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#3b82f6;line-height:1.2">Withdrawal Request Submitted</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Processing in Progress</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Hi ${userName}, your withdrawal request has been submitted for processing.</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0">${createInfoBox('Withdrawal Amount', `$${amount}`, true)}${createInfoBox('From Account', accountId)}${createInfoBox('Withdrawal Method', method)}${createInfoBox('Status', 'Pending Review')}</div><div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.3);border-radius:4px;padding:12px;margin:16px 0"><p style="margin:0;font-size:12px;color:#3b82f6;line-height:1.4">ℹ️ Withdrawals are typically processed within 1-3 business days. You'll receive a confirmation email once processed.</p></div><div style="text-align:center;margin:16px 0">${createButton('Track Withdrawal', `${FRONTEND_URL}/dashboard/history`)}</div>`;

  return {
    subject: `Withdrawal Request: $${amount}`,
    html: getBaseTemplate(content, `Your withdrawal request for $${amount} has been submitted.`),
  };
}

// 7. Withdrawal Approved - OPTIMIZED
export function getWithdrawalApprovedEmailContent(
  userName: string,
  amount: string,
  method: string
): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><div style="width:50px;height:50px;background:rgba(34,197,94,0.15);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">✅</span></div><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#22c55e;line-height:1.2">Withdrawal Approved!</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Processing in Progress</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Great news, ${userName}! Your withdrawal has been approved and is being processed.</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0">${createInfoBox('Amount', `$${amount}`, true)}${createInfoBox('Method', method)}${createInfoBox('Status', 'Approved - Processing')}</div><p style="margin:12px 0;font-size:11px;color:#2B2B2B;text-align:center">Funds will arrive in your ${method} account within 1-5 business days.</p><div style="text-align:center;margin:16px 0">${createButton('View History', `${FRONTEND_URL}/dashboard/history`)}</div>`;

  return {
    subject: `Withdrawal Approved: $${amount}`,
    html: getBaseTemplate(content, `Your withdrawal of $${amount} has been approved!`),
  };
}

// 8. Withdrawal Rejected - OPTIMIZED
export function getWithdrawalRejectedEmailContent(
  userName: string,
  amount: string,
  reason: string
): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><div style="width:50px;height:50px;background:rgba(239,68,68,0.15);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">❌</span></div><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#ef4444;line-height:1.2">Withdrawal Request Declined</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Action Required</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Hi ${userName}, unfortunately your withdrawal request could not be processed.</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0">${createInfoBox('Requested Amount', `$${amount}`)}${createInfoBox('Status', 'Rejected')}</div><div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:4px;padding:12px;margin:16px 0"><p style="margin:0 0 6px;font-size:11px;color:#ef4444;text-transform:uppercase;letter-spacing:0.5px">Reason</p><p style="margin:0;font-size:12px;color:#F5F5F5;line-height:1.4">${reason}</p></div><p style="margin:12px 0;font-size:11px;color:#2B2B2B;text-align:center">If you believe this was an error, please contact our support team.</p><div style="text-align:center;margin:16px 0">${createButton('Contact Support', `${FRONTEND_URL}/dashboard/support`)}</div>`;

  return {
    subject: `Withdrawal Request Declined: $${amount}`,
    html: getBaseTemplate(content, `Your withdrawal request for $${amount} was declined.`),
  };
}

// 9. Document Verification - Uploaded - OPTIMIZED
export function getDocumentUploadedEmailContent(
  userName: string,
  documentType: string
): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><div style="width:50px;height:50px;background:rgba(212,175,55,0.15);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">📄</span></div><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#D4AF37;line-height:1.2">Document Uploaded Successfully</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Pending Verification</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Hi ${userName}, we've received your ${documentType}. We will process it within 24-48 hours.</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0">${createInfoBox('Document Type', documentType, true)}${createInfoBox('Status', 'Pending Verification')}${createInfoBox('Estimated Time', '24-48 hours')}</div><div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.3);border-radius:4px;padding:12px;margin:16px 0"><p style="margin:0;font-size:12px;color:#D4AF37;line-height:1.4">💡 Our compliance team will review your document and notify you once verified. Processing typically takes 24-48 hours.</p></div>`;

  return {
    subject: `Document Uploaded: ${documentType}`,
    html: getBaseTemplate(content, `Your ${documentType} has been uploaded and is pending verification.`),
  };
}

// 10. Document Verified - OPTIMIZED
export function getDocumentVerifiedEmailContent(
  userName: string,
  documentType: string,
  isFullyVerified: boolean
): { subject: string; html: string } {
  const verifiedMsg = isFullyVerified 
    ? `Congratulations ${userName}! Your account is now fully verified. You have full access to all trading features.`
    : `Hi ${userName}, your ${documentType} has been successfully verified.`;
  const title = isFullyVerified ? 'Verification Complete!' : 'Document Verified!';
  const content = `<div style="text-align:center;margin-bottom:16px"><div style="width:50px;height:50px;background:rgba(34,197,94,0.15);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">✅</span></div><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#22c55e;line-height:1.2">${title}</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Account Verified</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">${verifiedMsg}</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0">${createInfoBox('Document', documentType, true)}${createInfoBox('Status', '✅ Verified')}${isFullyVerified ? createInfoBox('Account Status', '🎉 Fully Verified', true) : ''}</div>${isFullyVerified ? `<div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.3);border-radius:4px;padding:12px;margin:16px 0"><p style="margin:0;font-size:12px;color:#22c55e;line-height:1.4">🎉 You now have full access to all features including deposits, withdrawals, and trading!</p></div>` : ''}<div style="text-align:center;margin:16px 0">${createButton('Go to Dashboard', `${FRONTEND_URL}/dashboard`)}</div>`;

  return {
    subject: isFullyVerified ? '🎉 Your Account is Fully Verified!' : `Document Verified: ${documentType}`,
    html: getBaseTemplate(content, isFullyVerified 
      ? 'Your account is now fully verified!' 
      : `Your ${documentType} has been verified.`),
  };
}

// 11. Document Rejected - OPTIMIZED
export function getDocumentRejectedEmailContent(
  userName: string,
  documentType: string,
  reason: string
): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><div style="width:50px;height:50px;background:rgba(239,68,68,0.15);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">❌</span></div><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#ef4444;line-height:1.2">Document Verification Failed</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Action Required</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Hi ${userName}, unfortunately your ${documentType} could not be verified.</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0">${createInfoBox('Document Type', documentType)}${createInfoBox('Status', 'Rejected')}</div><div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:4px;padding:12px;margin:16px 0"><p style="margin:0 0 6px;font-size:11px;color:#ef4444;text-transform:uppercase;letter-spacing:0.5px">Rejection Reason</p><p style="margin:0;font-size:12px;color:#F5F5F5;line-height:1.4">${reason}</p></div><div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.3);border-radius:4px;padding:12px;margin:16px 0"><p style="margin:0;font-size:12px;color:#D4AF37;line-height:1.4">💡 Please upload a new document that addresses the issue mentioned above.</p></div><div style="text-align:center;margin:16px 0">${createButton('Upload New Document', `${FRONTEND_URL}/dashboard/documents`)}</div>`;

  return {
    subject: `Action Required: ${documentType} Rejected`,
    html: getBaseTemplate(content, `Your ${documentType} was rejected. Please upload a new document.`),
  };
}

// 12. Support Ticket Created - OPTIMIZED
export function getSupportTicketCreatedEmailContent(
  userName: string,
  ticketId: string,
  subject: string,
  category: string
): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><div style="width:50px;height:50px;background:rgba(99,102,241,0.15);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">🎫</span></div><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#6366f1;line-height:1.2">Support Ticket Created</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">We'll Respond Shortly</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Hi ${userName}, your support ticket has been created. Our team will respond shortly.</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0">${createInfoBox('Ticket ID', `#${ticketId.slice(0, 8).toUpperCase()}`, true)}${createInfoBox('Subject', subject)}${createInfoBox('Category', category || 'General')}${createInfoBox('Status', 'Open')}</div><div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.3);border-radius:4px;padding:12px;margin:16px 0"><p style="margin:0;font-size:12px;color:#6366f1;line-height:1.4">ℹ️ Average response time: 2-4 hours during business hours.</p></div><div style="text-align:center;margin:16px 0">${createButton('View Ticket', `${FRONTEND_URL}/dashboard/support`)}</div>`;

  return {
    subject: `Support Ticket Created: ${subject}`,
    html: getBaseTemplate(content, `Your support ticket has been created. Ticket ID: ${ticketId.slice(0, 8).toUpperCase()}`),
  };
}

// 13. Support Ticket Reply - OPTIMIZED
export function getSupportTicketReplyEmailContent(
  userName: string,
  ticketId: string,
  ticketSubject: string,
  replyMessage: string,
  isFromAdmin: boolean
): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><div style="width:50px;height:50px;background:rgba(212,175,55,0.15);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">💬</span></div><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#D4AF37;line-height:1.2">New Reply on Your Ticket</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Update Available</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Hi ${userName}, ${isFromAdmin ? 'our support team has' : 'there has been a'} replied to your support ticket.</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0">${createInfoBox('Ticket ID', `#${ticketId.slice(0, 8).toUpperCase()}`)}${createInfoBox('Subject', ticketSubject)}</div><div style="background:rgba(212,175,55,0.08);border-left:3px solid #D4AF37;padding:12px;margin:16px 0"><p style="margin:0 0 8px;font-size:11px;color:#2B2B2B;text-transform:uppercase">${isFromAdmin ? 'Support Team' : 'You'} wrote:</p><p style="margin:0;font-size:12px;color:#F5F5F5;line-height:1.4">${replyMessage.substring(0, 400)}${replyMessage.length > 400 ? '...' : ''}</p></div><div style="text-align:center;margin:16px 0">${createButton('View Full Conversation', `${FRONTEND_URL}/dashboard/support`)}</div>`;

  return {
    subject: `Re: ${ticketSubject} [Ticket #${ticketId.slice(0, 8).toUpperCase()}]`,
    html: getBaseTemplate(content, `New reply on your support ticket: ${ticketSubject}`),
  };
}

// 14. Support Ticket Resolved - OPTIMIZED
export function getSupportTicketResolvedEmailContent(
  userName: string,
  ticketId: string,
  ticketSubject: string
): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><div style="width:50px;height:50px;background:rgba(34,197,94,0.15);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">✅</span></div><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#22c55e;line-height:1.2">Ticket Resolved</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Issue Resolved</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Hi ${userName}, your support ticket has been marked as resolved.</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0">${createInfoBox('Ticket ID', `#${ticketId.slice(0, 8).toUpperCase()}`)}${createInfoBox('Subject', ticketSubject)}${createInfoBox('Status', '✅ Resolved')}</div><p style="margin:12px 0;font-size:11px;color:#2B2B2B;text-align:center">If you have any additional questions, feel free to open a new ticket.</p><div style="text-align:center;margin:16px 0">${createButton('Open New Ticket', `${FRONTEND_URL}/dashboard/support`)}</div>`;

  return {
    subject: `Ticket Resolved: ${ticketSubject}`,
    html: getBaseTemplate(content, `Your support ticket has been resolved.`),
  };
}

// 15. IB Commission Earned
export function getIBCommissionEmailContent(
  userName: string,
  commission: string,
  referralName: string,
  transactionType: string,
  transactionAmount: string
): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><div style="width:50px;height:50px;background:rgba(212,175,55,0.15);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">💰</span></div><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#D4AF37;line-height:1.2">Commission Earned!</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Earnings Update</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Congratulations ${userName}! You've earned a commission from your referral's activity.</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0">${createInfoBox('Commission Earned', `$${commission}`, true)}${createInfoBox('From Referral', referralName)}${createInfoBox('Transaction Type', transactionType)}${createInfoBox('Transaction Amount', `$${transactionAmount}`)}</div><div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.3);border-radius:4px;padding:12px;margin:16px 0"><p style="margin:0;font-size:12px;color:#D4AF37;line-height:1.4">💡 Keep growing your network to earn more commissions!</p></div><div style="text-align:center;margin:16px 0">${createButton('View IB Dashboard', `${FRONTEND_URL}/dashboard/ib-account`)}</div>`;

  return {
    subject: `Commission Earned: $${commission}`,
    html: getBaseTemplate(content, `You've earned $${commission} commission from ${referralName}'s ${transactionType}.`),
  };
}

// 16. IB Payout - OPTIMIZED
export function getIBPayoutEmailContent(
  userName: string,
  amount: string,
  notes: string = ''
): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><div style="width:50px;height:50px;background:rgba(34,197,94,0.15);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">🎉</span></div><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#22c55e;line-height:1.2">IB Payout Sent!</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Payment Processed</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Great news ${userName}! Your IB commission payout has been processed.</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0">${createInfoBox('Payout Amount', `$${amount}`, true)}${createInfoBox('Status', 'Processed')}${createInfoBox('Date', new Date().toLocaleDateString('en-US', { dateStyle: 'short' }))}</div>${notes ? `<div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.3);border-radius:4px;padding:12px;margin:16px 0"><p style="margin:0 0 6px;font-size:11px;color:#D4AF37;text-transform:uppercase;letter-spacing:0.5px">Note</p><p style="margin:0;font-size:12px;color:#F5F5F5;line-height:1.4">${notes}</p></div>` : ''}<div style="text-align:center;margin:16px 0">${createButton('View IB Dashboard', `${FRONTEND_URL}/dashboard/ib-account`)}</div>`;

  return {
    subject: `IB Payout: $${amount} Sent!`,
    html: getBaseTemplate(content, `Your IB payout of $${amount} has been processed.`),
  };
}

// 17. Trading Account Created - OPTIMIZED
export function getTradingAccountCreatedEmailContent(
  userName: string,
  accountId: string,
  accountType: string,
  leverage: string
): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><div style="width:50px;height:50px;background:rgba(34,197,94,0.15);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">📊</span></div><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#22c55e;line-height:1.2">Trading Account Created!</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Ready to Trade</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Hi ${userName}, your new trading account has been created successfully.</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0">${createInfoBox('Account ID', accountId, true)}${createInfoBox('Account Type', accountType)}${createInfoBox('Leverage', leverage)}${createInfoBox('Status', 'Active')}</div><div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.3);border-radius:4px;padding:12px;margin:16px 0"><p style="margin:0;font-size:12px;color:#D4AF37;line-height:1.4">💡 Don't forget to make a deposit before you start trading!</p></div><div style="text-align:center;margin:16px 0">${createButton('View Account', `${FRONTEND_URL}/dashboard/accounts`)}</div>`;

  return {
    subject: `Trading Account Created: ${accountId}`,
    html: getBaseTemplate(content, `Your new ${accountType} trading account has been created.`),
  };
}

// 18. Security Alert - New Login - OPTIMIZED
export function getSecurityAlertEmailContent(
  userName: string,
  ipAddress: string,
  device: string,
  location: string
): { subject: string; html: string } {
  const content = `<div style="text-align:center;margin-bottom:16px"><div style="width:50px;height:50px;background:rgba(249,115,22,0.15);border-radius:50%;margin:0 auto 10px;display:flex;align-items:center;justify-content:center"><span style="font-size:28px">🔐</span></div><h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#f97316;line-height:1.2">New Login Detected</h2><p style="margin:0;font-size:13px;color:#D4AF37;font-weight:500">Security Alert</p></div><p style="margin:0 0 16px;font-size:13px;color:#F5F5F5;line-height:1.4;text-align:center">Hi ${userName}, we detected a new login to your account.</p><div style="background:rgba(212,175,55,0.06);border:1px solid rgba(212,175,55,0.25);border-radius:4px;padding:14px;margin:16px 0">${createInfoBox('Time', new Date().toLocaleString())}${createInfoBox('IP Address', ipAddress)}${createInfoBox('Device', device)}${createInfoBox('Location', location)}</div><div style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.3);border-radius:4px;padding:12px;margin:16px 0"><p style="margin:0;font-size:12px;color:#f97316;line-height:1.4">⚠️ If this wasn't you, please change your password immediately and contact support.</p></div><div style="text-align:center;margin:16px 0">${createButton('Secure My Account', `${FRONTEND_URL}/dashboard/profile`)}</div>`;

  return {
    subject: '⚠️ New Login to Your Rozka Capitals Account',
    html: getBaseTemplate(content, 'A new login was detected on your account.'),
  };
}

// ============================================
// MAIN SEND FUNCTION
// ============================================

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    console.log('📧 Email not configured - skipping email to:', to);
    console.log('   Subject:', subject);
    return { success: false, error: 'Email not configured' };
  }

  try {
    const info = await getTransporter().sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log('📧 Email sent successfully:', {
      to,
      subject,
      messageId: info.messageId,
    });

    return { success: true };
  } catch (error: any) {
    console.error('📧 Failed to send email:', {
      to,
      subject,
      error: error.message,
    });

    return { success: false, error: error.message };
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export async function sendWelcomeEmail(email: string, userName: string, referralId: string) {
  const { subject, html } = getWelcomeEmailContent(userName, referralId);
  return sendEmail(email, subject, html);
}

export async function sendDepositConfirmationEmail(
  email: string,
  userName: string,
  amount: string,
  method: string,
  accountId: string,
  transactionId: string
) {
  const { subject, html } = getDepositConfirmationEmailContent(userName, amount, method, accountId, transactionId);
  return sendEmail(email, subject, html);
}

export async function sendDepositPendingEmail(email: string, userName: string, amount: string, method: string) {
  const { subject, html } = getDepositPendingEmailContent(userName, amount, method);
  return sendEmail(email, subject, html);
}

export async function sendWithdrawalRequestEmail(
  email: string,
  userName: string,
  amount: string,
  method: string,
  accountId: string
) {
  const { subject, html } = getWithdrawalRequestEmailContent(userName, amount, method, accountId);
  return sendEmail(email, subject, html);
}

export async function sendWithdrawalApprovedEmail(email: string, userName: string, amount: string, method: string) {
  const { subject, html } = getWithdrawalApprovedEmailContent(userName, amount, method);
  return sendEmail(email, subject, html);
}

export async function sendWithdrawalRejectedEmail(email: string, userName: string, amount: string, reason: string) {
  const { subject, html } = getWithdrawalRejectedEmailContent(userName, amount, reason);
  return sendEmail(email, subject, html);
}

export async function sendDocumentUploadedEmail(email: string, userName: string, documentType: string) {
  const { subject, html } = getDocumentUploadedEmailContent(userName, documentType);
  return sendEmail(email, subject, html);
}

export async function sendDocumentVerifiedEmail(
  email: string,
  userName: string,
  documentType: string,
  isFullyVerified: boolean
) {
  const { subject, html } = getDocumentVerifiedEmailContent(userName, documentType, isFullyVerified);
  return sendEmail(email, subject, html);
}

export async function sendDocumentRejectedEmail(
  email: string,
  userName: string,
  documentType: string,
  reason: string
) {
  const { subject, html } = getDocumentRejectedEmailContent(userName, documentType, reason);
  return sendEmail(email, subject, html);
}

export async function sendSupportTicketCreatedEmail(
  email: string,
  userName: string,
  ticketId: string,
  ticketSubject: string,
  category: string
) {
  const { subject, html } = getSupportTicketCreatedEmailContent(userName, ticketId, ticketSubject, category);
  return sendEmail(email, subject, html);
}

export async function sendSupportTicketReplyEmail(
  email: string,
  userName: string,
  ticketId: string,
  ticketSubject: string,
  replyMessage: string,
  isFromAdmin: boolean
) {
  const { subject, html } = getSupportTicketReplyEmailContent(userName, ticketId, ticketSubject, replyMessage, isFromAdmin);
  return sendEmail(email, subject, html);
}

export async function sendSupportTicketResolvedEmail(
  email: string,
  userName: string,
  ticketId: string,
  ticketSubject: string
) {
  const { subject, html } = getSupportTicketResolvedEmailContent(userName, ticketId, ticketSubject);
  return sendEmail(email, subject, html);
}

export async function sendIBCommissionEmail(
  email: string,
  userName: string,
  commission: string,
  referralName: string,
  transactionType: string,
  transactionAmount: string
) {
  const { subject, html } = getIBCommissionEmailContent(userName, commission, referralName, transactionType, transactionAmount);
  return sendEmail(email, subject, html);
}

export async function sendIBPayoutEmail(email: string, userName: string, amount: string, notes: string = '') {
  const { subject, html } = getIBPayoutEmailContent(userName, amount, notes);
  return sendEmail(email, subject, html);
}

export async function sendTradingAccountCreatedEmail(
  email: string,
  userName: string,
  accountId: string,
  accountType: string,
  leverage: string
) {
  const { subject, html } = getTradingAccountCreatedEmailContent(userName, accountId, accountType, leverage);
  return sendEmail(email, subject, html);
}

export async function sendSecurityAlertEmail(
  email: string,
  userName: string,
  ipAddress: string,
  device: string,
  location: string
) {
  const { subject, html } = getSecurityAlertEmailContent(userName, ipAddress, device, location);
  return sendEmail(email, subject, html);
}

export async function sendPasswordResetEmail(email: string, userName: string, resetLink: string) {
  const { subject, html } = getPasswordResetEmailContent(userName, resetLink);
  return sendEmail(email, subject, html);
}

export async function sendVerificationEmail(email: string, userName: string, verificationLink: string) {
  const { subject, html } = getVerificationEmailContent(userName, verificationLink);
  return sendEmail(email, subject, html);
}

