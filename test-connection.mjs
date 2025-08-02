// Debug script to test MongoDB connection and order creation
console.log('Testing MongoDB connection...');

// Check environment variables
console.log('Environment check:');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);

async function testConnection() {
  try {
    // Test MongoDB connection
    const clientPromise = import('../lib/mongodb.js');
    const client = await (await clientPromise).default;
    console.log('✅ MongoDB connection successful');
    
    const db = client.db("cakezone");
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Test order creation
    const testOrder = {
      userId: 'test-user',
      items: [{ name: 'Test Cake', price: 100, quantity: 1 }],
      shipping: {
        fullName: 'Test User',
        email: 'test@example.com',
        address: 'Test Address',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country',
        phone: '1234567890'
      },
      total: 100,
      deliveryDate: '2025-08-01',
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection("orders").insertOne(testOrder);
    console.log('✅ Test order created:', result.insertedId);
    
    // Clean up test order
    await db.collection("orders").deleteOne({ _id: result.insertedId });
    console.log('✅ Test order cleaned up');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testConnection();
}
