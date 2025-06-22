"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";

interface Cake {
  _id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  description: string;
}

export default function CakeGallery() {
  const { addToCart, getItemCount } = useCart();
  const totalItems = getItemCount();
  const router = useRouter();
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCakes() {
      setLoading(true);
      setError(null);
      try {
        console.log("Frontend: Starting to fetch cakes...");
        
        const res = await fetch("/api/cakes");
        console.log("Frontend: Response status:", res.status);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Frontend: Raw API response:", data);
        console.log("Frontend: Is array?", Array.isArray(data));
        console.log("Frontend: Data type:", typeof data);
        
        // Handle both success and error responses
        if (res.status === 200 && Array.isArray(data)) {
          setCakes(data);
          console.log("Frontend: Successfully set cakes:", data.length, "items");
        } else if (data.message) {
          // This is an error response from the API
          console.error("API returned error:", data.message);
          setError(data.message);
          setCakes([]);
        } else {
          console.error("Unexpected response format:", data);
          setError("Unexpected response format from server");
          setCakes([]);
        }
      } catch (err) {
        console.error("Frontend: Error fetching cakes:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch cakes");
        setCakes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCakes();
  }, []);

  // Add a cake to the cart, mapping Cake fields to CartItem fields and providing defaults for required fields
  const handleAddToCart = (cake: Cake) => {
    addToCart({
      name: cake.name, // Cake name
      price: cake.price, // Cake price
      layers: 1, // Default to 1 layer for menu cakes
      flavor: "Vanilla", // Default flavor
      toppings: [], // No toppings by default
      frostingColor: "bg-pink-400", // Default frosting color
      productId: cake._id, // Use cake's _id as productId
      imageUri: cake.image, // Use cake image
      quantity: 1, // Default quantity
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E67E5F] mx-auto mb-4"></div>
          <p className="text-[#7A6A5F] text-lg">Loading delicious cakes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-red-800 mb-2">Oops! Something went wrong</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#E67E5F] text-white px-4 py-2 rounded-lg hover:bg-[#D66A4F] transition-colors"
            >
              Try Again
            </button>
          </div>
          <p className="text-[#7A6A5F] text-sm">
            If the problem persists, please check your internet connection or try again later.
          </p>
        </div>
      </div>
    );
  }

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
            Discover our handcrafted cakes made with love and premium ingredients
          </p>
        </motion.div>

        {Array.isArray(cakes) && cakes.length > 0 ? (
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {cakes.map((cake) => (
              <motion.div
                key={cake._id}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  show: { y: 0, opacity: 1 }
                }}
                className="group relative bg-white rounded-3xl shadow-xl overflow-hidden"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/menu/${cake._id}`} className="block">
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
                        <span className="text-[#E67E5F] font-medium">{cake.rating}</span>
                      </div>
                    </div>
                    <p className="text-[#7A6A5F] mb-4 line-clamp-2">{cake.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#E67E5F]">
                        Rs. {cake.price.toFixed(2)}
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
        ) : (
          <div className="text-center py-20">
            <div className="bg-white rounded-lg p-8 max-w-md mx-auto shadow-lg">
              <div className="text-6xl mb-4">🍰</div>
              <h3 className="text-xl font-bold text-[#3A2E26] mb-2">No Cakes Available</h3>
              <p className="text-[#7A6A5F] mb-4">
                We're currently updating our menu. Please check back soon!
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#E67E5F] text-white px-6 py-2 rounded-lg hover:bg-[#D66A4F] transition-colors"
              >
                Refresh Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}