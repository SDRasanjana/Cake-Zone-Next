"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "../../contexts/CartContext";
import Link from "next/link";

const CheckoutForm: React.FC<{ orderId: string }> = ({ orderId }) => {
  const router = useRouter();
  const { clearCart } = useCart();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    paymentMethod: "cash_on_delivery",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setProcessing(true);
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        setError("Please fill in all required fields (Name, Email, Phone).");
        setProcessing(false);
        setLoading(false);
        return;
      }

      // Create order with customer information
      const orderData = {
        orderId,
        customerInfo,
        paymentMethod: customerInfo.paymentMethod,
        status:
          customerInfo.paymentMethod === "cash_on_delivery"
            ? "pending"
            : "confirmed",
      };

      // Here you would typically send the order to your backend
      // For now, we'll simulate a successful order
      console.log("Order Data:", orderData);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setError(null);
      setSucceeded(true);
      setProcessing(false);

      clearCart(); // Clear the cart on successful order

      // Redirect to success page
      setTimeout(() => {
        router.push(
          `/order-success?order_id=${orderId}&payment_method=${customerInfo.paymentMethod}`
        );
      }, 1500);
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(errorMessage);
      setSucceeded(false);
      setProcessing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl mx-auto"
    >
      {/* Customer Information */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Full Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={customerInfo.name}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-gray-200"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={customerInfo.email}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-gray-200"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Phone Number *
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          value={customerInfo.phone}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-gray-200"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Delivery Address
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          value={customerInfo.address}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-gray-200"
          placeholder="123 Main Street, Apartment 4B"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            City
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={customerInfo.city}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-gray-200"
            placeholder="New York"
          />
        </div>

        <div>
          <label
            htmlFor="zipCode"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            ZIP Code
          </label>
          <input
            id="zipCode"
            name="zipCode"
            type="text"
            value={customerInfo.zipCode}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-gray-200"
            placeholder="10001"
          />
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <label
          htmlFor="paymentMethod"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          Payment Method
        </label>
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={customerInfo.paymentMethod}
          onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-gray-200"
        >
          <option value="cash_on_delivery">Cash on Delivery</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="paypal">PayPal (Manual)</option>
        </select>
        <p className="mt-1 text-xs text-gray-400">
          {customerInfo.paymentMethod === "cash_on_delivery" &&
            "Pay when your order is delivered"}
          {customerInfo.paymentMethod === "bank_transfer" &&
            "We'll send you bank details via email"}
          {customerInfo.paymentMethod === "paypal" &&
            "We'll send you payment instructions via email"}
        </p>
      </div>

      {error && (
        <div
          id="form-errors"
          role="alert"
          className="text-red-400 text-sm p-3 bg-red-900/30 border border-red-700 rounded-md"
        >
          {error}
        </div>
      )}

      {succeeded && (
        <div className="text-green-400 text-sm p-3 bg-green-900/30 border border-green-700 rounded-md">
          Order Placed Successfully! Redirecting...
        </div>
      )}

      <button
        type="submit"
        disabled={loading || processing || succeeded}
        className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {processing
          ? "Processing Order..."
          : succeeded
          ? "Order Placed!"
          : "Place Order"}
      </button>
    </form>
  );
};

const CheckoutPage: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render client-specific components on server
  if (!isClient) {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex flex-col justify-center items-center text-gray-200 bg-gray-900">
        <h1 className="text-3xl font-bold text-pink-500 mb-8">
          Loading Checkout...
        </h1>
        <div className="mt-4 border-t-4 border-pink-500 border-solid rounded-full animate-spin h-12 w-12"></div>
      </div>
    );
  }

  return <CheckoutPageClient />;
};

const CheckoutPageClient: React.FC = () => {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentOrderId = searchParams.get("order_id");
    if (!currentOrderId) {
      setLoadingError(
        "No order ID found. Please initiate checkout from your cart or order summary."
      );
      setIsLoading(false);
      return;
    }
    setOrderId(currentOrderId);
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex flex-col justify-center items-center text-gray-200 bg-gray-900">
        <h1 className="text-2xl font-bold text-pink-500">
          Preparing Checkout...
        </h1>
        <p className="animate-pulse">
          Please wait while we prepare your checkout...
        </p>
        <div className="mt-4 border-t-4 border-pink-500 border-solid rounded-full animate-spin h-12 w-12"></div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex flex-col justify-center items-center text-gray-200 bg-gray-900">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Checkout Error</h1>
        <p className="text-red-400 bg-red-900/30 p-4 rounded-md">
          {loadingError}
        </p>
        <Link
          href="/cart"
          className="mt-6 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Return to Cart
        </Link>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex flex-col justify-center items-center text-gray-200 bg-gray-900">
        <h1 className="text-2xl font-bold text-orange-500">
          Missing Order Information
        </h1>
        <p>
          Please try refreshing or return to your cart to start the checkout
          process again.
        </p>
        <Link
          href="/cart"
          className="mt-6 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Return to Cart
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200">
      <h1 className="text-3xl font-bold text-pink-500 mb-8">
        Complete Your Order
      </h1>
      <p className="text-gray-400 mb-8">Order ID: {orderId}</p>
      <CheckoutForm orderId={orderId} />
    </div>
  );
};

export default CheckoutPage;
