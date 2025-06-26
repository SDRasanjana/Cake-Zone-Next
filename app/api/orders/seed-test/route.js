// API endpoint to seed test order data
import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {        // Connect to MongoDB - specifically to cakezone database
        const client = await clientPromise;
        const db = client.db("cakezone");

        // Get current count of orders
        const currentOrderCount = await db.collection('orders').countDocuments({});
        console.log(`Current order count: ${currentOrderCount}`);

        // Only seed if less than 5 orders exist
        if (currentOrderCount >= 5) {
            return NextResponse.json({
                success: true,
                message: "Database already has orders. No test data added.",
                currentCount: currentOrderCount
            });
        }

        // Create test orders
        const now = new Date();

        // Create orders for current month and previous month
        const testOrders = [
            {
                userId: "test_owner",
                createdAt: now,
                status: "delivered",
                items: [
                    { name: "Chocolate Cake", price: 2500, quantity: 1 },
                    { name: "Strawberry Cake", price: 3000, quantity: 2 }
                ],
                totalAmount: 8500,
                paymentStatus: "paid",
                customer: {
                    name: "Test Customer",
                    email: "test@example.com",
                    phone: "1234567890"
                }
            },
            {
                userId: "test_owner",
                createdAt: new Date(now.getFullYear(), now.getMonth(), 5),
                status: "delivered",
                items: [
                    { name: "Vanilla Cake", price: 2000, quantity: 1 }
                ],
                totalAmount: 2000,
                paymentStatus: "paid",
                customer: {
                    name: "Another Customer",
                    email: "another@example.com",
                    phone: "0987654321"
                }
            },
            {
                userId: "test_owner",
                createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 15),
                status: "delivered",
                items: [
                    { name: "Red Velvet Cake", price: 3500, quantity: 1 }
                ],
                totalAmount: 3500,
                paymentStatus: "paid",
                customer: {
                    name: "Past Customer",
                    email: "past@example.com",
                    phone: "5555555555"
                }
            },
            {
                userId: "test_owner",
                createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 20),
                status: "delivered",
                items: [
                    { name: "Birthday Cake", price: 4000, quantity: 1 }
                ],
                totalAmount: 4000,
                paymentStatus: "paid",
                customer: {
                    name: "Test Customer",
                    email: "test@example.com",
                    phone: "1234567890"
                }
            }
        ];

        // Insert test orders
        const result = await db.collection('orders').insertMany(testOrders);

        return NextResponse.json({
            success: true,
            message: "Test data added successfully",
            addedCount: result.insertedCount,
            newTotal: currentOrderCount + result.insertedCount
        });

    } catch (error) {
        console.error('Error seeding test data:', error);
        return NextResponse.json(
            {
                error: 'Failed to seed test data: ' + error.message
            },
            { status: 500 }
        );
    }
}
