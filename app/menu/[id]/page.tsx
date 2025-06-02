"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const CakeDetails = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart } = useCart();
  const [selectedAge, setSelectedAge] = useState('all');
  const [quantity, setQuantity] = useState(1);

  // Mock data - replace with actual data fetching
  const cakeData = {
    id: 1,
    name: "Chocolate Fantasy Cake",
    price: 49.99,
    description: "A delightful chocolate cake with rich ganache and fresh berries",
    ingredients: [
      "Belgian Chocolate",
      "Fresh Cream",
      "Vanilla Extract",
      "Mixed Berries",
      "Dark Chocolate Ganache"
    ],
    weight: "1.5 kg",
    ageRecommendation: ["all", "kids", "adults"],
    images: [
      "/cake1.jpg",
      "/cake2.jpg",
      "/cake3.jpg",
      "/cake4.jpg"
    ],
    relatedCakes: [
      { id: 2, name: "Vanilla Dream", image: "/cake2.jpg", price: 39.99 },
      { id: 3, name: "Berry Bliss", image: "/cake3.jpg", price: 44.99 },
      { id: 4, name: "Caramel Delight", image: "/cake4.jpg", price: 42.99 },
      { id: 5, name: "Red Velvet", image: "/cake5.jpg", price: 45.99 }
    ]
  };

  const handleAddToCart = () => {
    addToCart({
      id: cakeData.id,
      name: cakeData.name,
      price: cakeData.price,
      image: cakeData.images[0]
    });
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery Section */}
          <div className="space-y-6">
            <motion.div 
              className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={cakeData.images[selectedImage]}
                alt={cakeData.name}
                fill
                className="object-cover transform hover:scale-110 transition-transform duration-500"
                quality={100}
              />
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {cakeData.images.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                    selectedImage === index ? 'border-[#E67E5F]' : 'border-transparent'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={image}
                    alt={`${cakeData.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-[#3A2E26] font-serif mb-2">
                  {cakeData.name}
                </h1>
                <p className="text-2xl text-[#E67E5F] font-bold">
                  ${cakeData.price.toFixed(2)}
                </p>
              </div>
              <motion.button
                onClick={() => setIsLiked(!isLiked)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-white shadow-md"
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6 text-gray-400" />
                )}
              </motion.button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#3A2E26]">Description</h3>
              <p className="text-[#7A6A5F]">{cakeData.description}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#3A2E26]">Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {cakeData.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 rounded-full bg-[#FFEDE5] text-[#E67E5F] text-sm font-medium"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#3A2E26]">Weight</h3>
                <p className="text-[#7A6A5F]">{cakeData.weight}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#3A2E26]">Age Recommendation</h3>
                <div className="flex gap-2">
                  {cakeData.ageRecommendation.map((age) => (
                    <button
                      key={age}
                      onClick={() => setSelectedAge(age)}
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        selectedAge === age
                          ? 'bg-[#E67E5F] text-white'
                          : 'bg-white text-[#7A6A5F] hover:bg-[#FFEDE5]'
                      }`}
                    >
                      {age.charAt(0).toUpperCase() + age.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-white rounded-full shadow-md">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-3 text-[#E67E5F] hover:text-[#D45D3E] disabled:text-gray-300"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-3 text-[#E67E5F] hover:text-[#D45D3E]"
                  >
                    +
                  </button>
                </div>
                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#E67E5F] to-[#D45D3E] text-white py-4 px-8 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Add to Cart
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Cakes Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-[#3A2E26] font-serif mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {cakeData.relatedCakes.map((cake) => (
              <motion.div
                key={cake.id}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="relative aspect-square">
                  <Image
                    src={cake.image}
                    alt={cake.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#3A2E26]">{cake.name}</h3>
                  <p className="text-[#E67E5F] font-medium">${cake.price.toFixed(2)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CakeDetails;
