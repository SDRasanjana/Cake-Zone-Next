"use client";

import React, { useState, ChangeEvent } from "react";
import { useCart } from "../../contexts/CartContext"; // Adjust path as necessary
import Link from "next/link";
import Image from "next/image"; // If you have imageUris for cart items

// Force dynamic rendering
export const dynamic = "force-dynamic";

const CartPage: React.FC = () => {
  const {
    state,
    removeFromCart,
    updateQuantity,
    setDeliveryDate,
    clearCart,
    getCartTotal,
  } = useCart();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleQuantityChange = (
    itemId: string,
    currentQuantity: number,
    change: number
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
    } else {
      // Optionally, ask for confirmation before removing if quantity becomes 0
      removeFromCart(itemId);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this item from your cart?"
      )
    ) {
      removeFromCart(itemId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      clearCart();
    }
  };

  const handleDeliveryDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDeliveryDate(e.target.value);
  };

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center min-h-[calc(100vh-200px)] flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold text-pink-600 mb-6">
          Your Cart is Empty
        </h1>
        <p className="text-gray-400 mb-8">
          Looks like you haven't added any delicious cakes yet!
        </p>
        <Link
          href="/customize"
          className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
        >
          Customize a Cake
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-gray-100">
      <h1 className="text-3xl sm:text-4xl font-bold text-pink-500 mb-8 text-center">
        Your Shopping Cart
      </h1>

      <div className="bg-gray-800 shadow-xl rounded-lg p-6 mb-8">
        {state.items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-700 py-6 last:border-b-0"
          >
            <div className="flex items-center mb-4 sm:mb-0">
              {item.imageUri ? (
                <Image
                  src={item.imageUri}
                  alt={item.name}
                  width={100}
                  height={100}
                  className="rounded-md object-cover mr-6 shadow-md"
                />
              ) : (
                <div
                  className={`w-24 h-24 rounded-md mr-6 shadow-md flex items-center justify-center ${
                    item.frostingColor || "bg-gray-700"
                  }`}
                  style={
                    item.frostingHexColor
                      ? { backgroundColor: item.frostingHexColor }
                      : {}
                  }
                >
                  <span className="text-xs text-center p-1">
                    {item.frostingHexColor ? "" : "Cake"}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-pink-400">
                  {item.name}
                </h2>
                <p className="text-sm text-gray-400">
                  Flavor: {item.flavor}, Layers: {item.layers}
                </p>
                {item.toppings.length > 0 && (
                  <p className="text-sm text-gray-400">
                    Toppings: {item.toppings.join(", ")}
                  </p>
                )}
                <p className="text-sm text-gray-300 font-medium">
                  Unit Price: ${item.price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-600 rounded">
                <button
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity, -1)
                  }
                  className="px-3 py-1 text-lg text-pink-400 hover:bg-gray-700 rounded-l"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 py-1 text-lg">{item.quantity}</span>
                <button
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity, 1)
                  }
                  className="px-3 py-1 text-lg text-pink-400 hover:bg-gray-700 rounded-r"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <p className="text-lg font-semibold w-20 text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="text-red-500 hover:text-red-400 font-semibold text-2xl"
                aria-label="Remove item"
              >
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 shadow-xl rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-pink-500 mb-4">
          Order Summary
        </h2>
        <div className="flex justify-between items-center mb-4">
          <label htmlFor="deliveryDate" className="text-lg text-gray-300">
            Preferred Delivery Date:
          </label>
          <input
            type="date"
            id="deliveryDate"
            value={state.deliveryDate || ""}
            onChange={handleDeliveryDateChange}
            min={new Date().toISOString().split("T")[0]} // Today as minimum
            className="bg-gray-700 border border-gray-600 text-white p-2 rounded-md focus:ring-pink-500 focus:border-pink-500"
          />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-pink-400">
            Total: ${getCartTotal().toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          onClick={handleClearCart}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
        >
          Clear Cart
        </button>
        <Link href="/checkout" passHref>
          <button
            disabled={!state.deliveryDate}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              !state.deliveryDate
                ? "Please select a delivery date"
                : "Proceed to Checkout"
            }
          >
            Proceed to Checkout
          </button>
        </Link>
      </div>

      {/* Basic confirmation modal for future use if needed
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-gray-700 p-6 rounded-lg shadow-xl text-center">
            <p className="text-lg mb-4">Item removed from cart.</p>
            <button onClick={() => setShowConfirmation(false)} className="bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded">OK</button>
          </div>
        </div>
      )}
      */}
    </div>
  );
};

export default CartPage;
