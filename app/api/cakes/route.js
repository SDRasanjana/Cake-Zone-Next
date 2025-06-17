import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

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

// You can add POST, PUT, DELETE handlers here for admin functionality
