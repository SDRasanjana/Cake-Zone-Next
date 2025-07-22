"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCart } from "@/contexts/CartContext";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import OptimizedImage from "@/components/OptimizedImage";

interface Cake {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  rating?: number;
  category?: string;
  stock?: number;
  createdAt?: string;
  updatedAt?: string;
  ingredients?: string[];
  weight?: string;
  images?: string[];
  relatedCakes?: Array<{
    id: string | number;
    name: string;
    image: string;
    price: number;
  }>;
}

const CakeDetails = () => {
  const params = useParams();
  const id = params?.id;
  const [cakeData, setCakeData] = useState<Cake | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Get image source with fallback
  const getImageSrc = (imagePath: string | undefined) => {
    if (!imagePath || imageError) {
      return "/default-cake.png";
    }

    // Handle base64 data URLs (uploaded images)
    if (imagePath.startsWith("data:image")) {
      return imagePath;
    }

    // Handle HTTP/HTTPS URLs
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Handle relative paths - ensure they start with /
    if (!imagePath.startsWith("/")) {
      return "/" + imagePath;
    }

    return imagePath;
  };

  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true);
  };

  // Fetch cake data from API
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    fetch(`/api/cakes/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.message) {
          // This is an error response
          throw new Error(data.message);
        }
        setCakeData(data);
        console.log("Successfully fetched cake data:", data);
      })
      .catch((err) => {
        console.error("Error fetching cake:", err);
        setError(err.message || "Failed to fetch cake details");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    if (!cakeData) return;
    // Add all required fields for CartItem, with sensible defaults for a normal cake
    addToCart({
      name: cakeData.name,
      price: cakeData.price,
      layers: 1, // Default to 1 layer
      flavor: "Vanilla", // Default flavor
      toppings: [], // No toppings by default
      frostingColor: "bg-pink-400", // Default frosting color
      productId: cakeData._id?.toString() || "",
      imageUri: getImageSrc(cakeData.images?.[0] || cakeData.image),
      quantity: quantity, // Use selected quantity
    });
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E67E5F] mx-auto mb-4"></div>
          <p className="text-[#7A6A5F] text-lg">Loading cake details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-red-800 mb-2">
              Cake Not Found
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => (window.location.href = "/menu")}
              className="bg-[#E67E5F] text-white px-4 py-2 rounded-lg hover:bg-[#D66A4F] transition-colors"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cakeData) {
    return (
      <div className="min-h-screen bg-[#FFF9F2] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#7A6A5F] text-lg">No cake data available</p>
          <button
            onClick={() => (window.location.href = "/menu")}
            className="mt-4 bg-[#E67E5F] text-white px-4 py-2 rounded-lg hover:bg-[#D66A4F] transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F2] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery Section */}
          <div className="space-y-6">
            <motion.div
              layoutId={`cake-image-${cakeData._id}`}
              className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-xl"
              whileHover={{ scale: isZoomed ? 1 : 1.02 }}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <OptimizedImage
                src={getImageSrc(
                  cakeData.images?.[selectedImage] || cakeData.image
                )}
                alt={cakeData.name}
                fill
                className={`object-cover transform transition-transform duration-500 ${
                  isZoomed
                    ? "scale-150 cursor-zoom-out"
                    : "hover:scale-110 cursor-zoom-in"
                }`}
                quality={100}
                onError={handleImageError}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {isZoomed && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                  Click to zoom out
                </div>
              )}
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {(cakeData.images && cakeData.images.length > 0
                ? cakeData.images
                : [cakeData.image]
              ).map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  title={`View ${
                    index === 0
                      ? "front"
                      : index === 1
                      ? "side"
                      : index === 2
                      ? "back"
                      : "top"
                  } of the cake`}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-[#E67E5F]"
                      : "border-transparent"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <OptimizedImage
                    src={getImageSrc(image)}
                    alt={`${cakeData.name} ${
                      index === 0
                        ? "front view"
                        : index === 1
                        ? "side view"
                        : index === 2
                        ? "back view"
                        : "top view"
                    }`}
                    fill
                    className="object-cover"
                    onError={handleImageError}
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
                  Rs. {cakeData.price.toFixed(2)}
                </p>
              </div>
              <motion.button
                onClick={() => setIsLiked(!isLiked)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-full bg-white shadow-md"
                title={isLiked ? "Remove from favorites" : "Add to favorites"}
                aria-label={
                  isLiked ? "Remove from favorites" : "Add to favorites"
                }
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6 text-gray-400" />
                )}
              </motion.button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#3A2E26]">
                Description
              </h3>
              <p className="text-[#7A6A5F]">{cakeData.description}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#3A2E26]">
                Ingredients
              </h3>
              <div className="flex flex-wrap gap-2">
                {cakeData.ingredients && cakeData.ingredients.length > 0 ? (
                  cakeData.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-full bg-[#FFEDE5] text-[#E67E5F] text-sm font-medium"
                    >
                      {ingredient}
                    </span>
                  ))
                ) : (
                  <span className="px-4 py-2 rounded-full bg-[#FFEDE5] text-[#E67E5F] text-sm font-medium">
                    Premium ingredients
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#3A2E26]">Weight</h3>
                <p className="text-[#7A6A5F]">{cakeData.weight || "1.0 kg"}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[#3A2E26]">
                  Category
                </h3>
                <p className="text-[#7A6A5F]">
                  {cakeData.category || "Classic"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#3A2E26]">Quantity</h3>
              <div className="flex items-center space-x-6">
                <div className="flex items-center border-2 border-[#E67E5F] rounded-full">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-3 text-[#E67E5F] hover:text-[#D45D3E] disabled:opacity-50"
                    disabled={quantity <= 1}
                    title="Decrease quantity"
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-semibold text-[#3A2E26]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-3 text-[#E67E5F] hover:text-[#D45D3E] disabled:opacity-50"
                    disabled={quantity >= 10}
                    title="Increase quantity"
                    aria-label="Increase quantity"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-gradient-to-r from-[#E67E5F] to-[#D45D3E] text-white py-4 px-8 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Add to Cart - Rs. {(cakeData.price * quantity).toFixed(2)}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Cakes Section */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-[#3A2E26] font-serif mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {cakeData.relatedCakes?.map((cake) => (
              <motion.div
                key={cake.id}
                whileHover={{ y: -10 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer"
              >
                <div className="relative aspect-square">
                  <OptimizedImage
                    src={cake.image}
                    alt={cake.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-[#3A2E26] text-lg mb-2">
                    {cake.name}
                  </h3>
                  <p className="text-[#E67E5F] font-bold">
                    Rs. {cake.price.toFixed(2)}
                  </p>
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
