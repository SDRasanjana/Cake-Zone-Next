"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircleIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";

// Force dynamic rendering to prevent prerender errors
export const dynamic = "force-dynamic";

const OrderSuccessPage: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render client-specific components on server
  if (!isClient) {
    return (
      <div className="container mx-auto p-4 text-center min-h-screen flex flex-col justify-center items-center text-gray-200 bg-gray-900">
        <h1 className="text-3xl font-bold text-green-500 mb-8">
          Loading...
        </h1>
      </div>
    );
  }

  return <OrderSuccessClient />;
};

const OrderSuccessClient: React.FC = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const paymentMethod = searchParams.get("payment_method");

  const getPaymentMethodDisplay = (method: string | null) => {
    switch (method) {
      case "cash_on_delivery":
        return "Cash on Delivery";
      case "bank_transfer":
        return "Bank Transfer";
      case "paypal":
        return "PayPal";
      default:
        return "Unknown";
    }
  };

  const getPaymentInstructions = (method: string | null) => {
    switch (method) {
      case "cash_on_delivery":
        return "Please have the exact amount ready when your order is delivered.";
      case "bank_transfer":
        return "We will send you bank transfer details via email within 24 hours.";
      case "paypal":
        return "We will send you PayPal payment instructions via email within 24 hours.";
      default:
        return "Please check your email for payment instructions.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-green-500 mb-4">
            Order Placed Successfully!
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            Thank you for your order. We&apos;ll start preparing your delicious cake right away!
          </p>

          {/* Order Details */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-2xl font-semibold text-pink-500 mb-4">Order Details</h2>
            
            {orderId && (
              <div className="mb-4">
                <span className="font-medium text-gray-300">Order ID: </span>
                <span className="text-pink-400 font-mono">{orderId}</span>
              </div>
            )}
            
            <div className="mb-4">
              <span className="font-medium text-gray-300">Payment Method: </span>
              <span className="text-green-400">{getPaymentMethodDisplay(paymentMethod)}</span>
            </div>

            <div className="mb-4">
              <span className="font-medium text-gray-300">Status: </span>
              <span className="text-yellow-400">Processing</span>
            </div>

            <div className="border-t border-gray-700 pt-4 mt-4">
              <h3 className="font-semibold text-gray-300 mb-2">Next Steps:</h3>
              <p className="text-gray-400 text-sm">
                {getPaymentInstructions(paymentMethod)}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                We will send you order updates and tracking information via email.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/menu"
              className="inline-flex items-center px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition duration-300"
            >
              <ShoppingBagIcon className="h-5 w-5 mr-2" />
              Continue Shopping
            </Link>
            
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-lg transition duration-300"
            >
              Back to Home
            </Link>
          </div>

          {/* Contact Information */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">
              Questions about your order? Contact us at{" "}
              <a 
                href="mailto:support@cakeshop.com" 
                className="text-pink-400 hover:text-pink-300"
              >
                support@cakeshop.com
              </a>
              {" "}or call{" "}
              <a 
                href="tel:+1234567890" 
                className="text-pink-400 hover:text-pink-300"
              >
                (123) 456-7890
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
