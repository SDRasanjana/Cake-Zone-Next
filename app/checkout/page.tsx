"use client";

import React, { useState } from "react";

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    companyName: "",
    billingAddress: "",
    city: "",
    country: "",
    state: "",
    zipCode: "",
    creditCardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <div className="bg-black border-b border-orange-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Secure <span className="text-orange-400">Checkout</span>
          </h1>
          <p className="text-gray-300 mt-2">
            Complete your purchase safely and securely
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-black mb-2">
                  Billing Information
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full"></div>
              </div>

              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-black mb-2">
                      First Name *
                    </label>
                    <input
                      name="firstName"
                      placeholder="Enter your first name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-gray-50 focus:bg-white"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-black mb-2">
                      Last Name *
                    </label>
                    <input
                      name="lastName"
                      placeholder="Enter your last name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-gray-50 focus:bg-white"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label className="block text-sm font-semibold text-black mb-2">
                    Email Address *
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-gray-50 focus:bg-white"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Company Name */}
                <div className="group">
                  <label className="block text-sm font-semibold text-black mb-2">
                    Company Name{" "}
                    <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    name="companyName"
                    placeholder="Enter your company name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-gray-50 focus:bg-white"
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Billing Address */}
                <div className="group">
                  <label className="block text-sm font-semibold text-black mb-2">
                    Billing Address *
                  </label>
                  <input
                    name="billingAddress"
                    placeholder="Enter your billing address"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-gray-50 focus:bg-white"
                    value={formData.billingAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* City and Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-black mb-2">
                      City *
                    </label>
                    <input
                      name="city"
                      placeholder="Enter city"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-gray-50 focus:bg-white"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-black mb-2">
                      Country *
                    </label>
                    <input
                      name="country"
                      placeholder="Enter country"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-gray-50 focus:bg-white"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* State and ZIP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-black mb-2">
                      State *
                    </label>
                    <input
                      name="state"
                      placeholder="Enter state"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-gray-50 focus:bg-white"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-black mb-2">
                      ZIP Code *
                    </label>
                    <input
                      name="zipCode"
                      placeholder="Enter ZIP code"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-gray-50 focus:bg-white"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Payment Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-black mb-6">
                    Payment Information
                  </h3>

                  {/* Credit Card Number */}
                  <div className="group mb-6">
                    <label className="block text-sm font-semibold text-black mb-2">
                      Credit Card Number *
                    </label>
                    <div className="relative">
                      <input
                        name="creditCardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-gray-50 focus:bg-white"
                        value={formData.creditCardNumber}
                        onChange={handleInputChange}
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400">
                        <svg
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 256 256"
                        >
                          <path d="M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,16V88H32V64Zm0,128H32V104H224v88Zm-16-24a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h32A8,8,0,0,1,208,168Zm-64,0a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h16A8,8,0,0,1,144,168Z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expiry Date and CVV */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-black mb-2">
                        Expiry Date *
                      </label>
                      <input
                        name="expiryDate"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-gray-50 focus:bg-white"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-black mb-2">
                        CVV *
                      </label>
                      <input
                        name="cvv"
                        placeholder="123"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-all duration-300 text-black placeholder-gray-500 bg-gray-50 focus:bg-white"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600 text-black font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-lg"
                  >
                    Complete Purchase
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-black rounded-2xl shadow-2xl p-6 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-6">
                Order Summary
              </h2>

              {/* Product Image */}
              <div className="mb-6">
                <div className="aspect-video bg-gradient-to-br from-orange-400/20 to-yellow-500/20 rounded-xl flex items-center justify-center border border-orange-400/30">
                  <div className="text-6xl">🎂</div>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-semibold">Premium Cake</h3>
                    <p className="text-gray-400 text-sm">Quantity: 1</p>
                  </div>
                  <button className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-black font-medium rounded-lg transition-colors duration-300 text-sm">
                    Edit
                  </button>
                </div>
              </div>

              {/* Order Details */}
              <div className="space-y-3 border-t border-gray-700 pt-6">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>$14.00</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>$1.12</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span className="text-orange-400">Free</span>
                </div>
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>$15.12</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="text-white font-semibold mb-3">
                  What&apos;s Included:
                </h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                    Exclusive flavors
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                    Custom cake designs
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-3"></span>
                    Express delivery options
                  </li>
                </ul>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-center text-gray-400 text-sm">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Secured by SSL encryption
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
