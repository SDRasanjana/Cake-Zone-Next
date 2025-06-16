"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/context/CartContext";
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
  const { addToCart, totalItems } = useCart();
  const router = useRouter();
  const [cakes, setCakes] = useState<Cake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCakes() {
      setLoading(true);
      try {
        const res = await fetch("/api/cakes");
        const data = await res.json();
        setCakes(data);
      } catch (err) {
        setCakes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCakes();
  }, []);

  const handleAddToCart = (cake: Cake) => {
    addToCart({
      id: cake._id,
      name: cake.name,
      price: cake.price,
      image: cake.image
    });
  };

  if (loading) {
    return <div className="text-center py-20">Loading cakes...</div>;
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
