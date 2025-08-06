import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// 🔍 GET: Single Expense by ID
export async function GET(_, { params }) {
    try {
        // Await params in Next.js 15
        const resolvedParams = await params;
        console.log('🔍 GET by ID called for expense:', resolvedParams.id);

        // Connect to CakeZone database
        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("expenses");
        console.log('✅ Connected to CakeZone database');

        // Validate ObjectId format
        if (!ObjectId.isValid(resolvedParams.id)) {
            console.log('❌ Invalid ObjectId format:', resolvedParams.id);
            return NextResponse.json({
                success: false,
                error: 'Invalid ID format. Must be a valid MongoDB ObjectId.'
            }, { status: 400 });
        }

        const expense = await collection.findOne({ _id: new ObjectId(resolvedParams.id) });
        console.log('📋 Found expense:', expense ? 'Yes' : 'No');

        if (!expense) {
            return NextResponse.json({
                success: false,
                error: 'Expense not found in CakeZone database'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: expense,
            message: 'Expense retrieved successfully from CakeZone database'
        });
    } catch (err) {
        console.error('❌ GET by ID error:', err);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch expense: ' + err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }, { status: 500 });
    }
}

// ✏️ PUT: Update Expense by ID
export async function PUT(req, { params }) {
    try {
        // Await params in Next.js 15
        const resolvedParams = await params;
        console.log('✏️ PUT called for expense ID:', resolvedParams.id);

        // Connect to CakeZone database
        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("expenses");
        console.log('✅ Connected to CakeZone database');

        // Validate ObjectId format
        if (!ObjectId.isValid(resolvedParams.id)) {
            console.log('❌ Invalid ObjectId format:', resolvedParams.id);
            return NextResponse.json({
                success: false,
                error: 'Invalid ID format. Must be a valid MongoDB ObjectId.'
            }, { status: 400 });
        }

        const updateData = await req.json();
        console.log('📝 Update data received:', updateData);

        // Validate update data
        if (updateData.amount !== undefined) {
            const amount = parseFloat(updateData.amount);
            if (isNaN(amount) || amount <= 0) {
                return NextResponse.json({
                    success: false,
                    error: 'Amount must be a positive number'
                }, { status: 400 });
            }
            updateData.amount = amount;
        }

        if (updateData.category) {
            const validCategories = ['Labour', 'Inventory', 'Utilities', 'Others'];
            if (!validCategories.includes(updateData.category)) {
                return NextResponse.json({
                    success: false,
                    error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
                }, { status: 400 });
            }
        }

        // Add updatedAt timestamp
        updateData.updatedAt = new Date();

        const updated = await collection.findOneAndUpdate(
            { _id: new ObjectId(resolvedParams.id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        console.log('📋 Update result:', updated ? 'Success' : 'Not found');

        if (!updated.value) {
            return NextResponse.json({
                success: false,
                error: 'Expense not found in CakeZone database'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: updated.value,
            message: 'Expense updated successfully in CakeZone database'
        });
    } catch (err) {
        console.error('❌ PUT error:', err);
        return NextResponse.json({
            success: false,
            error: 'Failed to update expense: ' + err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }, { status: 500 });
    }
}

// ❌ DELETE: Remove Expense by ID
export async function DELETE(_, { params }) {
    try {
        // Await params in Next.js 15
        const resolvedParams = await params;
        console.log('🗑️ DELETE called for expense ID:', resolvedParams.id);

        // Connect to CakeZone database
        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("expenses");
        console.log('✅ Connected to CakeZone database');

        // Validate ObjectId format
        if (!ObjectId.isValid(resolvedParams.id)) {
            console.log('❌ Invalid ObjectId format:', resolvedParams.id);
            return NextResponse.json({
                success: false,
                error: 'Invalid ID format. Must be a valid MongoDB ObjectId.'
            }, { status: 400 });
        }

        const objectId = new ObjectId(resolvedParams.id);
        console.log('🔍 Looking for expense with ObjectId:', objectId);

        // First, check if the expense exists
        const existingExpense = await collection.findOne({ _id: objectId });
        if (!existingExpense) {
            console.log('❌ Expense not found for ID:', resolvedParams.id);
            return NextResponse.json({
                success: false,
                error: 'Expense not found. It may have already been deleted.'
            }, { status: 404 });
        }

        console.log('📋 Found expense to delete:', existingExpense);

        // Delete the expense
        const deleteResult = await collection.deleteOne({ _id: objectId });
        console.log('🗑️ Delete operation result:', deleteResult);

        if (deleteResult.deletedCount === 0) {
            console.log('❌ No documents were deleted');
            return NextResponse.json({
                success: false,
                error: 'Failed to delete expense. No documents were affected.'
            }, { status: 500 });
        }

        console.log('✅ Successfully deleted expense from CakeZone database');
        return NextResponse.json({
            success: true,
            message: 'Expense deleted successfully from CakeZone database',
            data: existingExpense,
            deletedCount: deleteResult.deletedCount
        });

    } catch (err) {
        console.error('❌ DELETE error:', err);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete expense: ' + err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }, { status: 500 });
    }
}
