// app/menu/page.tsx
'use client';

import { useState } from 'react';
import Head from 'next/head';

type Cake = {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  description: string;
};

export default function CakeGallery() {
  const [cart, setCart] = useState<Cake[]>([]);

  const cakes: Cake[] = [
    { id: 1, name: "Butterscotch Fudge Cake", price: 9500, image: "/Butterscoch-Fudge.jpg", rating: 4.8, description: "Rich butterscotch layered with creamy fudge" },
    { id: 2, name: "Marble Cake", price: 9500, image: "/marbel.jpg", rating: 4.5, description: "Classic vanilla and chocolate swirl" },
    { id: 3, name: "Mocha Chocolate Cake", price: 9500, image: "/mocha-chocolate.jpg", rating: 4.9, description: "Coffee-infused dark chocolate delight" },
    { id: 4, name: "Pineapple Gateau", price: 10500, image: "/pineapple.jpg", rating: 4.7, description: "Cream cheese frosted classic" },
    { id: 5, name: "Ultimate Chocolate Cake", price: 8900, image: "/ultimate.jpg", rating: 4.6, description: "Zesty lemon with fresh blueberries" },
    { id: 6, name: "Red Velvet Cake", price: 9900, image: "/red-velvet.jpg", rating: 4.8, description: "Sweet and salty perfection" },
    { id: 7, name: "Oreo Cake", price: 11000, image: "/oreo.jpg", rating: 4.9, description: "Cherry and chocolate layered beauty" },
    { id: 8, name: "Almond Cake", price: 8500, image: "/almond.jpg", rating: 4.4, description: "Pure Madagascar vanilla flavor" },
    { id: 9, name: "Blue berry cheese cake", price: 10200, image: "/cheese.jpg", rating: 4.7, description: "Light and airy with fresh raspberries" }
  ];

  const addToCart = (cake: Cake) => {
    setCart([...cart, cake]);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-amber-600 mb-2 font-serif">
              Sweet Delights
            </h1>
            <p className="text-xl font-medium text-black">
              Premium Artisanal Cakes
            </p>
            <div className="mt-4 mx-auto w-24 h-1 bg-amber-500 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cakes.map((cake) => (
              <div 
                key={cake.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={cake.image} 
                    alt={cake.name} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-900">{cake.name}</h3>
                    <span className="bg-amber-100 text-amber-800 text-sm px-2 py-1 rounded-full flex items-center">
                      ⭐ {cake.rating}
                    </span>
                  </div>
                  
                  <p className="mt-2 text-gray-600 text-sm">{cake.description}</p>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-lg font-bold text-rose-700">{formatPrice(cake.price)}</span>
                    <button 
                      onClick={() => addToCart(cake)}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}