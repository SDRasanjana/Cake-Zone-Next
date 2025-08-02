// API Route: /api/orders
// Handles order creation (cart, shipping, user info) before payment
// Saves order to MongoDB and returns the orderId
// Also handles fetching orders by userId for order history

// Force Node.js runtime to support MongoDB connections
export const runtime = 'nodejs';

import clientPromise from "@/lib/mongodb";

export async function POST(req) {
  try {
    console.log("Orders API: Starting order creation...");
    
    // Get deliveryDate from request body
    const { cartItems, shipping, userId, total, deliveryDate } = await req.json();
    
    console.log("Orders API: Received data:", { 
      cartItemsCount: cartItems?.length, 
      userId, 
      total, 
      deliveryDate,
      hasShipping: !!shipping 
    });
    
    // Validate required fields
    if (!cartItems || cartItems.length === 0) {
      console.error("Orders API: No cart items provided");
      return Response.json({ error: "Cart items are required" }, { status: 400 });
    }
    
    if (!shipping) {
      console.error("Orders API: No shipping information provided");
      return Response.json({ error: "Shipping information is required" }, { status: 400 });
    }
    
    if (!shipping.fullName) {
      console.error("Orders API: Missing customer name");
      return Response.json({ error: "Customer name is required" }, { status: 400 });
    }
    
    if (!shipping.email) {
      console.error("Orders API: Missing customer email");
      return Response.json({ error: "Customer email is required" }, { status: 400 });
    }
    
    if (!total || total <= 0) {
      console.error("Orders API: Invalid total amount:", total);
      return Response.json({ error: "Valid total amount is required" }, { status: 400 });
    }
    
    if (!deliveryDate) {
      console.error("Orders API: Missing delivery date");
      return Response.json({ error: "Delivery date is required" }, { status: 400 });
    }
    
    console.log("Orders API: Attempting to connect to MongoDB...");
    const client = await clientPromise;
    console.log("Orders API: MongoDB client connected successfully");
    
    const db = client.db("cakezone"); // Use correct database name
    console.log("Orders API: Database selected: cakezone");
    
    console.log("Orders API: Connected to database, inserting order...");
    
    // Prepare order document
    const orderDocument = {
      userId,
      items: cartItems,
      shipping,
      total,
      deliveryDate, // Store delivery date in DB
      status: "pending", // Main status field
      paymentStatus: "pending", // Payment specific status
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log("Orders API: Order document prepared:", { 
      userId, 
      itemCount: cartItems.length, 
      total, 
      deliveryDate,
      customerName: shipping.fullName 
    });
    
    // Insert the order document using the native MongoDB driver
    const result = await db.collection("orders").insertOne(orderDocument);
    
    console.log("Orders API: Order created successfully:", result.insertedId);
    
    return Response.json({ orderId: result.insertedId });
  } catch (error) {
    console.error("Orders API: Error creating order:", error);
    return Response.json({ 
      error: "Failed to create order", 
      message: error.message 
    }, { status: 500 });
  }
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

      // Fetch total users (assuming users are in 'users' collection)
      const totalUsers = await db.collection("users").countDocuments();

      // Fetch active users (users with at least one order)
      const activeUserIds = await db.collection("orders").distinct("userId");
      const activeUsers = activeUserIds.length;

      // Return all orders, total users, and active users
      return new Response(
        JSON.stringify({ orders, totalUsers, activeUsers }),
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
