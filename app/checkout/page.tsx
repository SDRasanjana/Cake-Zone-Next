"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // To get orderId from URL
import { loadStripe, StripeError } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useCart } from '../../contexts/CartContext'; // Assuming you might want to clear cart or get details
import { Link } from 'lucide-react';

// Ensure your Stripe publishable key is set in .env.local (or your environment variables)
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const CheckoutForm: React.FC<{ orderId: string; clientSecret: string }> = ({ orderId, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCart(); // Get clearCart from context

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cardHolderName, setCardHolderName] = useState('');


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      setError("Stripe.js has not loaded yet. Please wait a moment and try again.");
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card details are missing. Please ensure the card element is loaded.");
      setProcessing(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardHolderName || undefined, // Optional: Pass cardholder's name
          },
        },
      });

      if (paymentError) {
        setError(paymentError.message || "An unexpected error occurred during payment.");
        setSucceeded(false);
        setProcessing(false);
      } else if (paymentIntent?.status === 'succeeded') {
        setError(null);
        setSucceeded(true);
        setProcessing(false);
        console.log("Payment Succeeded:", paymentIntent);

        // Optional: Call backend to confirm order update, though webhooks are more robust
        // await fetch(`/api/orders/${orderId}/confirm-payment`, { method: 'POST', body: JSON.stringify({ paymentIntentId: paymentIntent.id }) });

        clearCart(); // Clear the cart on successful payment
        router.push(`/order-success?payment_intent_id=${paymentIntent.id}&order_id=${orderId}`);
      } else {
        // Handle other payment intent statuses like 'requires_capture', 'processing', etc.
        setError(`Payment status: ${paymentIntent?.status || 'unknown'}. Please contact support.`);
        setSucceeded(false);
        setProcessing(false);
      }
    } catch (e: any) {
        setError(e.message || "An unexpected error occurred.");
        setSucceeded(false);
        setProcessing(false);
    } finally {
        setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: "#e5e7eb", // text-gray-200
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#9ca3af", // text-gray-400
        },
      },
      invalid: {
        color: "#f87171", // text-red-400
        iconColor: "#f87171", // text-red-400
      },
    },
    hidePostalCode: true, // Optional: if you collect address separately
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-lg shadow-xl max-w-md mx-auto">
      <div>
        <label htmlFor="card-holder-name" className="block text-sm font-medium text-gray-300 mb-1">
          Cardholder Name (Optional)
        </label>
        <input
          id="card-holder-name"
          type="text"
          value={cardHolderName}
          onChange={(e) => setCardHolderName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-gray-200"
          placeholder="Jane Doe"
        />
      </div>
      <div>
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-300 mb-1">
          Card Details
        </label>
        <div className="mt-1 p-3 border border-gray-600 rounded-md bg-gray-700 shadow-sm">
          <CardElement id="card-element" options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div id="card-errors" role="alert" className="text-red-400 text-sm p-3 bg-red-900/30 border border-red-700 rounded-md">
          {error}
        </div>
      )}
      {succeeded && (
        <div className="text-green-400 text-sm p-3 bg-green-900/30 border border-green-700 rounded-md">
          Payment Succeeded! Redirecting...
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || loading || processing || succeeded}
        className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {processing ? "Processing..." : succeeded ? "Paid" : `Pay Now`}
      </button>
    </form>
  );
};


const CheckoutPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(true);

  useEffect(() => {
    const currentOrderId = searchParams.get('order_id');
    if (!currentOrderId) {
      setLoadingError('No order ID found. Please initiate checkout from your cart or order summary.');
      setIsLoadingIntent(false);
      // Optional: redirect to cart or home after a delay
      // setTimeout(() => router.push('/cart'), 3000);
      return;
    }
    setOrderId(currentOrderId);

    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        setLoadingError('Stripe is not configured. Payment cannot be processed.');
        setIsLoadingIntent(false);
        return;
    }

    // Fetch the payment intent client secret from your backend
    fetch('/api/payments/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: currentOrderId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `Failed to create payment intent: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error: any) => {
        console.error("Error fetching client secret:", error);
        setLoadingError(error.message || 'Failed to initialize payment. Please try again.');
      })
      .finally(() => {
        setIsLoadingIntent(false);
      });
  }, [searchParams, router]);

  if (!stripePromise) {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex flex-col justify-center items-center text-gray-200">
        <h1 className="text-2xl font-bold text-red-500">Stripe Configuration Error</h1>
        <p>Stripe publishable key is missing. Payment processing is unavailable.</p>
      </div>
    );
  }

  if (isLoadingIntent) {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex flex-col justify-center items-center text-gray-200">
        <h1 className="text-2xl font-bold text-pink-500">Initializing Secure Payment</h1>
        <p className="animate-pulse">Please wait while we prepare your checkout...</p>
        {/* Basic spinner */}
        <div className="mt-4 border-t-4 border-pink-500 border-solid rounded-full animate-spin h-12 w-12"></div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex flex-col justify-center items-center text-gray-200">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Checkout Error</h1>
        <p className="text-red-400 bg-red-900/30 p-4 rounded-md">{loadingError}</p>
        <Link href={orderId ? `/cart` : '/'} className="mt-6 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg">
          {orderId ? 'Return to Cart' : 'Go to Homepage'}
        </Link>
      </div>
    );
  }

  if (!clientSecret || !orderId) {
     // This state should ideally be covered by isLoadingIntent or loadingError
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex flex-col justify-center items-center text-gray-200">
        <h1 className="text-2xl font-bold text-orange-500">Preparing Checkout...</h1>
        <p>If this message persists, please try refreshing or contact support.</p>
      </div>
    );
  }

  const options = {
    clientSecret,
    // appearance: { theme: 'stripe' }, // or 'night', 'flat', etc.
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200">
      <h1 className="text-3xl font-bold text-pink-500 mb-8">Complete Your Payment</h1>
      <p className="text-gray-400 mb-2">Order ID: {orderId}</p>
      {/* You can add more order summary details here if needed, fetched based on orderId */}
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm orderId={orderId} clientSecret={clientSecret} />
      </Elements>
    </div>
  );
};

export default CheckoutPage;
