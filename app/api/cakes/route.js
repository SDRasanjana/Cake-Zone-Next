import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET: Fetch all cakes
export async function GET() {
  try {
    console.log("API: Starting to fetch cakes from database...");

    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI is not configured");
      return NextResponse.json({
        message: "Database connection not configured",
        error: "MONGODB_URI environment variable is missing"
      }, { status: 500 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Fetch all cakes from the 'cakes' collection
    const cakes = await db.collection("cakes").find({}).toArray();
    console.log("API: Successfully fetched", cakes.length, "cakes");

    // Transform the data to ensure consistent structure
    const transformedCakes = cakes.map(cake => ({
      _id: cake._id,
      name: cake.name,
      price: cake.price,
      image: cake.image,
      rating: cake.rating || 4.5,
      description: cake.description || "",
      category: cake.category || "",
      stock: cake.stock || 0,
      weight: cake.weight || "",
      ingredients: cake.ingredients || []
    }));

    return NextResponse.json(transformedCakes);
  } catch (error) {
    console.error("API: Error fetching cakes:", error);
    return NextResponse.json({
      message: "Error fetching cakes",
      error: error.message
    }, { status: 500 });
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
