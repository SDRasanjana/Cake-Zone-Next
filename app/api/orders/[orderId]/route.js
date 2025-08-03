// API Route: /api/orders/[orderId]
// Handles updating individual order details like status, payment status, etc.

export const runtime = 'nodejs';

import clientPromise from "@/lib/mongodb";
import { ObjectId } from 'mongodb';

// GET individual order by ID
export async function GET(req, { params }) {
    try {
        const { orderId } = params;

        if (!orderId || !ObjectId.isValid(orderId)) {
            return new Response(
                JSON.stringify({ error: "Invalid order ID" }),
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("cakezone");

        const order = await db.collection("orders").findOne({
            _id: new ObjectId(orderId)
        });

        if (!order) {
            return new Response(
                JSON.stringify({ error: "Order not found" }),
                { status: 404 }
            );
        }

        return new Response(JSON.stringify({ order }), { status: 200 });
    } catch (error) {
        console.error("Get Order API Error:", error);
        return new Response(
            JSON.stringify({ error: "Failed to fetch order" }),
            { status: 500 }
        );
    }
}

// PATCH update order status and other fields
export async function PATCH(req, { params }) {
    try {
        const { orderId } = params;
        const updates = await req.json();

        if (!orderId || !ObjectId.isValid(orderId)) {
            return new Response(
                JSON.stringify({ error: "Invalid order ID" }),
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("cakezone");

        // Prepare update object
        const updateFields = {
            updatedAt: new Date()
        };

        // Add allowed fields to update
        const allowedFields = ['status', 'paymentStatus', 'deliveryDate', 'specialInstructions'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                updateFields[field] = updates[field];
            }
        });

        const result = await db.collection("orders").updateOne(
            { _id: new ObjectId(orderId) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return new Response(
                JSON.stringify({ error: "Order not found" }),
                { status: 404 }
            );
        }

        // Fetch updated order
        const updatedOrder = await db.collection("orders").findOne({
            _id: new ObjectId(orderId)
        });

        return new Response(
            JSON.stringify({
                message: "Order updated successfully",
                order: updatedOrder
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Update Order API Error:", error);
        return new Response(
            JSON.stringify({ error: "Failed to update order" }),
            { status: 500 }
        );
    }
}

// DELETE order (optional - for admin use)
export async function DELETE(req, { params }) {
    try {
        const { orderId } = params;

        if (!orderId || !ObjectId.isValid(orderId)) {
            return new Response(
                JSON.stringify({ error: "Invalid order ID" }),
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("cakezone");

        const result = await db.collection("orders").deleteOne({
            _id: new ObjectId(orderId)
        });

        if (result.deletedCount === 0) {
            return new Response(
                JSON.stringify({ error: "Order not found" }),
                { status: 404 }
            );
        }

        return new Response(
            JSON.stringify({ message: "Order deleted successfully" }),
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete Order API Error:", error);
        return new Response(
            JSON.stringify({ error: "Failed to delete order" }),
            { status: 500 }
        );
    }
}
