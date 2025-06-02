import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma'; // Adjusted path
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
// Ensure STRIPE_SECRET_KEY is set in your .env file
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('FATAL ERROR: STRIPE_SECRET_KEY is not set.');
  // In a real app, you might want to prevent startup or throw a more specific error.
  // For now, this log will indicate the critical issue.
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Use the latest API version
  typescript: true,
});

interface CreatePaymentIntentRequest {
  orderId: string;
}

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Stripe secret key not configured, cannot process payments.');
    return NextResponse.json({ error: 'Payment processing is not configured.' }, { status: 500 });
  }

  try {
    const { userId: authenticatedUserId } = auth();
    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'Unauthorized. User not logged in.' }, { status: 401 });
    }

    const body: CreatePaymentIntentRequest = await request.json();
    const { orderId } = body;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Order ID is required and must be a string.' }, { status: 400 });
    }

    // Fetch the order from the database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Verify ownership
    if (order.userId !== authenticatedUserId) {
      return NextResponse.json({ error: 'Forbidden. You do not own this order.' }, { status: 403 });
    }

    // Check order status - e.g., only "PENDING" orders can create a payment intent
    if (order.status !== 'PENDING') {
      return NextResponse.json({
        error: `Order status is "${order.status}". Payment can only be processed for PENDING orders.`
      }, { status: 400 });
    }

    // Amount must be in the smallest currency unit (e.g., cents)
    // Assuming order.totalAmount is in dollars, convert to cents
    const amountInSmallestUnit = Math.round(order.totalAmount * 100);
    if (amountInSmallestUnit <= 0) {
        return NextResponse.json({ error: 'Order total amount must be positive to create a payment intent.' }, { status: 400});
    }


    let paymentIntent;

    // If a paymentIntentId already exists on the order, try to retrieve and update it if possible,
    // or create a new one if the old one cannot be used (e.g. if it has failed or expired).
    // For simplicity here, we'll update if status allows, otherwise create new.
    // More advanced logic would check paymentIntent.status.
    if (order.stripePaymentIntentId) {
        try {
            paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
            // Check if it can be updated (e.g. if amount changed or still valid)
            // For simplicity, if it exists and amount is same, return it. If amount differs, create new.
            // A real scenario might involve more complex logic, like voiding old one.
            if (paymentIntent.amount === amountInSmallestUnit && (paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'requires_confirmation')) {
                // Potentially update metadata if needed, or just return existing
                 console.log(`Using existing PaymentIntent ${paymentIntent.id} for order ${orderId}`);
            } else {
                // If amount changed or status is not suitable, create a new one.
                // This logic is simplified. Consider implications of multiple payment intents for one order.
                // You might want to explicitly cancel the old paymentIntent if creating a new one.
                // await stripe.paymentIntents.cancel(order.stripePaymentIntentId); // Example
                console.log(`Creating new PaymentIntent for order ${orderId} as existing one (${paymentIntent.id}, status: ${paymentIntent.status}, amount: ${paymentIntent.amount}) is not suitable.`);
                paymentIntent = null; // Force creation of a new one
            }
        } catch (retrieveError: any) {
            console.warn(`Failed to retrieve existing PaymentIntent ${order.stripePaymentIntentId}: ${retrieveError.message}. A new one will be created.`);
            // paymentIntent will remain null or undefined, so a new one is created below.
        }
    }


    if (!paymentIntent) {
        paymentIntent = await stripe.paymentIntents.create({
            amount: amountInSmallestUnit,
            currency: 'usd', // Or your desired currency e.g., 'inr'
            metadata: { orderId: orderId, userId: authenticatedUserId },
            // automatic_payment_methods: { enabled: true }, // Recommended by Stripe for future proofing
        });

        // Update the order with the new Stripe PaymentIntent ID
        await prisma.order.update({
            where: { id: orderId },
            data: { stripePaymentIntentId: paymentIntent.id },
        });
        console.log(`Created new PaymentIntent ${paymentIntent.id} for order ${orderId} and updated order.`);
    }


    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    if (error.name === 'SyntaxError' || (error instanceof TypeError && error.message.includes("JSON"))) {
        return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: `Stripe error: ${error.message}` }, { status: 500 });
    }
    // Handle Prisma errors or other generic errors
    if (error.code === 'P2023' && error.message.includes("Malformed ObjectID")) { // Prisma error for invalid ID format
        return NextResponse.json({ error: 'Invalid Order ID format.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error while creating payment intent.' }, { status: 500 });
  }
}
