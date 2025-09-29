// API Route: /api/checkout/complete
// Converts a checkout session into a permanent order after successful payment

export const runtime = 'nodejs';

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { sessionId, paymentIntentId } = await req.json();
    
    if (!sessionId || !paymentIntentId) {
      return Response.json({ error: "Missing sessionId or paymentIntentId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("cakezone");
    
    // Get checkout session
    const session = await db.collection("checkout_sessions").findOne({
      _id: new ObjectId(sessionId),
      expiresAt: { $gt: new Date() }
    });
    
    if (!session) {
      return Response.json({ error: "Session not found or expired" }, { status: 404 });
    }

    // Create the actual order now that payment is successful
    const orderData = {
      userId: session.userId,
      items: session.cartItems,
      shipping: session.shipping,
      total: session.total,
      deliveryDate: session.deliveryDate,
      status: "paid", // Order is paid immediately
      paymentStatus: "paid", // Payment confirmed
      paymentIntentId: paymentIntentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert the actual order
    const orderResult = await db.collection("orders").insertOne(orderData);
    
    // Delete the checkout session since it's no longer needed
    await db.collection("checkout_sessions").deleteOne({
      _id: new ObjectId(sessionId)
    });
    
    return Response.json({ 
      orderId: orderResult.insertedId,
      message: "Order created successfully"
    });
  } catch (error) {
    console.error("Error completing checkout:", error);
    return Response.json({ error: "Failed to complete checkout" }, { status: 500 });
  }
}