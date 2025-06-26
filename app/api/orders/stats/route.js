// API Route: /api/orders/stats
// Handles GET requests to fetch order statistics for the dashboard

import { NextResponse } from 'next/server';
import clientPromise from "@/lib/mongodb";

export async function GET() {
    try {
        // Print debug information
        console.log("Starting order stats API request...");        // Connect to the database using client promise
        const client = await clientPromise;
        const db = client.db("cakezone"); // Explicitly connect to "cakezone" database

        console.log("Connected to MongoDB cakezone database");

        // Get collections info to debug
        const collections = await db.listCollections().toArray();
        console.log("Available collections:", collections.map(c => c.name));

        // Get current date
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Get first day of current month
        const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);

        // Get first day of previous month
        const startOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1);

        // Get first day of next month (end of current month)
        const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 1);

        console.log("Date ranges:", {
            startOfCurrentMonth: startOfCurrentMonth.toISOString(),
            endOfCurrentMonth: endOfCurrentMonth.toISOString(),
            startOfPreviousMonth: startOfPreviousMonth.toISOString(),
        });        // Direct query to get all orders from 'orders' collection
        console.log("Fetching all orders from cakezone.orders collection");

        // Check if orders collection exists
        const hasOrdersCollection = collections.some(c => c.name === 'orders');
        if (!hasOrdersCollection) {
            console.error("Orders collection not found in cakezone database");
            throw new Error("Orders collection not found in the database");
        }

        const orders = await db.collection('orders').find({}).toArray();
        console.log(`Found ${orders.length} total orders in cakezone.orders`);

        // Log first order to verify structure
        if (orders.length > 0) {
            console.log("First order _id:", orders[0]._id);
            console.log("First order sample structure keys:", Object.keys(orders[0]));
        }
        // Function to extract date from an order with better logging
        function extractOrderDate(order) {
            // Check each possible date field
            if (order.createdAt) {
                const date = new Date(order.createdAt);
                if (!isNaN(date.getTime())) return date;
            }
            if (order.created_at) {
                const date = new Date(order.created_at);
                if (!isNaN(date.getTime())) return date;
            }
            if (order.date) {
                const date = new Date(order.date);
                if (!isNaN(date.getTime())) return date;
            }
            if (order.orderDate) {
                const date = new Date(order.orderDate);
                if (!isNaN(date.getTime())) return date;
            }
            if (order.timestamp) {
                const date = new Date(order.timestamp);
                if (!isNaN(date.getTime())) return date;
            }

            // If we get here, no valid date field was found
            console.log("No valid date field found for order:", order._id,
                "Available fields:", Object.keys(order));
            return null;
        }

        // Get orders for current month
        const currentMonthOrders = orders.filter(order => {
            const orderDate = extractOrderDate(order);
            return orderDate && orderDate >= startOfCurrentMonth && orderDate < endOfCurrentMonth;
        });

        // Get orders for previous month
        const previousMonthOrders = orders.filter(order => {
            const orderDate = extractOrderDate(order);
            return orderDate && orderDate >= startOfPreviousMonth && orderDate < startOfCurrentMonth;
        });

        console.log(`Found ${currentMonthOrders.length} orders for current month and ${previousMonthOrders.length} for previous month`);        // Enhanced function to extract total amount from orders with better logging
        function extractTotalAmount(order) {
            // First check for direct totalAmount fields
            if (order.totalAmount !== undefined) {
                if (typeof order.totalAmount === 'number') {
                    return order.totalAmount;
                } else if (typeof order.totalAmount === 'string') {
                    const parsed = parseFloat(order.totalAmount.replace(/[^\d.-]/g, ''));
                    if (!isNaN(parsed)) return parsed;
                }
            }

            if (order.total !== undefined) {
                if (typeof order.total === 'number') {
                    return order.total;
                } else if (typeof order.total === 'string') {
                    const parsed = parseFloat(order.total.replace(/[^\d.-]/g, ''));
                    if (!isNaN(parsed)) return parsed;
                }
            }

            // If we have items array, calculate from items
            if (order.items && Array.isArray(order.items)) {
                try {
                    const itemsTotal = order.items.reduce((sum, item) => {
                        let itemPrice = 0;
                        // Try to get price from various fields
                        if (item.price !== undefined) {
                            itemPrice = typeof item.price === 'number' ?
                                item.price : parseFloat(String(item.price).replace(/[^\d.-]/g, ''));
                        } else if (item.amount !== undefined) {
                            itemPrice = typeof item.amount === 'number' ?
                                item.amount : parseFloat(String(item.amount).replace(/[^\d.-]/g, ''));
                        }

                        const quantity = item.quantity !== undefined ?
                            (typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1) : 1;

                        if (!isNaN(itemPrice)) {
                            return sum + (itemPrice * quantity);
                        }
                        return sum;
                    }, 0);

                    if (itemsTotal > 0) {
                        return itemsTotal;
                    }
                } catch (err) {
                    console.error("Error calculating items total for order:", order._id, err);
                }
            }

            // Check other possible field names as fallback
            const possibleFields = ['amount', 'price', 'orderTotal', 'value', 'subtotal', 'grandTotal'];
            for (const field of possibleFields) {
                if (order[field] !== undefined) {
                    if (typeof order[field] === 'number') {
                        return order[field];
                    } else if (typeof order[field] === 'string') {
                        const parsed = parseFloat(order[field].replace(/[^\d.-]/g, ''));
                        if (!isNaN(parsed)) return parsed;
                    }
                }
            }

            console.log("Could not extract total for order:", order._id, "Available fields:", Object.keys(order));
            return 0;
        }// Log all orders for debugging
        if (orders.length > 0) {
            console.log("First order sample:", JSON.stringify(orders[0], null, 2));
        }

        // Calculate stats with detailed logging
        const totalOrderCount = orders.length;

        // Calculate total order value with item logging
        let totalOrderValue = 0;
        for (const order of orders) {
            const amount = extractTotalAmount(order);
            totalOrderValue += amount;
            if (amount > 0) {
                console.log(`Order ${order._id} value: ${amount}`);
            }
        }

        const currentMonthOrderCount = currentMonthOrders.length;
        const currentMonthOrderValue = currentMonthOrders.reduce((total, order) => total + extractTotalAmount(order), 0);
        const previousMonthOrderCount = previousMonthOrders.length;
        const previousMonthOrderValue = previousMonthOrders.reduce((total, order) => total + extractTotalAmount(order), 0);

        // Calculate percentage changes
        let orderValueChange = 0;
        let orderCountChange = 0;

        if (previousMonthOrderValue > 0) {
            orderValueChange = ((currentMonthOrderValue - previousMonthOrderValue) / previousMonthOrderValue) * 100;
        } else if (currentMonthOrderValue > 0) {
            orderValueChange = 100; // If no previous month orders but we have current orders, that's 100% increase
        }

        if (previousMonthOrderCount > 0) {
            orderCountChange = ((currentMonthOrderCount - previousMonthOrderCount) / previousMonthOrderCount) * 100;
        } else if (currentMonthOrderCount > 0) {
            orderCountChange = 100; // If no previous month orders but we have current orders, that's 100% increase
        }

        // We should NOT use sample data unless there are absolutely NO orders at all
        const useSampleData = orders.length === 0;

        console.log("Stats calculated:", {
            totalOrderCount,
            totalOrderValue,
            currentMonthOrderCount,
            currentMonthOrderValue,
            previousMonthOrderCount,
            previousMonthOrderValue,
            orderValueChange,
            orderCountChange,
            useSampleData
        });        // Only use fallback data if absolutely necessary
        const useSampleFallback = useSampleData;

        const response = {
            totalOrderCount: useSampleFallback ? 110 : totalOrderCount,
            totalOrderValue: useSampleFallback ? 175000 : totalOrderValue,
            currentMonth: {
                name: now.toLocaleString('default', { month: 'long' }),
                orderCount: useSampleFallback ? 28 : currentMonthOrderCount,
                orderValue: useSampleFallback ? 45000 : currentMonthOrderValue
            },
            previousMonth: {
                name: new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' }),
                orderCount: useSampleFallback ? 26 : previousMonthOrderCount,
                orderValue: useSampleFallback ? 40000 : previousMonthOrderValue
            },
            percentageChanges: {
                orderValue: useSampleFallback ? 12.5 : orderValueChange,
                orderCount: useSampleFallback ? 8.2 : orderCountChange
            },
            dataUpdatedAt: new Date().toISOString(),
            source: useSampleFallback ? 'sample' : 'database'
        };

        console.log("Returning response:", response);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching order stats:', error);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Return fallback data in case of error        // Return error with logged details
        console.error("Error details:", error);

        return NextResponse.json(
            {
                error: 'Failed to fetch order statistics: ' + error.message,
                // Provide fallback data for development/testing but mark it clearly as error data
                totalOrderCount: 110,
                totalOrderValue: 175000,
                currentMonth: {
                    name: now.toLocaleString('default', { month: 'long' }),
                    orderCount: 28,
                    orderValue: 45000
                },
                previousMonth: {
                    name: new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' }),
                    orderCount: 26,
                    orderValue: 40000
                },
                percentageChanges: {
                    orderValue: 12.5,
                    orderCount: 8.2
                },
                dataUpdatedAt: new Date().toISOString(),
                source: 'error_fallback'
            },
            { status: 200 } // Return 200 instead of 500 to avoid UI errors
        );
    }
}
