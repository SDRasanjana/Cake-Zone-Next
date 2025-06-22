// API Route: /api/orders
// Handles order creation (cart, shipping, user info) before payment
// Saves order to MongoDB and returns the orderId
// Also handles fetching orders by userId for order history

import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  const { cartItems, shipping, userId, total } = await req.json();
  const client = await clientPromise;
  const db = client.db();
  // Insert the order document using the native MongoDB driver
  const result = await db.collection("orders").insertOne({
    userId,
    items: cartItems,
    shipping,
    total,
    paymentStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return Response.json({ orderId: result.insertedId });
}

// Add GET handler to fetch orders by userId
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
  }
  const client = await clientPromise;
  const db = client.db();
  const orders = await db
    .collection("orders")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
  // Remove sensitive fields if any
  return new Response(JSON.stringify({ orders }), { status: 200 });
}

// Note: This version does not use Mongoose models, but stores the same structure.
