// API Route: /api/orders/[orderId]/confirm-payment
// Marks an order as paid after Stripe payment is successful
// Updates paymentStatus and saves paymentIntentId

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Force Node.js runtime to support MongoDB connections
export const runtime = 'nodejs';

export async function POST(req, { params }) {
  try {
    const awaitedParams = await params; // Await params for Next.js 15 compatibility
    console.log("Confirm Payment API: Starting payment confirmation for order:", awaitedParams.orderId);
    
    const { paymentIntentId } = await req.json();
    const { orderId } = awaitedParams;
    
    if (!orderId) {
      console.error("Confirm Payment API: Missing orderId");
      return Response.json({ error: "Order ID is required" }, { status: 400 });
    }
    
    if (!paymentIntentId) {
      console.error("Confirm Payment API: Missing paymentIntentId");
      return Response.json({ error: "Payment Intent ID is required" }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db("cakezone"); // Use correct database name
    
    // Update the order as paid using the native MongoDB driver
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          paymentStatus: "paid",
          status: "paid", // Also update the main status field
          paymentIntentId,
          updatedAt: new Date(),
        },
      }
    );
    
    console.log("Confirm Payment API: Update result:", result);
    
    if (result.matchedCount === 0) {
      console.error("Confirm Payment API: Order not found:", orderId);
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    
    if (result.modifiedCount === 0) {
      console.error("Confirm Payment API: Order not updated:", orderId);
      return Response.json({ error: "Order status not updated" }, { status: 500 });
    }
    
    console.log("Confirm Payment API: Order successfully updated to paid:", orderId);
    return Response.json({ 
      success: true, 
      message: "Order status updated to paid successfully",
      orderId,
      paymentIntentId 
    });
    
  } catch (error) {
    console.error("Confirm Payment API: Error updating order status:", error);
    return Response.json({ 
      error: "Failed to update order status", 
      message: error.message 
    }, { status: 500 });
  }
}
