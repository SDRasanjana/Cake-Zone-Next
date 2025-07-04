import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request, { params }) {
  const { id } = params;
  try {
    const client = await clientPromise;
    const db = client.db(); // uses default DB from URI
    // Find the cake by _id (convert to ObjectId)
    const cake = await db.collection("cakes").findOne({ _id: new ObjectId(id) });
    if (!cake) {
      return NextResponse.json({ message: "Cake not found" }, { status: 404 });
    }
    return NextResponse.json(cake);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching cake", error: error.message }, { status: 500 });
  }
}

// PUT: Update a cake by ID (admin only)
export async function PUT(req, { params }) {
  try {
    // Defensive: support both route segment param and query param fallback
    let id = params?.id;
    // Some Next.js edge runtimes pass params as an array
    if (Array.isArray(id)) id = id[0];
    if (!id || typeof id !== "string" || id.length !== 24 || !/^[a-fA-F0-9]{24}$/.test(id)) {
      return NextResponse.json({ message: "Invalid or missing cake id", id }, { status: 400 });
    }
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db();
    // Remove _id from body if present (MongoDB does not allow updating _id)
    if (body._id) delete body._id;
    let result;
    try {
      result = await db.collection("cakes").updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...body, updatedAt: new Date() } }
      );
    } catch (err) {
      return NextResponse.json({ message: "MongoDB update error", error: err?.message, id, body }, { status: 500 });
    }
    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Cake not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Cake updated" });
  } catch (error) {
    return NextResponse.json({ message: "Error updating cake", error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a cake by ID (admin only)
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("cakes").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Cake not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Cake deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting cake", error: error.message }, { status: 500 });
  }
}
