import clientPromise from '../../../../lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { id } = params;

  // Validate ObjectId
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({
      success: false,
      error: 'Invalid expense ID'
    }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("expense_tracker");
    const collection = db.collection("expenses");

    const expense = await collection.findOne({
      _id: new ObjectId(id)
    });

    if (!expense) {
      return NextResponse.json({
        success: false,
        error: 'Expense not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...expense,
        id: expense._id
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch expense'
    }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { id } = params;

  // Validate ObjectId
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({
      success: false,
      error: 'Invalid expense ID'
    }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("expense_tracker");
    const collection = db.collection("expenses");

    const body = await request.json();
    const { category, amount, description } = body;

    // Validation
    if (category && !['Labour', 'Inventory', 'Utilities', 'Others'].includes(category)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid category'
      }, { status: 400 });
    }

    if (amount && (isNaN(amount) || parseFloat(amount) <= 0)) {
      return NextResponse.json({
        success: false,
        error: 'Amount must be a positive number'
      }, { status: 400 });
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (category) updateData.category = category;
    if (amount) updateData.amount = parseFloat(amount);
    if (description !== undefined) updateData.description = description;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Expense not found'
      }, { status: 404 });
    }

    const updatedExpense = await collection.findOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedExpense,
        id: updatedExpense._id
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update expense'
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;

  // Validate ObjectId
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({
      success: false,
      error: 'Invalid expense ID'
    }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("expense_tracker");
    const collection = db.collection("expenses");

    const result = await collection.deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Expense not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete expense'
    }, { status: 500 });
  }
}