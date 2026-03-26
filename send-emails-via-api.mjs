#!/usr/bin/env node

/**
 * Send Welcome Emails via API Endpoint
 * This script calls the API endpoint to send emails
 */

const API_URL = process.env.API_URL || 'http://localhost:5000';
const ENDPOINT = `${API_URL}/api/admin/send-welcome-emails`;

console.log('🚀 Sending Welcome Emails via API...\n');
console.log(`📡 Calling: ${ENDPOINT}\n`);

// Try to send the request
fetch(ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies if available
})
  .then(async (response) => {
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS!\n');
      console.log('📧 Email Campaign Results:');
      console.log('='.repeat(50));
      console.log(`Message: ${data.message}`);
      console.log(`✅ Sent: ${data.sent} emails`);
      console.log(`❌ Failed: ${data.failed} emails`);
      console.log(`📊 Total: ${data.total} users`);
      
      if (data.errors && data.errors.length > 0) {
        console.log('\n❌ Errors:');
        data.errors.forEach((err, i) => {
          console.log(`   ${i + 1}. ${err.email}: ${err.error}`);
        });
      }
      
      console.log('\n✅ Campaign completed!');
      process.exit(0);
    } else {
      console.error('❌ ERROR:', data.message || 'Failed to send emails');
      if (data.error) {
        console.error('Details:', data.error);
      }
      if (response.status === 401) {
        console.error('\n⚠️  Authentication required. Please:');
        console.error('   1. Log in as admin in your browser');
        console.error('   2. Open browser console (F12)');
        console.error('   3. Run: fetch("/api/admin/send-welcome-emails", {method: "POST", credentials: "include"}).then(r => r.json()).then(console.log)');
      }
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Network Error:', error.message);
    console.error('\n⚠️  Please ensure:');
    console.error('   1. Server is running on', API_URL);
    console.error('   2. You are authenticated as admin');
    console.error('\n💡 Alternative: Use the admin panel browser console method');
    process.exit(1);
  });

