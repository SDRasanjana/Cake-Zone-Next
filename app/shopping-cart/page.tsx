"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

const ShoppingCartPage = () => {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-orange-500 mb-8">
          Your Shopping Cart
        </h1>
        
        {/* Cart Items Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Items in your cart:</h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="bg-gray-200 px-2 rounded-md hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="bg-gray-200 px-2 rounded-md hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <p className="text-lg font-semibold text-orange-500">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 text-sm hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {cartItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Your cart is empty. <Link href="/menu" className="text-orange-500 hover:underline">Continue shopping</Link>
              </div>
            )}
          </div>
        </div>

        {/* Total and Checkout Section */}
        {cartItems.length > 0 && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Total:</h2>
              <p className="text-2xl font-bold text-orange-500">
                ${calculateTotal().toFixed(2)}
              </p>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-orange-500 text-white py-3 rounded-md text-lg font-semibold hover:bg-orange-600 transition"
            >
              Proceed to Checkout
            </button>
          </div>
        )}

        {/* Back to Menu Link */}
        <div className="text-center mt-6">
          <Link href="/menu" className="text-orange-500 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPage;
