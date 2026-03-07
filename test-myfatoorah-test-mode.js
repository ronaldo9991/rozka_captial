#!/usr/bin/env node

/**
 * Test MyFatoorah in Test Mode
 */

const API_KEY = "yIEC-qPztpBvzvB3LD5VqqO4PmImAbC6yZZ9BgPgzdn8Qmb_pGKH-0KHuAaUvyGKLY0rgwIC1jCE9OkQcdpN4VKqqbcOq7APvbRPHpL7Q8ytlbcP8Ma6Bgv9rfxELVKR-EAS_pQCDz6lnUvRymJEdtd0WNFOpFdQtcluO8n8uVZbOIQBn8zTKCkLIQ-raGd8NQ3isuH-Ttyn4htZrHi1YIdDtqFsLDXO0_0Zyj9SmmZP_WxPmD9pEDMEkMJ3vxHyeuF-Vf4p3zHx44D3T0amfDZTvduR1PDzlER6eN0OcixUAQm3oppt0AurejDgE95iZU81uqOCZaQC1ghs6KsUyuKvXwuLobQDiUnAq9FikwJRNiUH889afkkcK0beat-oLJhDFHNxllSzLmKFV4z_AIAhMXxIkU_15Z0uC9_rfglaJgUhl9EF_xbXqYnh3aLwj60iGaaZPkGs8t5tlq_8F8zTVKGNQVz4CD-6YTdjNCWmDgH0MOX4XtjgfAofSbBJaMOqC8DIymKjsUakHvV1PV6nx4UrEmnB3XrgY4HOgjJtTDLGzIx1GZH3SMBK8cN8MIcfDO8DTJx1pgHV3syp6_Ejvwx28AguLixnm2xDAzyii8hWPWIH6emSzGOlc2YEF7CHgalWG-WG7XrXukDYTRYc4ITFpoYrMQPGwQQqHxPUDAJnBbgba4qyBWVFI0XHvwa-sg";
const TEST_BASE_URL = "https://apitest.myfatoorah.com";
const PROD_BASE_URL = "https://api.myfatoorah.com";

console.log('🧪 Testing MyFatoorah Test Mode...\n');

// Test Test Mode API
async function testTestMode() {
  try {
    console.log('1️⃣ Testing Test Mode API...');
    console.log('   Test URL:', TEST_BASE_URL);
    console.log('   API Key:', API_KEY.substring(0, 20) + '...');
    
    const response = await fetch(`${TEST_BASE_URL}/v2/InitiatePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        InvoiceAmount: 100,
        CurrencyIso: 'USD'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.IsSuccess) {
      console.log('   ✅ Test Mode API: SUCCESS');
      console.log('   Response:', JSON.stringify(data, null, 2).substring(0, 300));
    } else {
      console.log('   ⚠️  Test Mode Response:', response.status);
      console.log('   Message:', data.Message || 'No message');
      
      if (response.status === 401 || response.status === 403) {
        console.log('   ⚠️  Note: API key might be for production only');
        console.log('   💡 You may need a separate test API key for test mode');
      }
    }
  } catch (error) {
    console.error('   ❌ Test Mode API Error:', error.message);
  }
}

// Test Production API (for comparison)
async function testProdMode() {
  try {
    console.log('\n2️⃣ Testing Production API (for comparison)...');
    
    const response = await fetch(`${PROD_BASE_URL}/v2/InitiatePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        InvoiceAmount: 100,
        CurrencyIso: 'USD'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.IsSuccess) {
      console.log('   ✅ Production API: SUCCESS');
    } else {
      console.log('   ⚠️  Production API:', response.status);
    }
  } catch (error) {
    console.error('   ❌ Production API Error:', error.message);
  }
}

async function runTests() {
  await testTestMode();
  await testProdMode();
  
  console.log('\n📊 Test Summary:');
  console.log('   - Test Mode: Check results above');
  console.log('   - Production Mode: Check results above');
  console.log('\n💡 Note:');
  console.log('   - If test mode fails, you may need a separate test API key');
  console.log('   - Some API keys work for both test and production');
  console.log('   - Check MyFatoorah dashboard for test credentials');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});










