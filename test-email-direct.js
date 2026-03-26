#!/usr/bin/env node

/**
 * Direct test of Mailgun email sending
 */

import nodemailer from 'nodemailer';

const SMTP_CONFIG = {
  host: process.env.SMTP_SERVER || 'smtp.eu.mailgun.org',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_LOGIN,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
};

const FROM_EMAIL = process.env.SMTP_FROM || 'support@rozkacapitals.com';
const FROM_NAME = process.env.SMTP_FROM_NAME || 'Rozka Capitals';

if (!process.env.SMTP_LOGIN || !process.env.SMTP_PASSWORD) {
  console.error('Set SMTP_LOGIN and SMTP_PASSWORD in the environment.');
  process.exit(1);
}

console.log('📧 Testing Mailgun Email Configuration...\n');
console.log('SMTP Server:', SMTP_CONFIG.host);
console.log('SMTP Port:', SMTP_CONFIG.port);
console.log('SMTP Login:', SMTP_CONFIG.auth.user);
console.log('SMTP Password:', SMTP_CONFIG.auth.pass ? '***' : 'NOT SET');
console.log('From Email:', FROM_EMAIL);
console.log('\n');

const transporter = nodemailer.createTransport(SMTP_CONFIG);

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Mailgun Email: CONNECTION FAILED');
    console.log('Error:', error.message);
    process.exit(1);
  } else {
    console.log('✅ Mailgun Email: CONNECTION SUCCESSFUL');
    console.log('Server is ready to send emails');
    
    // Try sending a test email
    const testEmail = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: 'test@example.com', // Change this to your email for actual test
      subject: 'Test Email from Rozka Capitals',
      html: '<h1>Test Email</h1><p>This is a test email from Rozka Capitals integration test.</p>',
    };
    
    transporter.sendMail(testEmail, (err, info) => {
      if (err) {
        console.log('\n❌ Email Sending: FAILED');
        console.log('Error:', err.message);
        process.exit(1);
      } else {
        console.log('\n✅ Email Sending: SUCCESS');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        process.exit(0);
      }
    });
  }
});

