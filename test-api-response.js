// Simple test to check if the payment confirmation API returns proper JSON
const fetch = require('node-fetch');

async function testPaymentConfirmation() {
  try {
    console.log('Testing payment confirmation API...');
    
    // This would normally be called with a real order ID and payment intent
    const response = await fetch('http://localhost:3000/api/orders/test/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId: 'test_intent' })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (responseText) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Valid JSON response:', data);
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    } else {
      console.log('❌ Empty response');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Only run if server is running
console.log('Make sure to start the dev server first: npm run dev');
// testPaymentConfirmation();
