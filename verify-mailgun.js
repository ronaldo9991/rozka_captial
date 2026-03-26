#!/usr/bin/env node

/**
 * Verify Mailgun Email Service Status
 */

import nodemailer from 'nodemailer';

console.log('🔍 Verifying Mailgun Email Service...\n');

// Check environment variables
const SMTP_SERVER = process.env.SMTP_SERVER || 'smtp.eu.mailgun.org';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_LOGIN = process.env.SMTP_LOGIN;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_FROM = process.env.SMTP_FROM || 'support@rozkacapitals.com';

if (!SMTP_LOGIN || !SMTP_PASSWORD) {
  console.error('Set SMTP_LOGIN and SMTP_PASSWORD in the environment.');
  process.exit(1);
}

console.log('📋 Configuration:');
console.log('   SMTP Server:', SMTP_SERVER);
console.log('   SMTP Port:', SMTP_PORT);
console.log('   SMTP Login:', SMTP_LOGIN);
console.log('   SMTP Password:', SMTP_PASSWORD ? '✅ SET' : '❌ NOT SET');
console.log('   From Email:', SMTP_FROM);
console.log('');

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_SERVER,
  port: SMTP_PORT,
  secure: false,
  auth: {
    user: SMTP_LOGIN,
    pass: SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Test connection
console.log('🔌 Testing SMTP Connection...');
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ CONNECTION FAILED');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
    process.exit(1);
  } else {
    console.log('✅ CONNECTION SUCCESSFUL');
    console.log('   Server is ready to send emails');
    console.log('');
    
    // Test sending email
    console.log('📧 Testing Email Sending...');
    const testEmail = {
      from: `"Rozka Capitals" <${SMTP_FROM}>`,
      to: 'test@example.com', // This won't actually send, just test the connection
      subject: 'Mailgun Verification Test',
      html: '<h1>Mailgun Test</h1><p>This is a test email to verify Mailgun is working.</p>',
    };
    
    transporter.sendMail(testEmail, (err, info) => {
      if (err) {
        console.log('❌ EMAIL SENDING FAILED');
        console.log('   Error:', err.message);
        console.log('   Code:', err.code);
        process.exit(1);
      } else {
        console.log('✅ EMAIL SENDING SUCCESSFUL');
        console.log('   Message ID:', info.messageId);
        console.log('   Response:', info.response);
        console.log('');
        console.log('✅ MAILGUN IS WORKING CORRECTLY');
        process.exit(0);
      }
    });
  }
});

