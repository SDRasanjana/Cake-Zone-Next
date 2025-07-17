import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Force Node.js runtime to support MongoDB connections
export const runtime = 'nodejs';

export async function GET(request, { params }) {
  const { id } = await params; // Await params for Next.js 15 compatibility
  try {
    console.log("API: Fetching cake with ID:", id);

    // Validate the ID format
    if (!id || typeof id !== "string" || id.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json({ message: "Invalid cake ID format" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("cakezone"); // Use correct database name

    // Find the cake by _id (convert to ObjectId) - use "cakes" collection (plural to match main API)
    const cake = await db.collection("cakes").findOne({ _id: new ObjectId(id) });

    if (!cake) {
      return NextResponse.json({ message: "Cake not found" }, { status: 404 });
    }

    console.log("API: Successfully fetched cake:", cake.name);

    // Transform the data to ensure consistent structure
    const transformedCake = {
      _id: cake._id,
      name: cake.name,
      price: cake.price,
      image: cake.image,
      rating: cake.rating || 4.5,
      description: cake.description || "",
      category: cake.category || "",
      stock: cake.stock || 0,
      weight: cake.weight || "",
      ingredients: cake.ingredients || [],
      createdAt: cake.createdAt,
      updatedAt: cake.updatedAt,
      // For single cake view, we only have one image but we can structure it as array for consistency
      images: cake.images || [cake.image],
      // Add some related cakes (this could be enhanced with actual related product logic)
      relatedCakes: []
    };

    return NextResponse.json(transformedCake);
  } catch (error) {
    console.error("API: Error fetching cake:", error);
    return NextResponse.json({
      message: "Error fetching cake",
      error: error.message
    }, { status: 500 });
  }
}

// PUT: Update a cake by ID (admin only)
export async function PUT(req, { params }) {
  try {
    const awaitedParams = await params; // Await params for Next.js 15 compatibility
    console.log("API: Updating cake with params:", awaitedParams);
    
    // Defensive: support both route segment param and query param fallback
    let id = awaitedParams?.id;
    // Some Next.js edge runtimes pass params as an array
    if (Array.isArray(id)) id = id[0];
    
    console.log("API: Extracted ID:", id);
    
    if (!id || typeof id !== "string" || id.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(id)) {
      console.error("API: Invalid cake ID:", id);
      return NextResponse.json({ message: "Invalid or missing cake id", id }, { status: 400 });
    }
    
    const body = await req.json();
    console.log("API: Update body:", body);
    
    const client = await clientPromise;
    const db = client.db("cakezone"); // Use correct database name
    
    // Remove _id from body if present (MongoDB does not allow updating _id)
    if (body._id) delete body._id;
    
    let result;
    try {
      result = await db.collection("cakes").updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...body, updatedAt: new Date() } }
      );
      console.log("API: Update result:", result);
    } catch (err) {
      console.error("API: MongoDB update error:", err);
      return NextResponse.json({ message: "MongoDB update error", error: err?.message, id, body }, { status: 500 });
    }
    
    if (result.matchedCount === 0) {
      console.error("API: Cake not found for update:", id);
      return NextResponse.json({ message: "Cake not found" }, { status: 404 });
    }
    
    console.log("API: Cake updated successfully:", id);
    return NextResponse.json({ message: "Cake updated successfully", id });
  } catch (error) {
    console.error("API: Error updating cake:", error);
    return NextResponse.json({ message: "Error updating cake", error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a cake by ID (admin only)
export async function DELETE(req, { params }) {
  try {
    const awaitedParams = await params; // Await params for Next.js 15 compatibility
    console.log("API: Deleting cake with params:", awaitedParams);
    
    const { id } = awaitedParams;
    console.log("API: Deleting cake with ID:", id);
    
    if (!id || typeof id !== "string" || id.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(id)) {
      console.error("API: Invalid cake ID for delete:", id);
      return NextResponse.json({ message: "Invalid cake ID format" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("cakezone"); // Use correct database name
    const result = await db.collection("cakes").deleteOne({ _id: new ObjectId(id) });
    
    console.log("API: Delete result:", result);
    
    if (result.deletedCount === 0) {
      console.error("API: Cake not found for delete:", id);
      return NextResponse.json({ message: "Cake not found" }, { status: 404 });
    }
    
    console.log("API: Cake deleted successfully:", id);
    return NextResponse.json({ message: "Cake deleted successfully", id });
  } catch (error) {
    console.error("API: Error deleting cake:", error);
    return NextResponse.json({ message: "Error deleting cake", error: error.message }, { status: 500 });
  }
}
