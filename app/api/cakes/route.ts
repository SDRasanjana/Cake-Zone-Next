import { NextResponse } from "next/server";
import { ObjectId, MongoClient } from "mongodb";

// Force Node.js runtime to support MongoDB connections
export const runtime = 'nodejs';

// Import with proper typing
const clientPromise: Promise<MongoClient> = import("@/lib/mongodb").then(m => m.default);

export async function GET() {
  try {
    console.log("API: Fetching cakes from database");
    const client = await clientPromise;
    const db = client.db("cakezone"); // Use lowercase database name to match existing data
    
    // Fetch all cakes from the cakes collection (plural to match Mongoose model)
    const cakes = await db.collection("cakes").find({}).toArray();
    
    console.log(`API: Found ${cakes.length} cakes in database`);
    return NextResponse.json(cakes);
  } catch (error) {
    console.error("API: Error fetching cakes:", error);
    
    // Return error instead of fallback data to see the real database issue
    return NextResponse.json({ 
      error: "Database connection failed", 
      message: error instanceof Error ? error.message : "Unknown error",
      cakes: [] 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("API: Creating new cake:", body);
    
    const client = await clientPromise;
    const db = client.db("cakezone"); // Use lowercase database name to match existing data
    
    // Insert new cake into the cakes collection (plural to match Mongoose model)
    const result = await db.collection("cakes").insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log("API: Cake created with ID:", result.insertedId);
    return NextResponse.json({ _id: result.insertedId, ...body });
  } catch (error) {
    console.error("API: Error creating cake:", error);
    return NextResponse.json({ error: "Failed to create cake" }, { status: 500 });
  }
}
