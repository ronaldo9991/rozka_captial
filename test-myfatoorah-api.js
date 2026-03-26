#!/usr/bin/env node

/**
 * Test MyFatoorah API Connection
 */

const API_KEY = "yIEC-qPztpBvzvB3LD5VqqO4PmImAbC6yZZ9BgPgzdn8Qmb_pGKH-0KHuAaUvyGKLY0rgwIC1jCE9OkQcdpN4VKqqbcOq7APvbRPHpL7Q8ytlbcP8Ma6Bgv9rfxELVKR-EAS_pQCDz6lnUvRymJEdtd0WNFOpFdQtcluO8n8uVZbOIQBn8zTKCkLIQ-raGd8NQ3isuH-Ttyn4htZrHi1YIdDtqFsLDXO0_0Zyj9SmmZP_WxPmD9pEDMEkMJ3vxHyeuF-Vf4p3zHx44D3T0amfDZTvduR1PDzlER6eN0OcixUAQm3oppt0AurejDgE95iZU81uqOCZaQC1ghs6KsUyuKvXwuLobQDiUnAq9FikwJRNiUH889afkkcK0beat-oLJhDFHNxllSzLmKFV4z_AIAhMXxIkU_15Z0uC9_rfglaJgUhl9EF_xbXqYnh3aLwj60iGaaZPkGs8t5tlq_8F8zTVKGNQVz4CD-6YTdjNCWmDgH0MOX4XtjgfAofSbBJaMOqC8DIymKjsUakHvV1PV6nx4UrEmnB3XrgY4HOgjJtTDLGzIx1GZH3SMBK8cN8MIcfDO8DTJx1pgHV3syp6_Ejvwx28AguLixnm2xDAzyii8hWPWIH6emSzGOlc2YEF7CHgalWG-WG7XrXukDYTRYc4ITFpoYrMQPGwQQqHxPUDAJnBbgba4qyBWVFI0XHvwa-sg";
const BASE_URL = "https://api.myfatoorah.com";

console.log('🧪 Testing MyFatoorah API Connection...\n');

// Test 1: Check API connectivity
async function testAPI() {
  try {
    console.log('1️⃣ Testing API connectivity...');
    console.log('   Base URL:', BASE_URL);
    console.log('   API Key:', API_KEY.substring(0, 20) + '...');
    
    // Test with a simple request (get payment methods or check API)
    const response = await fetch(`${BASE_URL}/v2/InitiatePayment`, {
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
    
    if (response.ok) {
      console.log('   ✅ API Connection: SUCCESS');
      console.log('   Response:', JSON.stringify(data, null, 2).substring(0, 200));
    } else {
      console.log('   ⚠️  API Response:', response.status, response.statusText);
      console.log('   Response:', JSON.stringify(data, null, 2).substring(0, 200));
      
      if (data.Message) {
        console.log('   Message:', data.Message);
      }
      
      // Even if it fails, it means we can connect to the API
      if (response.status === 400 || response.status === 401) {
        console.log('   ✅ API Connection: SUCCESS (API responded, credentials may need verification)');
      } else {
        console.log('   ❌ API Connection: FAILED');
      }
    }
  } catch (error) {
    console.error('   ❌ API Connection Error:', error.message);
    console.log('   ⚠️  Could not connect to MyFatoorah API');
  }
}

testAPI().then(() => {
  console.log('\n📊 Test Complete');
  console.log('\n💡 Next Steps:');
  console.log('   1. Verify environment variables are set in PM2');
  console.log('   2. Check server logs for MyFatoorah initialization');
  console.log('   3. Test invoice creation through the API endpoint');
}).catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});










