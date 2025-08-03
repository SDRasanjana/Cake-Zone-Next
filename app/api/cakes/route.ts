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

// PATCH: Update cake price (for cake pricing system) - SAFE MODE
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    console.log("API: Updating cake price:", body);
    
    const { action, cakeName, newPrice, category, costBreakdown, profitMargin } = body;
    
    // Validate action
    if (action !== "updatePrice") {
      return NextResponse.json({ 
        error: "Invalid action", 
        validActions: ["updatePrice"] 
      }, { status: 400 });
    }
    
    // Validate required fields
    if (!cakeName || newPrice === undefined || newPrice === null) {
      return NextResponse.json({ 
        error: "Missing required fields",
        required: ["cakeName", "newPrice"] 
      }, { status: 400 });
    }
    
    // Validate price is positive number
    if (typeof newPrice !== 'number' || newPrice <= 0 || isNaN(newPrice)) {
      return NextResponse.json({ 
        error: "Invalid price value",
        message: "Price must be a positive number",
        receivedPrice: newPrice
      }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("cakezone");
    
    // First, check if cake exists before updating
    const filter = { name: { $regex: new RegExp(`^${cakeName}$`, 'i') } };
    if (category) {
      Object.assign(filter, { category: { $regex: new RegExp(`^${category}$`, 'i') } });
    }
    
    const existingCake = await db.collection("cakes").findOne(filter);
    
    if (!existingCake) {
      return NextResponse.json({ 
        error: "Cake not found",
        searchCriteria: { cakeName, category },
        message: "No cake matches the provided name and category"
      }, { status: 404 });
    }
    
    // Store previous price for backup/audit
    const previousPrice = existingCake.price;
    
    // Prepare update data with audit trail
    const updateData = { 
      price: newPrice,
      updatedAt: new Date(),
      priceHistory: {
        previousPrice,
        newPrice,
        updatedBy: "pricing_system",
        timestamp: new Date(),
        ...(costBreakdown && { costBreakdown }),
        ...(profitMargin && { profitMargin })
      }
    };
    
    // Add pricing metadata if provided
    if (costBreakdown) {
      Object.assign(updateData, { costBreakdown });
    }
    if (profitMargin) {
      Object.assign(updateData, { profitMargin });
    }
    
    // Perform the update with atomic operation
    const updateResult = await db.collection("cakes").updateOne(
      { _id: existingCake._id },
      { 
        $set: updateData
      }
    );
    
    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ 
        error: "Update failed",
        message: "No changes were made to the database"
      }, { status: 500 });
    }
    
    console.log(`API: Successfully updated cake "${cakeName}" price from ${previousPrice} to ${newPrice}`);
    
    return NextResponse.json({ 
      success: true, 
      modifiedCount: updateResult.modifiedCount,
      cakeId: existingCake._id,
      cakeName: existingCake.name,
      previousPrice,
      newPrice,
      timestamp: new Date().toISOString(),
      message: "Price updated successfully"
    });
    
  } catch (error) {
    console.error("API: Error updating cake price:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
