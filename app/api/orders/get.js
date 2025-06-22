// API Route: /api/orders
// Handles GET requests to fetch orders for a specific user
// Usage: /api/orders?userId=USER_ID

import clientPromise from "@/lib/mongodb";

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
