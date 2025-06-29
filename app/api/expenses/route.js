import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// 🔄 GET: Read all expenses
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("expenses");

        const expenses = await collection.find({}).sort({ date: -1 }).toArray();
        return NextResponse.json({ success: true, data: expenses });
    } catch (err) {
        console.error('GET error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch expenses' }, { status: 500 });
    }
}

// ➕ POST: Create a new expense
export async function POST(req) {
    try {
        console.log('POST /api/expenses called');
        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("expenses");

        const data = await req.json();
        console.log('Received data:', data);

        // Validation
        if (!data.category || data.amount === undefined || data.amount === null) {
            console.log('Validation failed - missing category or amount');
            return NextResponse.json({ success: false, error: 'Category and amount are required' }, { status: 400 });
        }

        // Validate amount is a positive number
        const amount = parseFloat(data.amount);
        if (isNaN(amount) || amount <= 0) {
            console.log('Validation failed - invalid amount:', amount);
            return NextResponse.json({ success: false, error: 'Amount must be a positive number' }, { status: 400 });
        }

        // Validate category
        const validCategories = ['Labour', 'Inventory', 'Utilities', 'Others'];
        if (!validCategories.includes(data.category)) {
            console.log('Validation failed - invalid category:', data.category);
            return NextResponse.json({ success: false, error: 'Invalid category' }, { status: 400 });
        }

        const newExpense = {
            category: data.category,
            amount: amount,
            description: data.description || '',
            date: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await collection.insertOne(newExpense);
        const createdExpense = await collection.findOne({ _id: result.insertedId });

        return NextResponse.json({ success: true, data: createdExpense }, { status: 201 });
    } catch (err) {
        console.error('POST error:', err);
        return NextResponse.json({ success: false, error: 'Failed to create expense' }, { status: 400 });
    }
}
