// API Route: /api/checkout/session
// Creates a temporary checkout session instead of a permanent order
// This data will be used to create the actual order only after successful payment

export const runtime = 'nodejs';

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { cartItems, shipping, userId, total, deliveryDate } = await req.json();
    
    // Validate required fields
    if (!cartItems || !shipping || !userId || !total) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("cakezone");
    
    // Create a temporary checkout session that expires after 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    
    const sessionData = {
      userId,
      cartItems,
      shipping,
      total,
      deliveryDate,
      status: "checkout_in_progress",
      createdAt: new Date(),
      expiresAt,
    };

    // Insert checkout session
    const result = await db.collection("checkout_sessions").insertOne(sessionData);
    
    return Response.json({ 
      sessionId: result.insertedId,
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return Response.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

// GET method to retrieve checkout session
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");
    
    if (!sessionId) {
      return Response.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("cakezone");
    
    const session = await db.collection("checkout_sessions").findOne({
      _id: new ObjectId(sessionId),
      expiresAt: { $gt: new Date() } // Only return non-expired sessions
    });
    
    if (!session) {
      return Response.json({ error: "Session not found or expired" }, { status: 404 });
    }
    
    return Response.json({ session });
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return Response.json({ error: "Failed to retrieve checkout session" }, { status: 500 });
  }
}