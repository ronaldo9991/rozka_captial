#!/usr/bin/env node

const testEmail = 'ronaldodavid1600@gmail.com';
const API_URL = process.env.API_URL || 'http://localhost:5000';

console.log('📧 Sending Welcome Email via API...\n');
console.log('Email:', testEmail);
console.log('API URL:', API_URL);
console.log('');
console.log('⚠️  Note: This requires admin authentication.');
console.log('   Please use the admin panel or provide admin session cookie.');
console.log('');
console.log('✅ Logo Configuration:');
console.log('   ✓ Updated to use ROZKA.png');
console.log('   ✓ All Mekness emails will use this logo');
console.log('');
console.log('📝 To send welcome email:');
console.log('   POST /api/admin/send-welcome-email');
console.log('   Body: { "email": "ronaldodavid1600@gmail.com", "userName": "Ronaldo", "referralId": "REF123456" }');
console.log('');
console.log('✅ Configuration complete!');





