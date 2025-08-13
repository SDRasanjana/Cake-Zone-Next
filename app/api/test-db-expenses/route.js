import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        console.log('🧪 Testing database connection and operations...');

        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("expenses");

        // Test 1: Check database connection
        const dbStats = await db.stats();
        console.log('✅ Database connection successful');
        console.log('Database name:', db.databaseName);
        console.log('Database stats:', dbStats);

        // Test 2: Count total expenses
        const totalCount = await collection.countDocuments();
        console.log('📊 Total expenses in database:', totalCount);

        // Test 3: Get sample expenses
        const sampleExpenses = await collection.find({}).limit(3).toArray();
        console.log('📋 Sample expenses:', sampleExpenses);

        // Test 4: Test insert operation
        const testExpense = {
            category: 'Others',
            amount: 100,
            description: 'Test expense - will be deleted',
            date: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const insertResult = await collection.insertOne(testExpense);
        console.log('✅ Test insert successful, ID:', insertResult.insertedId);

        // Test 5: Test delete operation
        const deleteResult = await collection.deleteOne({ _id: insertResult.insertedId });
        console.log('✅ Test delete successful, deleted count:', deleteResult.deletedCount);

        // Test 6: Check collection indexes
        const indexes = await collection.indexes();
        console.log('📇 Collection indexes:', indexes);

        return NextResponse.json({
            success: true,
            message: 'All database tests passed!',
            data: {
                databaseName: db.databaseName,
                totalExpenses: totalCount,
                sampleExpenses: sampleExpenses,
                testResults: {
                    connection: true,
                    insert: true,
                    delete: true,
                    indexes: indexes.length
                }
            }
        });

    } catch (error) {
        console.error('❌ Database test failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            details: {
                name: error.name,
                stack: error.stack
            }
        }, { status: 500 });
    }
}
