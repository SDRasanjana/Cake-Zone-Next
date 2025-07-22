import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// 🔍 GET: Single Expense by ID
export async function GET(_, { params }) {
    try {
        console.log('GET by ID called with params:', params);
        console.log('ID received:', params.id);

        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("expenses");

        // Validate ObjectId format
        if (!ObjectId.isValid(params.id)) {
            console.log('Invalid ObjectId format:', params.id);
            return NextResponse.json({ success: false, error: 'Invalid ID format' }, { status: 400 });
        }

        const expense = await collection.findOne({ _id: new ObjectId(params.id) });
        console.log('Found expense:', expense);

        if (!expense) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: expense });
    } catch (err) {
        console.error('GET by ID error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch expense' }, { status: 500 });
    }
}

// ✏️ PUT: Update Expense by ID
export async function PUT(req, { params }) {
    try {
        console.log('PUT called with params:', params);
        console.log('ID received:', params.id);

        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("expenses");

        // Validate ObjectId format
        if (!ObjectId.isValid(params.id)) {
            console.log('Invalid ObjectId format:', params.id);
            return NextResponse.json({ success: false, error: 'Invalid ID format' }, { status: 400 });
        }

        const updateData = await req.json();
        console.log('Update data:', updateData);

        const updated = await collection.findOneAndUpdate(
            { _id: new ObjectId(params.id) },
            { $set: { ...updateData, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );

        console.log('Update result:', updated);
        if (!updated.value) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: updated.value });
    } catch (err) {
        console.error('PUT error:', err);
        return NextResponse.json({ success: false, error: 'Failed to update expense' }, { status: 400 });
    }
}

// ❌ DELETE: Remove Expense by ID
export async function DELETE(_, { params }) {
    try {
        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("expenses");

        const deleted = await collection.findOneAndDelete({ _id: new ObjectId(params.id) });
        if (!deleted.value) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (err) {
        console.error('DELETE error:', err);
        return NextResponse.json({ success: false, error: 'Failed to delete expense' }, { status: 500 });
    }
}
