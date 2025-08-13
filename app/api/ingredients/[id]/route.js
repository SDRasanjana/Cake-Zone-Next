import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Force Node.js runtime to support MongoDB connections
export const runtime = 'nodejs';

// 🔍 GET: Read a specific ingredient by ID
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: 'Invalid ingredient ID' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("ingredients");

        const ingredient = await collection.findOne({ _id: new ObjectId(id) });

        if (!ingredient) {
            return NextResponse.json({ success: false, error: 'Ingredient not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: ingredient });
    } catch (err) {
        console.error('GET ingredient error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch ingredient' }, { status: 500 });
    }
}

// ✏️ PUT: Update an ingredient
export async function PUT(request, { params }) {
    try {
        const { id } = await params;

        console.log('PUT /api/ingredients/[id] - ID:', id); // Debug log

        if (!id || !ObjectId.isValid(id)) {
            console.log('Invalid ID format:', id);
            return NextResponse.json({ success: false, error: 'Invalid ingredient ID format' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("ingredients");

        const data = await request.json();
        console.log('PUT request data:', data); // Debug log

        // Validation
        if (!data.name) {
            return NextResponse.json({ success: false, error: 'Ingredient name is required' }, { status: 400 });
        }

        if (data.currentPrice !== undefined) {
            const price = parseFloat(data.currentPrice);
            if (isNaN(price) || price <= 0) {
                return NextResponse.json({ success: false, error: 'Current price must be a positive number' }, { status: 400 });
            }
            data.currentPrice = price;
        }

        if (data.quantity !== undefined) {
            const quantity = parseFloat(data.quantity);
            if (isNaN(quantity) || quantity < 0) {
                return NextResponse.json({ success: false, error: 'Quantity must be a non-negative number' }, { status: 400 });
            }
            data.quantity = quantity;
        }

        // Remove _id from update data if present
        if (data._id) delete data._id;

        // Check if ingredient exists first
        console.log('Looking for ingredient with ID:', id);
        console.log('ID type:', typeof id);
        console.log('ObjectId.isValid result:', ObjectId.isValid(id));

        let queryId;
        try {
            queryId = new ObjectId(id);
        } catch (err) {
            console.log('Could not create ObjectId, using string ID:', err.message);
            queryId = id;
        }

        const existingIngredient = await collection.findOne({ _id: queryId });
        if (!existingIngredient) {
            // Try with the other ID format
            const alternativeId = queryId instanceof ObjectId ? id : new ObjectId(id);
            const alternativeIngredient = await collection.findOne({ _id: alternativeId });
            if (!alternativeIngredient) {
                console.log('Ingredient not found with either ID format:', id);
                return NextResponse.json({ success: false, error: 'Ingredient not found' }, { status: 404 });
            }
            console.log('Found ingredient with alternative ID format');
            queryId = alternativeId;
        }

        console.log('Found existing ingredient:', existingIngredient ? existingIngredient.name : 'with alternative ID');

        const updateData = {
            ...data,
            updatedAt: new Date()
        };

        console.log('Update data to be set:', updateData);

        const result = await collection.findOneAndUpdate(
            { _id: queryId },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        console.log('Update result:', result);
        console.log('Result type:', typeof result);
        console.log('Result keys:', result ? Object.keys(result) : 'null');

        if (!result) {
            console.log('No result returned from findOneAndUpdate');
            return NextResponse.json({ success: false, error: 'Failed to update ingredient - no result returned' }, { status: 404 });
        }

        console.log('Update successful, returning data');
        return NextResponse.json({ success: true, data: result });
    } catch (err) {
        console.error('PUT ingredient error:', err);
        return NextResponse.json({ success: false, error: `Failed to update ingredient: ${err.message}` }, { status: 500 });
    }
}

// 🗑️ DELETE: Remove an ingredient
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ success: false, error: 'Invalid ingredient ID' }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("ingredients");

        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, error: 'Ingredient not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Ingredient deleted successfully' });
    } catch (err) {
        console.error('DELETE ingredient error:', err);
        return NextResponse.json({ success: false, error: 'Failed to delete ingredient' }, { status: 500 });
    }
}
