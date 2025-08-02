// Simple test to replicate the exact order creation process
const fetch = require('node-fetch');

async function testOrderCreation() {
  try {
    console.log('Testing order creation API...');
    
    // Test data that matches what the checkout page sends
    const testOrderData = {
      cartItems: [
        {
          id: 'test-cake-1',
          name: 'Chocolate Cake',
          price: 1500,
          quantity: 1,
          imageUri: '/cake1.jpg'
        }
      ],
      shipping: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Main St',
        city: 'Colombo',
        postalCode: '00100',
        country: 'Sri Lanka'
      },
      deliveryDate: '2025-08-01',
      userId: 'test-user-123',
      total: 1500
    };
    
    console.log('Sending request with data:', JSON.stringify(testOrderData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testOrderData)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Order created successfully:', data);
        return data.orderId;
      } catch (e) {
        console.log('❌ Invalid JSON response');
      }
    } else {
      console.log('❌ Order creation failed');
      try {
        const errorData = JSON.parse(responseText);
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Could not parse error response as JSON');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Export for use in other files or run directly
module.exports = { testOrderCreation };

// Only run if this script is executed directly
if (require.main === module) {
  console.log('Make sure to start the dev server first: npm run dev');
  console.log('Then run: node test-order-creation.js');
}
