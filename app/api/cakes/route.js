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
    const { name, price, image, rating, description } = body;
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error adding cake", error: error.message }, { status: 500 });
  }
}
