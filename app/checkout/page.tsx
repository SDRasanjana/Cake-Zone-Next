"use client";

import React, { useState, useEffect, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // To get orderId from URL
import { loadStripe, StripeError } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "../../contexts/CartContext"; // Assuming you might want to clear cart or get details
import { Link } from "lucide-react";
import { useUser } from "@clerk/nextjs";

// Ensure your Stripe publishable key is set in .env.local (or your environment variables)
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const CheckoutForm: React.FC<{ orderId: string; clientSecret: string }> = ({
  orderId,
  clientSecret,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCart(); // Get clearCart from context

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cardHolderName, setCardHolderName] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      setError(
        "Stripe.js has not loaded yet. Please wait a moment and try again."
      );
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError(
        "Card details are missing. Please ensure the card element is loaded."
      );
      setProcessing(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: paymentError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardHolderName || undefined, // Optional: Pass cardholder's name
            },
          },
        });

      if (paymentError) {
        setError(
          paymentError.message || "An unexpected error occurred during payment."
        );
        setSucceeded(false);
        setProcessing(false);
      } else if (paymentIntent?.status === "succeeded") {
        setError(null);
        setSucceeded(true);
        setProcessing(false);
        console.log("Payment Succeeded:", paymentIntent);

        // Call backend to confirm order update after payment
        try {
          const confirmResponse = await fetch(`/api/orders/${orderId}/confirm-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
          });
          
          if (!confirmResponse.ok) {
            // Try to parse error response
            let errorMessage = `Payment confirmation failed with status: ${confirmResponse.status}`;
            try {
              const responseText = await confirmResponse.text();
              if (responseText) {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error || errorData.message || errorMessage;
              }
            } catch (parseError) {
              // If JSON parsing fails, use the status-based message
              console.error("Failed to parse error response:", parseError);
            }
            throw new Error(errorMessage);
          }
          
          // Parse successful response with better error handling
          try {
            const responseText = await confirmResponse.text();
            if (!responseText) {
              console.warn("Empty response from payment confirmation");
              // Don't throw error - payment succeeded on Stripe side
            } else {
              const confirmData = JSON.parse(responseText);
              console.log("Payment confirmation successful:", confirmData);
            }
          } catch (parseError) {
            console.error("Failed to parse confirmation response:", parseError);
            // Don't throw error - payment succeeded on Stripe side
          }
          
        } catch (err) {
          // Log error but don't block user - payment succeeded on Stripe side
          console.error("Order payment confirmation failed:", err);
          // Optionally set a warning message for the user
          setError(`Payment successful, but there was an issue updating your order. Please contact support if needed. Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }

        clearCart(); // Clear the cart on successful payment
        // Redirect to customer dashboard after payment
        router.push("/dashboards/customer");
      } else {
        // Handle other payment intent statuses like 'requires_capture', 'processing', etc.
        setError(
          `Payment status: ${
            paymentIntent?.status || "unknown"
          }. Please contact support.`
        );
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
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-gray-800 p-8 rounded-lg shadow-xl max-w-md mx-auto"
    >
      <div>
        <label
          htmlFor="card-holder-name"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
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
        <label
          htmlFor="card-element"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Card Details
        </label>
        <div className="mt-1 p-3 border border-gray-600 rounded-md bg-gray-700 shadow-sm">
          <CardElement id="card-element" options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div
          id="card-errors"
          role="alert"
          className="text-red-400 text-sm p-3 bg-red-900/30 border border-red-700 rounded-md"
        >
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

// --- ENHANCED CHECKOUT PAGE ---
// This checkout page is fully responsive, step-based, and well-commented for maintainability.
// It collects shipping details, reviews the order, and processes payment with Stripe.

const CheckoutPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state: cartState, removeFromCart } = useCart();
  const { user } = useUser(); // Get user from Clerk
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false); // Only true during payment intent creation

  // --- Step state: 1 = Shipping, 2 = Review, 3 = Payment ---
  const [step, setStep] = useState(1);
  // Shipping details state
  const [shipping, setShipping] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    email: "",
  });
  // Delivery date state
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  // Save shipping details and delivery date to localStorage for persistence
  useEffect(() => {
    const saved = localStorage.getItem("checkout_shipping");
    if (saved) setShipping(JSON.parse(saved));
    const savedDate = localStorage.getItem("checkout_deliveryDate");
    if (savedDate) setDeliveryDate(savedDate);
  }, []);
  useEffect(() => {
    localStorage.setItem("checkout_shipping", JSON.stringify(shipping));
  }, [shipping]);
  useEffect(() => {
    localStorage.setItem("checkout_deliveryDate", deliveryDate);
  }, [deliveryDate]);

  // Create order in DB after shipping step
  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingIntent(true);
    setLoadingError(null);
    try {
      // Create order in DB
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cartState.items,
          shipping,
          deliveryDate, // Pass delivery date to backend
          userId: user?.id || "guest",
          total: cartState.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        }),
      });
      if (!res.ok) {
        let errorMessage = `Failed to create order: ${res.status}`;
        try {
          const responseText = await res.text();
          if (responseText) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
        }
        throw new Error(errorMessage);
      }
      
      const responseText = await res.text();
      if (!responseText) {
        throw new Error("Empty response from server");
      }
      
      const data = JSON.parse(responseText);
      setOrderId(data.orderId);
      setStep(2);
    } catch (err: any) {
      setLoadingError(
        err.message || "Failed to create order. Please try again."
      );
    } finally {
      setIsLoadingIntent(false);
    }
  };

  // Create payment intent after order is created and step is 3
  useEffect(() => {
    if (step !== 3 || !orderId) return;
    setIsLoadingIntent(true);
    setLoadingError(null);
    fetch("/api/payments/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        cartItems: cartState.items,
        deliveryDate, // Pass delivery date to payment intent
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          let errorMessage = `Failed to create payment intent: ${res.status}`;
          try {
            const responseText = await res.text();
            if (responseText) {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.error || errorMessage;
            }
          } catch (parseError) {
            console.error("Failed to parse error response:", parseError);
          }
          throw new Error(errorMessage);
        }
        
        const responseText = await res.text();
        if (!responseText) {
          throw new Error("Empty response from payment service");
        }
        
        return JSON.parse(responseText);
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error: any) => {
        console.error("Error fetching client secret:", error);
        setLoadingError(
          error.message || "Failed to initialize payment. Please try again."
        );
      })
      .finally(() => {
        setIsLoadingIntent(false);
      });
  }, [step, orderId, cartState, deliveryDate]);

  // Block checkout if cart is empty
  useEffect(() => {
    if (cartState.items.length === 0) {
      // Redirect to dashboard with error message in query string
      router.replace("/dashboards/customer?error=Cart%20is%20empty");
    }
  }, [cartState.items, router]);

  // Prevent rendering if cart is empty (avoid error)
  if (cartState.items.length === 0) {
    return null;
  }

  if (!stripePromise) {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex flex-col justify-center items-center text-gray-200">
        <h1 className="text-2xl font-bold text-red-500">
          Stripe Configuration Error
        </h1>
        <p>
          Stripe publishable key is missing. Payment processing is unavailable.
        </p>
      </div>
    );
  }

  if (isLoadingIntent) {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex flex-col justify-center items-center text-gray-200">
        <h1 className="text-2xl font-bold text-pink-500">
          Initializing Secure Payment
        </h1>
        <p className="animate-pulse">
          Please wait while we prepare your checkout...
        </p>
        {/* Basic spinner */}
        <div className="mt-4 border-t-4 border-pink-500 border-solid rounded-full animate-spin h-12 w-12"></div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex flex-col justify-center items-center text-gray-200">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Checkout Error</h1>
        <p className="text-red-400 bg-red-900/30 p-4 rounded-md">
          {loadingError}
        </p>
        <Link
          href={orderId ? `/cart` : "/"}
          className="mt-6 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          {orderId ? "Return to Cart" : "Go to Homepage"}
        </Link>
      </div>
    );
  }

  // Only block on payment step if clientSecret/orderId are missing
  if (step === 3 && (!clientSecret || !orderId)) {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex flex-col justify-center items-center text-gray-200">
        <h1 className="text-2xl font-bold text-orange-500">
          Preparing Checkout...
        </h1>
        <p>
          If this message persists, please try refreshing or contact support.
        </p>
      </div>
    );
  }

  const options = {
    clientSecret,
    // appearance: { theme: 'stripe' }, // or 'night', 'flat', etc.
  };

  // --- Responsive, step-based UI ---
  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200">
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-8 flex flex-col md:flex-row gap-8 animate-fade-in">
        {/* Stepper Navigation */}
        <div className="w-full flex justify-center mb-6 md:hidden">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-8 h-2 rounded-full transition-all duration-300 ${
                  step === s ? "bg-pink-500 w-12" : "bg-gray-600"
                }`}
              ></div>
            ))}
          </div>
        </div>
        {/* Left: Shipping/Review/Order Summary */}
        <div className="flex-1 mb-8 md:mb-0 md:mr-8 w-full">
          {step === 1 && (
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold text-pink-400 mb-2">
                Shipping Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={shipping.fullName}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, fullName: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={shipping.email}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={shipping.phone}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={shipping.country}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, country: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    required
                    value={shipping.address}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, address: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, city: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={shipping.postalCode}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, postalCode: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200"
                  />
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                  onClick={() => router.push("/shopping-cart")}
                >
                  Back to Cart
                </button>
                <button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold"
                  disabled={isLoadingIntent}
                >
                  {isLoadingIntent ? "Processing..." : "Continue"}
                </button>
              </div>
            </form>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-pink-400 mb-2">
                Review Order
              </h2>
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="mb-2 text-gray-300">Shipping to:</div>
                <div className="text-gray-200 font-semibold">
                  {shipping.fullName}
                </div>
                <div className="text-gray-400 text-sm">
                  {shipping.address}, {shipping.city}, {shipping.postalCode},
                  {shipping.country}
                </div>
                <div className="text-gray-400 text-sm">
                  {shipping.email} | {shipping.phone}
                </div>
                <div className="text-gray-400 text-sm mt-2">
                  <span className="font-semibold text-pink-300">
                    Delivery Date:
                  </span>{" "}
                  {deliveryDate}
                </div>
              </div>
              {/* Order Items */}
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="mb-2 text-gray-300">Order Items:</div>
                {cartState.items.length === 0 ? (
                  <div className="text-red-400">Your cart is empty.</div>
                ) : (
                  <ul className="text-gray-400 text-sm space-y-2">
                    {cartState.items.map((item, idx) => (
                      <li
                        key={item.id || idx}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-600 pb-2 mb-2 last:border-b-0 last:mb-0"
                      >
                        <div className="flex items-center gap-3">
                          {item.imageUri && (
                            <img
                              src={item.imageUri}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded shadow border border-gray-700"
                            />
                          )}
                          <div>
                            <span className="font-semibold text-white">
                              {item.name}
                            </span>
                            {item.flavor && (
                              <span className="ml-2 text-xs text-pink-300">
                                ({item.flavor})
                              </span>
                            )}
                            {item.toppings && item.toppings.length > 0 && (
                              <span className="ml-2 text-xs text-yellow-300">
                                + {item.toppings.join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <span className="mr-2">Qty: {item.quantity}</span>
                          <span className="text-green-400 font-semibold">
                            Rs. {(item.price * item.quantity).toLocaleString()}
                          </span>
                          {/* Remove button for cart item */}
                          <button
                            type="button"
                            className="ml-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition"
                            onClick={() => removeFromCart(item.id)}
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {/* Order total */}
                <div className="mt-4 text-right text-lg font-bold text-green-400">
                  Total: Rs.{" "}
                  {cartState.items
                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                    .toLocaleString()}
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                  onClick={() => setStep(1)}
                >
                  Edit Shipping
                </button>
                <button
                  type="button"
                  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-lg font-semibold"
                  onClick={() => setStep(3)}
                  disabled={cartState.items.length === 0}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}
          {step === 3 && clientSecret && orderId && (
            <div>
              <h2 className="text-2xl font-bold text-pink-400 mb-2">
                Payment Details
              </h2>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm orderId={orderId} clientSecret={clientSecret} />
              </Elements>
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                  onClick={() => setStep(2)}
                >
                  Back to Review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CheckoutPageWrapper = () => (
  <Suspense
    fallback={
      <div className="p-8 text-center text-gray-500">Loading checkout...</div>
    }
  >
    <CheckoutPage />
  </Suspense>
);

export default CheckoutPageWrapper;
