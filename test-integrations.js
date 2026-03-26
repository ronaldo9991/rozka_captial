#!/usr/bin/env node

/**
 * Test script to verify MT5 and Mailgun integrations
 */

import http from 'http';

const API_BASE = process.env.API_URL || 'http://localhost:5000';

console.log('🔍 Testing MT5 and Mailgun Integrations...\n');

// Test MT5 Connection
async function testMT5() {
  return new Promise((resolve) => {
    console.log('📡 Testing MT5 API Connection...');
    const url = `${API_BASE}/api/mt5/health`;
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.status === 'connected') {
            console.log('✅ MT5 API: CONNECTED');
            resolve(true);
          } else {
            console.log('❌ MT5 API: DISCONNECTED');
            console.log('   Status:', result.status);
            resolve(false);
          }
        } catch (e) {
          console.log('❌ MT5 API: ERROR');
          console.log('   Response:', data);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('❌ MT5 API: CONNECTION ERROR');
      console.log('   Error:', err.message);
      console.log('   Make sure the server is running on', API_BASE);
      resolve(false);
    });
  });
}

// Test Email Service
async function testEmail() {
  return new Promise((resolve) => {
    console.log('\n📧 Testing Mailgun Email Service...');
    
    // Check if email service is configured
    const testEmailEndpoint = `${API_BASE}/api/test-email`;
    const postData = JSON.stringify({
      to: 'test@example.com',
      subject: 'Test Email',
      message: 'This is a test email from Rozka Capitals integration test.'
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(testEmailEndpoint, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Mailgun Email: CONFIGURED');
          resolve(true);
        } else if (res.statusCode === 404) {
          // Endpoint doesn't exist, check environment variables instead
          checkEmailConfig(resolve);
        } else {
          console.log('❌ Mailgun Email: ERROR');
          console.log('   Status:', res.statusCode);
          console.log('   Response:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      // If endpoint doesn't exist, check config
      if (err.code === 'ECONNREFUSED') {
        checkEmailConfig(resolve);
      } else {
        console.log('❌ Mailgun Email: CONNECTION ERROR');
        console.log('   Error:', err.message);
        resolve(false);
      }
    });

    req.write(postData);
    req.end();
  });
}

function checkEmailConfig(resolve) {
  console.log('⚠️  Mailgun Email: Checking configuration...');
  const requiredVars = [
    'SMTP_SERVER',
    'SMTP_LOGIN',
    'SMTP_PASSWORD',
    'SMTP_FROM'
  ];
  
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length === 0) {
    console.log('✅ Mailgun Email: Environment variables configured');
    console.log('   SMTP Server:', process.env.SMTP_SERVER || 'smtp.eu.mailgun.org');
    console.log('   SMTP Login:', process.env.SMTP_LOGIN || 'Not set');
    console.log('   SMTP From:', process.env.SMTP_FROM || 'Not set');
    resolve(true);
  } else {
    console.log('❌ Mailgun Email: Missing environment variables');
    console.log('   Missing:', missing.join(', '));
    console.log('\n   Required variables:');
    console.log('   - SMTP_SERVER (default: smtp.eu.mailgun.org)');
    console.log('   - SMTP_PORT (default: 587)');
    console.log('   - SMTP_LOGIN (e.g., postmaster@mg.yourdomain.com)');
    console.log('   - SMTP_PASSWORD');
    console.log('   - SMTP_FROM (e.g., support@rozkacapitals.com)');
    resolve(false);
  }
}

// Test Environment Variables
function checkEnvironmentVariables() {
  console.log('\n🔧 Checking Environment Variables...\n');
  
  const mt5Vars = {
    'MT5_SERVER_IP': process.env.MT5_SERVER_IP || '192.109.17.202 (default)',
    'MT5_SERVER_PORT': process.env.MT5_SERVER_PORT || '443 (default)',
    'MT5_SERVER_WEB_LOGIN': process.env.MT5_SERVER_WEB_LOGIN || '10010 (default)',
    'MT5_SERVER_WEB_PASSWORD': process.env.MT5_SERVER_WEB_PASSWORD ? '***' : 'NOT SET',
  };
  
  const emailVars = {
    'SMTP_SERVER': process.env.SMTP_SERVER || 'smtp.eu.mailgun.org (default)',
    'SMTP_PORT': process.env.SMTP_PORT || '587 (default)',
    'SMTP_LOGIN': process.env.SMTP_LOGIN || 'NOT SET',
    'SMTP_PASSWORD': process.env.SMTP_PASSWORD ? '***' : 'NOT SET',
    'SMTP_FROM': process.env.SMTP_FROM || 'NOT SET',
  };
  
  console.log('MT5 Configuration:');
  Object.entries(mt5Vars).forEach(([key, value]) => {
    const status = value.includes('NOT SET') ? '❌' : '✅';
    console.log(`  ${status} ${key}: ${value}`);
  });
  
  console.log('\nMailgun Configuration:');
  Object.entries(emailVars).forEach(([key, value]) => {
    const status = value.includes('NOT SET') ? '❌' : '✅';
    console.log(`  ${status} ${key}: ${value}`);
  });
}

// Main test function
async function runTests() {
  checkEnvironmentVariables();
  
  const mt5Result = await testMT5();
  const emailResult = await testEmail();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary:');
  console.log('='.repeat(50));
  console.log(`MT5 API:        ${mt5Result ? '✅ WORKING' : '❌ NOT WORKING'}`);
  console.log(`Mailgun Email:  ${emailResult ? '✅ CONFIGURED' : '❌ NOT CONFIGURED'}`);
  console.log('='.repeat(50));
  
  if (mt5Result && emailResult) {
    console.log('\n✅ All integrations are working!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some integrations need attention.');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});

