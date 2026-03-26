#!/usr/bin/env node

/**
 * Test MyFatoorah Integration
 */

import { getMyFatoorahService } from './server/services/myfatoorah.js';

const API_BASE = process.env.API_URL || 'http://localhost:5000';

console.log('🧪 Testing MyFatoorah Integration...\n');

// Check environment variables
console.log('📋 Environment Check:');
console.log('  MYFATOORAH_API_KEY:', process.env.MYFATOORAH_API_KEY ? '✅ Set' : '❌ Not Set');
console.log('  MYFATOORAH_COUNTRY_CODE:', process.env.MYFATOORAH_COUNTRY_CODE || 'USA (default)');
console.log('  MYFATOORAH_TEST_MODE:', process.env.MYFATOORAH_TEST_MODE || 'false (default)');
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'Not Set');
console.log('  API_URL:', process.env.API_URL || 'Not Set');
console.log('');

// Test service initialization
try {
  const myfatoorah = getMyFatoorahService();
  console.log('✅ MyFatoorah service initialized successfully');
  console.log('');
} catch (error) {
  console.error('❌ Failed to initialize MyFatoorah service:', error.message);
  process.exit(1);
}

// Test API endpoint availability
console.log('🔍 Testing API Endpoints...');
const endpoints = [
  '/api/myfatoorah/create-invoice',
  '/api/myfatoorah/payment-status/test123',
];

for (const endpoint of endpoints) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: endpoint.includes('create-invoice') ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const status = response.status;
    if (status === 401 || status === 400) {
      console.log(`  ✅ ${endpoint}: Available (${status} - requires auth/data)`);
    } else if (status === 404) {
      console.log(`  ❌ ${endpoint}: Not Found (${status})`);
    } else {
      console.log(`  ✅ ${endpoint}: Available (${status})`);
    }
  } catch (error) {
    console.log(`  ❌ ${endpoint}: Error - ${error.message}`);
  }
}

console.log('\n📊 Test Summary:');
console.log('  - Service initialization: Check above');
console.log('  - API endpoints: Check above');
console.log('\n💡 To fully test, you need to:');
console.log('  1. Set MYFATOORAH_API_KEY environment variable');
console.log('  2. Make an authenticated request to create an invoice');
console.log('  3. Test with a real payment (in test mode)');










