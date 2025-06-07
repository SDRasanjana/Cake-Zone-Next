import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// 🔄 GET: Read all ingredients with their price history
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("ingredients");

        const ingredients = await collection.find({}).sort({ name: 1 }).toArray();
        return NextResponse.json({ success: true, data: ingredients });
    } catch (err) {
        console.error('GET ingredients error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch ingredients' }, { status: 500 });
    }
}

// ➕ POST: Add new ingredient price entry
export async function POST(req) {
    try {
        console.log('POST /api/ingredients called');
        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("ingredients");

        const data = await req.json();
        console.log('Received ingredient data:', data);

        // Validation
        if (!data.name || data.price === undefined || data.price === null) {
            console.log('Validation failed - missing name or price');
            return NextResponse.json({ success: false, error: 'Ingredient name and price are required' }, { status: 400 });
        }

        // Validate price is a positive number
        const price = parseFloat(data.price);
        if (isNaN(price) || price <= 0) {
            console.log('Validation failed - invalid price:', price);
            return NextResponse.json({ success: false, error: 'Price must be a positive number' }, { status: 400 });
        }

        // Check if ingredient exists, if not create it
        let ingredient = await collection.findOne({ name: data.name });

        if (ingredient) {
            // Add new price entry to existing ingredient
            const updatedIngredient = await collection.findOneAndUpdate(
                { name: data.name },
                {
                    $push: {
                        priceHistory: {
                            price: price,
                            date: new Date(),
                            source: data.source || 'manual',
                            unit: data.unit || 'kg'
                        }
                    },
                    $set: {
                        currentPrice: price,
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );
            return NextResponse.json({ success: true, data: updatedIngredient.value }, { status: 200 });
        } else {
            // Create new ingredient
            const newIngredient = {
                name: data.name,
                category: data.category || 'Other',
                currentPrice: price,
                unit: data.unit || 'kg',
                priceHistory: [{
                    price: price,
                    date: new Date(),
                    source: data.source || 'manual',
                    unit: data.unit || 'kg'
                }],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await collection.insertOne(newIngredient);
            const createdIngredient = await collection.findOne({ _id: result.insertedId });

            return NextResponse.json({ success: true, data: createdIngredient }, { status: 201 });
        }
    } catch (err) {
        console.error('POST ingredients error:', err);
        return NextResponse.json({ success: false, error: 'Failed to create/update ingredient' }, { status: 400 });
    }
}
