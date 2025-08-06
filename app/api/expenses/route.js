import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// 🔄 GET: Read all expenses
export async function GET() {
    try {
        console.log('🔄 GET /api/expenses called');

        // Connect to CakeZone database
        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("expenses");
        console.log('✅ Connected to CakeZone database');

        // Fetch all expenses sorted by date (newest first)
        const expenses = await collection.find({}).sort({ date: -1 }).toArray();
        console.log(`📊 Found ${expenses.length} expenses in CakeZone database`);

        return NextResponse.json({
            success: true,
            data: expenses,
            count: expenses.length,
            message: `Retrieved ${expenses.length} expenses from CakeZone database`
        });
    } catch (err) {
        console.error('❌ GET error:', err);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch expenses: ' + err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }, { status: 500 });
    }
}

// ➕ POST: Create a new expense
export async function POST(req) {
    try {
        console.log('🔄 POST /api/expenses called');

        // Connect to CakeZone database
        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("expenses");
        console.log('✅ Connected to CakeZone database');

        const data = await req.json();
        console.log('📝 Received data:', data);

        // Enhanced validation
        if (!data.category || data.amount === undefined || data.amount === null) {
            console.log('❌ Validation failed - missing category or amount');
            return NextResponse.json({
                success: false,
                error: 'Category and amount are required'
            }, { status: 400 });
        }

        // Validate amount is a positive number
        const amount = parseFloat(data.amount);
        if (isNaN(amount) || amount <= 0) {
            console.log('❌ Validation failed - invalid amount:', amount);
            return NextResponse.json({
                success: false,
                error: 'Amount must be a positive number'
            }, { status: 400 });
        }

        // Validate category
        const validCategories = ['Labour', 'Inventory', 'Utilities', 'Others'];
        if (!validCategories.includes(data.category)) {
            console.log('❌ Validation failed - invalid category:', data.category);
            return NextResponse.json({
                success: false,
                error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            }, { status: 400 });
        }

        // Create expense object with proper structure
        const newExpense = {
            category: data.category.trim(),
            amount: amount,
            description: (data.description || '').trim(),
            date: data.date ? new Date(data.date) : new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        console.log('💾 Inserting expense:', newExpense);

        // Insert into CakeZone database
        const result = await collection.insertOne(newExpense);
        console.log('✅ Insert result:', result);

        if (!result.insertedId) {
            throw new Error('Failed to insert expense - no ID returned');
        }

        // Fetch the created expense to return complete data
        const createdExpense = await collection.findOne({ _id: result.insertedId });
        console.log('📋 Created expense:', createdExpense);

        return NextResponse.json({
            success: true,
            data: createdExpense,
            message: 'Expense added successfully to CakeZone database'
        }, { status: 201 });

    } catch (err) {
        console.error('❌ POST error:', err);
        return NextResponse.json({
            success: false,
            error: 'Failed to create expense: ' + err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }, { status: 500 });
    }
}
