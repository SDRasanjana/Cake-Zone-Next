"use client";

import { useState } from "react";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

interface Cake {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  description: string;
}

export default function CakeGallery() {
  const { addToCart, totalItems } = useCart();
  const router = useRouter();

  const handleAddToCart = (cake: Cake) => {
    addToCart({
      id: cake.id,
      name: cake.name,
      price: cake.price,
      image: cake.image,
      quantity: 1
    });
  };

  const handleViewCart = () => {
    router.push('/shopping-cart');
  };

  const cakes: Cake[] = [
    { id: 1, name: "Butterscotch Fudge Cake", price: 95.00, image: "/Butterscoch-Fudge.jpg", rating: 4.8, description: "Rich butterscotch layered with creamy fudge" },
    { id: 2, name: "Marble Cake", price: 95.00, image: "/marbel.jpg", rating: 4.5, description: "Classic vanilla and chocolate swirl" },
    { id: 3, name: "Mocha Chocolate Cake", price: 95.00, image: "/mocha-chocolate.jpg", rating: 4.9, description: "Coffee-infused dark chocolate delight" },
    { id: 4, name: "Pineapple Gateau", price: 105.00, image: "/pineapple.jpg", rating: 4.7, description: "Cream cheese frosted classic" },
    { id: 5, name: "Ultimate Chocolate Cake", price: 89.00, image: "/ultimate.jpg", rating: 4.6, description: "Zesty lemon with fresh blueberries" },
    { id: 6, name: "Red Velvet Cake", price: 99.00, image: "/red-velvet.jpg", rating: 4.8, description: "Sweet and salty perfection" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8">      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-4">Our Menu</h1>
         
        </div>        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {cakes.map((cake) => (
            <div
              key={cake.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition w-full max-w-sm mx-auto"
            >
              <img
                src={cake.image}
                alt={cake.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">{cake.name}</h2>
                  <span className="text-orange-500 font-bold">${cake.price.toFixed(2)}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{cake.description}</p>
                <div className="flex items-center justify-between">                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="text-gray-600 text-sm ml-1">{cake.rating}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(cake)}
                    className="text-orange-500 hover:text-orange-600 transition-colors p-2 hover:bg-orange-50 rounded-full"
                    aria-label={`Add ${cake.name} to cart`}
                  >
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
