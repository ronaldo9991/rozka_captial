#!/usr/bin/env node

/**
 * Simple MyFatoorah Test
 */

const http = require('http');

const API_BASE = 'http://localhost:5000';

console.log('🧪 Testing MyFatoorah Integration\n');

// Test 1: Check if endpoint exists
console.log('1️⃣ Testing endpoint availability...');
const testData = JSON.stringify({
  amount: 100,
  tradingAccountId: 'test-account-id'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/myfatoorah/create-invoice',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`   Status Code: ${res.statusCode}`);
    
    // Check if response is JSON or HTML
    if (data.trim().startsWith('{') || data.trim().startsWith('[')) {
      try {
        const json = JSON.parse(data);
        console.log('   ✅ Response is JSON');
        console.log('   Response:', JSON.stringify(json, null, 2));
        
        if (json.message === 'Unauthorized') {
          console.log('\n   ⚠️  Endpoint requires authentication (expected)');
          console.log('   ✅ MyFatoorah endpoint is working!');
        } else if (json.message) {
          console.log('\n   📝 Message:', json.message);
        }
      } catch (e) {
        console.log('   ⚠️  Response is not valid JSON');
        console.log('   First 200 chars:', data.substring(0, 200));
      }
    } else {
      console.log('   ❌ Response is HTML (route may not be registered correctly)');
      console.log('   First 100 chars:', data.substring(0, 100));
    }
    
    // Test 2: Check environment variables
    console.log('\n2️⃣ Checking environment variables...');
    console.log('   MYFATOORAH_API_KEY:', process.env.MYFATOORAH_API_KEY ? '✅ Set' : '❌ Not Set');
    console.log('   MYFATOORAH_COUNTRY_CODE:', process.env.MYFATOORAH_COUNTRY_CODE || 'USA (default)');
    console.log('   MYFATOORAH_TEST_MODE:', process.env.MYFATOORAH_TEST_MODE || 'false (default)');
    
    // Summary
    console.log('\n📊 Test Summary:');
    if (res.statusCode === 401) {
      console.log('   ✅ Endpoint is registered and working');
      console.log('   ✅ Requires authentication (as expected)');
      console.log('   ⚠️  Need to set MYFATOORAH_API_KEY for full functionality');
    } else if (res.statusCode === 200 && data.includes('<!DOCTYPE')) {
      console.log('   ❌ Endpoint may not be properly registered');
      console.log('   ⚠️  Server is returning HTML instead of JSON');
    } else if (res.statusCode === 200) {
      console.log('   ✅ Endpoint is working');
    } else {
      console.log(`   Status: ${res.statusCode}`);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  console.log('   Make sure the server is running on port 5000');
});

req.write(testData);
req.end();










