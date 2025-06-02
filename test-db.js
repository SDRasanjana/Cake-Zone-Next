import { MongoClient } from 'mongodb';

async function testConnection() {
  const uri = 'mongodb://localhost:27017/CakeZone';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB successfully!');
    
    const db = client.db('expense_tracker');
    const collection = db.collection('expenses');
    
    // Insert a test expense
    const testExpense = {
      category: 'Labour',
      amount: 1000,
      description: 'Test expense',
      date: new Date()
    };
    
    const result = await collection.insertOne(testExpense);
    console.log('✅ Test expense created:', result.insertedId);
    
    // Fetch all expenses
    const expenses = await collection.find({}).toArray();
    console.log('📋 All expenses:', expenses);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await client.close();
  }
}

testConnection();