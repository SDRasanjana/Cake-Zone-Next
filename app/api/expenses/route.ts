import clientPromise from '../../../lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("expense_tracker");
    const collection = db.collection("expenses");

    const expenses = await collection
      .find({})
      .sort({ date: -1 })
      .toArray();
    
    return NextResponse.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch expenses'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("expense_tracker");
    const collection = db.collection("expenses");

    const body = await request.json();
    const { category, amount, description } = body;

    // Validation
    if (!category || !amount) {
      return NextResponse.json({
        success: false,
        error: 'Category and amount are required'
      }, { status: 400 });
    }

    if (!['Labour', 'Inventory', 'Utilities', 'Others'].includes(category)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid category'
      }, { status: 400 });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Amount must be a positive number'
      }, { status: 400 });
    }

    const newExpense = {
      category,
      amount: parseFloat(amount),
      description: description || '',
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newExpense);
    
    const createdExpense = await collection.findOne({
      _id: result.insertedId
    });

    return NextResponse.json({
      success: true,
      data: {
        ...createdExpense,
        id: createdExpense._id
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create expense'
    }, { status: 500 });
  }
}