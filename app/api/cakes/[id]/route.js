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
