"use client";

import { useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import Navbar from "../../components/Navbar";

interface Cake {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  description: string;
}

export default function CakeGallery() {
  const [cart, setCart] = useState<Cake[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Function to handle cart icon click
  const handleCartIconClick = () => {
    setShowCart((prev) => !prev);
  };

  const cakes: Cake[] = [
    { id: 1, name: "Butterscotch Fudge Cake", price: 9500, image: "/Butterscoch-Fudge.jpg", rating: 4.8, description: "Rich butterscotch layered with creamy fudge" },
    { id: 2, name: "Marble Cake", price: 9500, image: "/marbel.jpg", rating: 4.5, description: "Classic vanilla and chocolate swirl" },
    { id: 3, name: "Mocha Chocolate Cake", price: 9500, image: "/mocha-chocolate.jpg", rating: 4.9, description: "Coffee-infused dark chocolate delight" },
    { id: 4, name: "Pineapple Gateau", price: 10500, image: "/pineapple.jpg", rating: 4.7, description: "Cream cheese frosted classic" },
    { id: 5, name: "Ultimate Chocolate Cake", price: 8900, image: "/ultimate.jpg", rating: 4.6, description: "Zesty lemon with fresh blueberries" },
    { id: 6, name: "Red Velvet Cake", price: 9900, image: "/red-velvet.jpg", rating: 4.8, description: "Sweet and salty perfection" },
    { id: 7, name: "Oreo Cake", price: 11000, image: "/oreo.jpg", rating: 4.9, description: "Cherry and chocolate layered beauty" },
    { id: 8, name: "Almond Cake", price: 8500, image: "/almond.jpg", rating: 4.4, description: "Pure Madagascar vanilla flavor" },
    { id: 9, name: "Blueberry Cheesecake", price: 10200, image: "/cheese.jpg", rating: 4.7, description: "Light and airy with fresh raspberries" }
  ];

  const addToCart = (cake: Cake) => {
    setCart([...cart, cake]);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-amber-50">
      <Navbar cartCount={cart.length} onCartClick={handleCartIconClick} />
      {showCart && (
        <div className="fixed top-20 right-8 z-50 bg-white rounded-2xl shadow-2xl p-6 w-96 border-2 border-orange-400">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-orange-500">Shopping Cart</h2>
            <button onClick={() => setShowCart(false)} className="text-orange-500 hover:text-orange-700 text-3xl font-bold">&times;</button>
          </div>
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Your cart is empty.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-72 overflow-y-auto">
              {cart.map((cake, idx) => (
                <li key={idx} className="py-3 flex items-center gap-4">
                  <img src={cake.image} alt={cake.name} className="w-14 h-14 rounded-lg object-cover border-2 border-orange-200" />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 text-base">{cake.name}</div>
                    <div className="text-xs text-gray-500">{formatPrice(cake.price)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-600 mb-2 font-serif">Sweet Delights</h1>
          <p className="text-xl font-medium text-black">Premium Artisanal Cakes</p>
          <div className="mt-4 mx-auto w-24 h-1 bg-amber-500 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cakes.map((cake) => (
            <div key={cake.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
              <div className="h-48 overflow-hidden">
                <img src={cake.image} alt={cake.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-900">{cake.name}</h3>
                  <span className="bg-amber-100 text-amber-800 text-sm px-2 py-1 rounded-full flex items-center">⭐ {cake.rating}</span>
                </div>
                <p className="mt-2 text-gray-600 text-sm">{cake.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-rose-700">{formatPrice(cake.price)}</span>
                  <button onClick={() => addToCart(cake)} className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors duration-300 flex items-center shadow" aria-label="Add to cart">
                    <ShoppingCartIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
