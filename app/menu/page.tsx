"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/contexts/CartContext";

interface Cake {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  description: string;
}

export default function CakeGallery() {
  const { addToCart } = useCart();
  const handleAddToCart = (cake: Cake) => {
    addToCart({
      productId: cake.id.toString(),
      name: cake.name,
      price: cake.price,
      layers: 1, // Default for menu items
      flavor: "Vanilla", // Default flavor
      toppings: [],
      frostingColor: "bg-white",
      imageUri: cake.image,
    });
  };

  const cakes: Cake[] = [
    {
      id: 1,
      name: "Butterscotch Fudge Cake",
      price: 95.0,
      image: "/Butterscoch-Fudge.jpg",
      rating: 4.8,
      description: "Rich butterscotch layered with creamy fudge",
    },
    {
      id: 2,
      name: "Marble Cake",
      price: 95.0,
      image: "/marbel.jpg",
      rating: 4.5,
      description: "Classic vanilla and chocolate swirl",
    },
    {
      id: 3,
      name: "Mocha Chocolate Cake",
      price: 95.0,
      image: "/mocha-chocolate.jpg",
      rating: 4.9,
      description: "Coffee-infused dark chocolate delight",
    },
    {
      id: 4,
      name: "Pineapple Gateau",
      price: 105.0,
      image: "/pineapple.jpg",
      rating: 4.7,
      description: "Cream cheese frosted classic",
    },
    {
      id: 5,
      name: "Ultimate Chocolate Cake",
      price: 89.0,
      image: "/ultimate.jpg",
      rating: 4.6,
      description: "Zesty lemon with fresh blueberries",
    },
    {
      id: 6,
      name: "Red Velvet Cake",
      price: 99.0,
      image: "/red-velvet.jpg",
      rating: 4.8,
      description: "Sweet and salty perfection",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9F2] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-[#3A2E26] mb-4 font-serif">
            Our <span className="text-[#E67E5F]">Sweet</span> Collection
          </h1>
          <p className="text-[#7A6A5F] text-lg max-w-2xl mx-auto">
            Discover our handcrafted cakes made with love and premium
            ingredients
          </p>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {cakes.map((cake) => (
            <motion.div
              key={cake.id}
              variants={{
                hidden: { y: 20, opacity: 0 },
                show: { y: 0, opacity: 1 },
              }}
              className="group relative bg-white rounded-3xl shadow-xl overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/menu/${cake.id}`} className="block">
                <div className="relative aspect-square">
                  <Image
                    src={cake.image}
                    alt={cake.name}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-2xl font-bold text-[#3A2E26] group-hover:text-[#E67E5F] transition-colors duration-300">
                      {cake.name}
                    </h2>
                    <div className="flex items-center bg-[#FFF0E8] px-2 py-1 rounded-full">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="text-[#E67E5F] font-medium">
                        {cake.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-[#7A6A5F] mb-4 line-clamp-2">
                    {cake.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#E67E5F]">
                      ${cake.price.toFixed(2)}
                    </span>
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(cake);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-[#FFF0E8] p-3 rounded-full text-[#E67E5F] hover:bg-[#FFE5D9] transition-colors duration-300"
                    >
                      <ShoppingCartIcon className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
