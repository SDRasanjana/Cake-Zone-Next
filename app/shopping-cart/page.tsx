"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const ShoppingCartPage = () => {
  const router = useRouter();
  const { state, updateQuantity, removeFromCart, getCartTotal } = useCart();

  const handleCheckout = () => {
    router.push("/checkout");
  };
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F2] to-[#FFEDE5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Animated Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-[#3A2E26] mb-4 font-serif tracking-tight">
            Your <span className="text-[#E67E5F]">Sweet</span> Cart
          </h1>
        </motion.div>
        {/* Cart Content */}
        <div className="space-y-8">
          {state.items.length === 0 ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-16 bg-white rounded-3xl shadow-2xl border-2 border-dashed border-[#FFD4C2] relative overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-[#FFEDE5] z-0"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-[#FFF0E5] z-0"></div>
              <div className="relative z-10">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                  className="text-[#E67E5F] mb-8"
                >
                  <svg
                    className="w-28 h-28 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
                    />
                  </svg>
                </motion.div>
                <h2 className="text-3xl font-semibold text-[#3A2E26] mb-6">
                  Your cart is empty
                </h2>{" "}
                <p className="text-lg text-[#7A6A5F] mb-8 max-w-md mx-auto">
                  Looks like you haven&apos;t added any delicious cakes yet.
                  Let&apos;s fix that!
                </p>
                <Link
                  href="/menu"
                  className="inline-flex items-center justify-center px-10 py-4 rounded-full text-white bg-gradient-to-r from-[#E67E5F] to-[#D45D3E] hover:from-[#D45D3E] hover:to-[#C24C2D] transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-lg group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                  <span className="relative z-10 flex items-center">
                    Browse Our Cakes
                    <svg
                      className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 5l7 7-7 7M5 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                  {state.items.map((item) => (
                    <motion.div
                      layout
                      key={item.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      whileHover={{ scale: 1.01 }}
                      className="p-8 flex flex-col sm:flex-row justify-between gap-6 group hover:bg-[#FFF9F5] transition-all duration-300 relative"
                    >
                      {/* Decorative elements */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFBFA5] to-[#FFD4C2] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="flex items-start gap-6">
                        <div className="relative flex-shrink-0 w-36 h-36 rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#FFEDE5]/50 to-transparent z-0" />{" "}
                          <img
                            src={item.imageUri}
                            alt={item.name}
                            className="w-full h-full object-cover object-center relative z-10"
                          />
                          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent z-20"></div>
                        </div>
                        <div className="pt-2">
                          <h3 className="text-2xl font-bold text-[#3A2E26] font-serif tracking-tight">
                            {item.name}
                          </h3>
                          <div className="mt-3 flex flex-wrap gap-3">
                            <span className="text-xl text-[#E67E5F] font-bold">
                              ${item.price.toFixed(2)}
                              <span className="text-sm text-[#A89B91] font-normal ml-1">
                                each
                              </span>
                            </span>
                            {item.flavor && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-[#FFEDE5] text-[#D45D3E] font-medium border border-[#FFD4C2]">
                                {item.flavor}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="flex items-center gap-1 bg-[#FFF0E8] rounded-full px-4 py-2 shadow-inner border border-[#FFD4C2]">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className={`p-2 rounded-full transition-all duration-200 ${
                              item.quantity <= 1
                                ? "text-[#FFBFA5] cursor-not-allowed"
                                : "text-[#E67E5F] hover:text-[#D45D3E] hover:bg-[#FFD4C2]"
                            }`}
                            aria-label={`Decrease quantity of ${item.name}`}
                            disabled={item.quantity <= 1}
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-10 text-center font-bold text-[#3A2E26]"
                          >
                            {item.quantity}
                          </motion.span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-2 rounded-full text-[#E67E5F] hover:text-[#D45D3E] hover:bg-[#FFD4C2] transition-all duration-200"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-6">
                          <p className="text-xl font-bold text-[#3A2E26]">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2.5 rounded-full text-[#E67E5F] hover:text-[#D45D3E] hover:bg-[#FFEDE5] transition-all duration-200"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Order Summary - Sticky Sidebar */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="sticky top-8 bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#FFE5D9]"
                >
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-[#3A2E26] font-serif mb-6">
                      Order Summary
                    </h2>

                    <div className="space-y-4 mb-6">
                      {" "}
                      <div className="flex justify-between items-center pb-3 border-b border-[#FFE5D9]">
                        <span className="text-[#7A6A5F]">Subtotal</span>
                        <span className="text-[#3A2E26] font-medium">
                          ${getCartTotal().toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-[#FFE5D9]">
                        <span className="text-[#7A6A5F]">Delivery</span>
                        <span className="text-[#3A2E26] font-medium">Free</span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-bold text-[#3A2E26]">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-[#E67E5F]">
                          ${getCartTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 space-y-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCheckout}
                        className="w-full bg-gradient-to-r from-[#E67E5F] to-[#D45D3E] text-white py-4 px-6 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></span>
                        <span className="relative z-10 flex items-center">
                          Secure Checkout
                          <svg
                            className="w-5 h-5 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 5l7 7-7 7M5 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </motion.button>

                      <Link
                        href="/menu"
                        className="block text-center text-[#E67E5F] hover:text-[#D45D3E] transition-colors font-medium group"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                          </svg>
                          Continue Shopping
                        </span>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPage;
