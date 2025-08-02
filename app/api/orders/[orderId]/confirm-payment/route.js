// API Route: /api/orders/[orderId]/confirm-payment
// Marks an order as paid after Stripe payment is successful
// Updates paymentStatus and saves paymentIntentId
// Creates admin notification when order is successfully placed

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { createOrderNotification } from "@/lib/services/notificationService";

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
    
    // First, get the order details for notification
    const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });
    
    if (!order) {
      console.error("Confirm Payment API: Order not found:", orderId);
      return Response.json({ error: "Order not found" }, { status: 404 });
    }
    
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

    // Create admin notification for successful order placement
    try {
      const orderData = {
        orderId: orderId,
        userId: order.userId,
        customerName: order.shipping?.fullName,
        total: order.total,
        items: order.items || []
      };

      const notificationResult = await createOrderNotification(orderData);
      
      if (notificationResult.success) {
        console.log('Admin notification created successfully for order:', orderId);
      } else {
        console.error('Failed to create admin notification:', notificationResult.error);
      }
    } catch (notificationError) {
      // Don't fail the payment confirmation if notification creation fails
      console.error('Failed to create admin notification:', notificationError);
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
// Note: This version does not use Mongoose models, but updates the same structure.
