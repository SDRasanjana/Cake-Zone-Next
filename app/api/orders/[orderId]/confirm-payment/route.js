// API Route: /api/orders/[orderId]/confirm-payment
// Marks an order as paid after Stripe payment is successful
// Updates paymentStatus and saves paymentIntentId

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req, { params }) {
  const { paymentIntentId } = await req.json();
  const { orderId } = params;
  const client = await clientPromise;
  const db = client.db();
  // Update the order as paid using the native MongoDB driver
  await db.collection("orders").updateOne(
    { _id: new ObjectId(orderId) },
    {
      $set: {
        paymentStatus: "paid",
        paymentIntentId,
        updatedAt: new Date(),
      },
    }
  );
  return Response.json({ success: true });
}
// Note: This version does not use Mongoose models, but updates the same structure.
