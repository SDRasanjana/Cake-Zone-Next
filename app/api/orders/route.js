// API Route: /api/orders
// Handles order creation (cart, shipping, user info) before payment
// Saves order to MongoDB and returns the orderId
// Also handles fetching orders by userId for order history

// Force Node.js runtime to support MongoDB connections
export const runtime = 'nodejs';

import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  // Get deliveryDate from request body
  const { cartItems, shipping, userId, total, deliveryDate } = await req.json();
  const client = await clientPromise;
  const db = client.db("cakezone"); // Use correct database name
  // Insert the order document using the native MongoDB driver
  const result = await db.collection("orders").insertOne({
    userId,
    items: cartItems,
    shipping,
    total,
    deliveryDate, // Store delivery date in DB
    status: "pending", // Main status field
    paymentStatus: "pending", // Payment specific status
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return Response.json({ orderId: result.insertedId });
}

// Add GET handler to fetch orders
// If userId is provided, fetch orders for that user
// If admin=true is provided, fetch all orders, total users, and active users
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const admin = searchParams.get("admin");
    const client = await clientPromise;
    const db = client.db("cakezone"); // Use correct database name

    if (admin === "true") {
      // Fetch all orders for admin dashboard
      const orders = await db
        .collection("orders")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      // Transform orders to match frontend interface
      const transformedOrders = orders.map(order => ({
        id: order._id.toString(),
        userId: order.userId,
        items: order.items || [], // Preserve complete items array with imageUri
        customerName: order.shipping?.fullName || order.shipping?.firstName + ' ' + order.shipping?.lastName || 'Unknown Customer',
        customerPhone: order.shipping?.phone || 'N/A',
        customerEmail: order.shipping?.email || 'N/A',
        cake: order.items?.[0]?.name || 'Unknown Cake',
        cakeSize: order.items?.[0]?.size || 'Unknown Size',
        quantity: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 1,
        specialInstructions: order.shipping?.specialInstructions || order.items?.[0]?.specialInstructions || '',
        amount: order.total || 0,
        orderDate: order.createdAt || new Date(),
        deliveryDate: order.deliveryDate || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
        deliveryAddress: `${order.shipping?.address || ''}, ${order.shipping?.city || ''}, ${order.shipping?.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'N/A',
        paymentMethod: order.paymentMethod || 'Unknown',
        paymentStatus: order.paymentStatus || 'pending',
        status: order.status || 'pending',
        urgentOrder: order.urgentOrder || false,
        shipping: order.shipping, // Preserve shipping info
        total: order.total || 0, // Add total field
        createdAt: order.createdAt || new Date(),
      }));

      // Fetch total users (assuming users are in 'users' collection)
      const totalUsers = await db.collection("users").countDocuments();

      // Fetch active users (users with at least one order)
      const activeUserIds = await db.collection("orders").distinct("userId");
      const activeUsers = activeUserIds.length;

      // Return all orders, total users, and active users
      return new Response(
        JSON.stringify({ orders: transformedOrders, totalUsers, activeUsers }),
        { status: 200 }
      );
    }

    // Default: fetch orders for a specific user
    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
    }
    const orders = await db
      .collection("orders")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    // Remove sensitive fields if any
    return new Response(JSON.stringify({ orders }), { status: 200 });
  } catch (error) {
    console.error("Orders API Error:", error);

    // Return error response instead of fallback data
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get("admin");

    if (admin === "true") {
      return new Response(
        JSON.stringify({
          error: "Database connection failed",
          orders: [],
          totalUsers: 0,
          activeUsers: 0
        }),
        { status: 500 }
      );
    } else {
      return new Response(
        JSON.stringify({
          error: "Database connection failed",
          orders: []
        }),
        { status: 500 }
      );
    }
  }
}

// Note: This version does not use Mongoose models, but stores the same structure.
