import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET: Fetch all cake recipes with current prices
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("cakeRecipes");

        const recipes = await collection.find({}).sort({ name: 1 }).toArray();
        return NextResponse.json({ success: true, data: recipes });
    } catch (err) {
        console.error('GET cake recipes error:', err);
        return NextResponse.json({ success: false, error: 'Failed to fetch cake recipes' }, { status: 500 });
    }
}

// POST: Update or create cake recipe with new pricing
export async function POST(req) {
    try {
        const client = await clientPromise;
        const db = client.db("cakezone");
        const collection = db.collection("cakeRecipes");

        const data = await req.json();
        console.log('Received cake recipe data:', data);

        // Validation
        if (!data.name || !data.currentPrice) {
            return NextResponse.json({ success: false, error: 'Recipe name and current price are required' }, { status: 400 });
        }

        // Check if recipe exists
        let recipe = await collection.findOne({ name: data.name });

        if (recipe) {
            // Update existing recipe
            const updatedRecipe = await collection.findOneAndUpdate(
                { name: data.name },
                {
                    $set: {
                        basePrice: data.basePrice || 0,
                        currentPrice: data.currentPrice,
                        profitMargin: data.profitMargin || 0.20,
                        lastUpdated: new Date(),
                        ingredients: data.ingredients || recipe.ingredients
                    }
                },
                { returnDocument: 'after' }
            );
            return NextResponse.json({ success: true, data: updatedRecipe.value }, { status: 200 });
        } else {
            // Create new recipe
            const newRecipe = {
                name: data.name,
                description: data.description || '',
                category: data.category || 'General',
                basePrice: data.basePrice || 0,
                currentPrice: data.currentPrice,
                profitMargin: data.profitMargin || 0.20,
                ingredients: data.ingredients || [],
                createdAt: new Date(),
                lastUpdated: new Date()
            };

            const result = await collection.insertOne(newRecipe);
            const createdRecipe = await collection.findOne({ _id: result.insertedId });

            return NextResponse.json({ success: true, data: createdRecipe }, { status: 201 });
        }
    } catch (err) {
        console.error('POST cake recipe error:', err);
        return NextResponse.json({ success: false, error: 'Failed to create/update cake recipe' }, { status: 400 });
    }
}
