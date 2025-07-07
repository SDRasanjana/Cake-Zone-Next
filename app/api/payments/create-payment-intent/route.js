import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeConfig } from "@/lib/env-validation";

// Validate and get Stripe configuration
const stripeConfig = getStripeConfig();
const stripe = new Stripe(stripeConfig.secretKey, {
// Ensure you have STRIPE_SECRET_KEY in your environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export async function POST(req) {
  try {
    // Additional validation to ensure Stripe is properly initialized
    if (!stripe) {
      console.error("Stripe initialization failed");
      return NextResponse.json({ error: "Payment service unavailable" }, { status: 500 });
    }
    const body = await req.json();
    const { orderId, cartItems, userId, deliveryDate } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    // Calculate total amount (in cents)
    const amount = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid order amount." }, { status: 400 });
    }

    // Optionally, validate items against DB for price manipulation prevention
    // ...

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: "usd", // Change to your currency
      metadata: {
        orderId: orderId || "N/A",
        userId: userId || "guest",
        deliveryDate: deliveryDate || "",
        items: JSON.stringify(cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        }))),
      },
      description: `Cake order for user ${userId || 'guest'}`,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe PaymentIntent error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
