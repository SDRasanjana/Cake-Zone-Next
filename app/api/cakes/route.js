import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET: Fetch all cakes
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    // Fetch all cakes from the 'cakes' collection
    const cakes = await db.collection("cakes").find({}).toArray();
    return NextResponse.json(cakes);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching cakes", error: error.message }, { status: 500 });
  }
}

// POST: Add a new predefined cake to the cakes collection (admin only)
export async function POST(req) {
  try {
    const body = await req.json();
    // Validate required fields
    const { name, price, image, rating, description, category, stock, weight, ingredients } = body;
    if (!name || !price || !image) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("cakes").insertOne({
      name,
      price,
      image,
      rating: rating || 0,
      description: description || "",
      category: category || "",
      stock: stock || 0,
      weight: weight || "",
      ingredients: ingredients || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error adding cake", error: error.message }, { status: 500 });
  }
}

// PATCH: Update cake prices based on ingredient cost changes
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { priceUpdates } = body; // Array of { name, newPrice }

    if (!priceUpdates || !Array.isArray(priceUpdates)) {
      return NextResponse.json({ message: "Invalid price updates format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const cakesCollection = db.collection("cakes");

    const updateResults = [];

    // Update each cake price
    for (const update of priceUpdates) {
      const { name, newPrice } = update;

      if (!name || typeof newPrice !== 'number' || newPrice <= 0) {
        continue; // Skip invalid updates
      }

      const result = await cakesCollection.updateOne(
        { name: { $regex: new RegExp(name, 'i') } }, // Case-insensitive name match
        {
          $set: {
            price: newPrice,
            updatedAt: new Date(),
            lastPriceUpdate: new Date(),
            priceUpdateReason: "Ingredient cost change"
          }
        }
      );

      updateResults.push({
        cakeName: name,
        newPrice: newPrice,
        matched: result.matchedCount > 0,
        modified: result.modifiedCount > 0
      });
    }

    return NextResponse.json({
      message: "Price updates processed",
      results: updateResults,
      totalUpdated: updateResults.filter(r => r.modified).length
    });

  } catch (error) {
    return NextResponse.json({
      message: "Error updating cake prices",
      error: error.message
    }, { status: 500 });
  }
}
