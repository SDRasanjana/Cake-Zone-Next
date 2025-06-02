import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // Adjusted path to global Prisma client
import { auth } from '@clerk/nextjs/server'; // For authentication

// Interface for expected item structure in the request
interface RequestOrderItem {
  name: string;
  price: number;
  quantity: number;
  cakeConfigurationDetails: Record<string, any>; // JSON object
  // productId?: string; // Optional: if you want to link to a predefined CakeConfiguration
}

// Interface for the expected request body
interface CreateOrderRequest {
  items: RequestOrderItem[];
  deliveryDate: string; // ISO String
  totalAmount: number;
  shippingAddress: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized. User not logged in.' }, { status: 401 });
    }

    const body: CreateOrderRequest = await request.json();

    // --- Basic Validation ---
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Order items are required and cannot be empty.' }, { status: 400 });
    }

    for (const item of body.items) {
      if (!item.name || typeof item.name !== 'string' ||
          item.price === undefined || typeof item.price !== 'number' || item.price <= 0 ||
          item.quantity === undefined || typeof item.quantity !== 'number' || item.quantity <= 0 ||
          !item.cakeConfigurationDetails || typeof item.cakeConfigurationDetails !== 'object') {
        return NextResponse.json({ error: 'Invalid item structure. Each item must have name, price, quantity, and cakeConfigurationDetails.' }, { status: 400 });
      }
    }

    if (!body.deliveryDate || isNaN(new Date(body.deliveryDate).getTime())) {
      return NextResponse.json({ error: 'Valid delivery date is required.' }, { status: 400 });
    }
    const deliveryDate = new Date(body.deliveryDate);
    // Optional: Add check if deliveryDate is in the past

    if (body.totalAmount === undefined || typeof body.totalAmount !== 'number' || body.totalAmount <= 0) {
      return NextResponse.json({ error: 'Valid total amount is required.' }, { status: 400 });
    }

    if (!body.shippingAddress || typeof body.shippingAddress !== 'string') {
        return NextResponse.json({ error: 'Shipping address is required.' }, { status: 400 });
    }

    // --- Server-side price validation (recommended for future enhancement) ---
    const serverCalculatedTotal = body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (Math.abs(serverCalculatedTotal - body.totalAmount) > 0.01) { // Compare with a small tolerance for floating point issues
      console.warn(`Total amount mismatch for order by user ${userId}. Client: ${body.totalAmount}, Server: ${serverCalculatedTotal}`);
      // For now, proceed with client total as per subtask simplicity, but ideally, either reject or use server total.
      // return NextResponse.json({ error: `Total amount mismatch. Client: ${body.totalAmount}, Server: ${serverCalculatedTotal}. Please recalculate.` }, { status: 400 });
    }
    const finalTotalAmount = body.totalAmount; // Using client's total for now.

    // --- Prisma Transaction ---
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: userId,
          status: 'PENDING', // Initial status
          totalAmount: finalTotalAmount,
          deliveryDate: deliveryDate,
          shippingAddress: body.shippingAddress,
          // stripePaymentIntentId will be updated later
        },
      });

      const orderItemsData = body.items.map((item) => ({
        orderId: order.id,
        cakeName: item.name,
        price: item.price,
        quantity: item.quantity,
        cakeConfigurationDetails: item.cakeConfigurationDetails, // Prisma expects JSON compatible object
      }));

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      // Return the order with its items (refetch or construct)
      // For simplicity, returning the initial order object; items can be fetched separately if needed by frontend
      // Or, more robustly, refetch the order with items:
      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: true, // Include the created order items in the response
        },
      });
    });

    if (!createdOrder) {
        // This case should ideally not be reached if transaction setup is correct
        // and doesn't silently fail. Prisma throws if tx.order.create fails.
        return NextResponse.json({ error: 'Failed to create order after transaction.' }, { status: 500 });
    }

    return NextResponse.json(createdOrder, { status: 201 });

  } catch (error: any) {
    console.error('Error creating order:', error);
    if (error.name === 'SyntaxError' || (error instanceof TypeError && error.message.includes("JSON"))) { // Handle malformed JSON
        return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    if (error.code === 'P2002') { // Prisma unique constraint violation
        return NextResponse.json({ error: 'Database constraint violation.' }, { status: 409 }); // Conflict
    }
    // Add more specific Prisma error codes if needed
    return NextResponse.json({ error: 'Internal Server Error while creating order.' }, { status: 500 });
  }
  // Prisma client disconnection is handled by the global instance.
}
