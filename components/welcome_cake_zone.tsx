"use client"; // Add this directive at the very top

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaHeartbeat, FaAward, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const cakeImages = [
  "/cake1.jpg",
  "/cake2.jpg",
  "/cake3.jpg",
  "/cake4.jpg",
  "/cake5.jpg"
];

const About = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === cakeImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? cakeImages.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl text-orange-500 font-bold mb-2 text-center">About Us</h2>
      <h1 className="text-5xl font-extrabold text-center mb-6">WELCOME TO CAKEZONE</h1>
      <div className="flex justify-center mb-10">
        <div className="w-20 h-1 bg-orange-500 mx-2" />
      </div>
      
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Slideshow Section */}
        <div className="relative h-[400px] overflow-hidden rounded-lg shadow-md">
          {cakeImages.map((image, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            >
              <Image 
                src={image}
                alt={`CakeZone Cake ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
          ))}
          
          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
            aria-label="Previous slide"
          >
            <FaChevronLeft className="text-orange-500" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
            aria-label="Next slide"
          >
            <FaChevronRight className="text-orange-500" />
          </button>
          
          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {cakeImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-orange-500' : 'bg-white/50'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Text Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            At CakeZone, we blend the timeless joy of baking with the power of intelligent technology.
          </h3>
          <p className="text-gray-600 mb-8">
            More than just a cake shop, we are a digital dessert destination that brings creativity, customization, and smart planning
            to your fingertips. Our platform was built to serve both cake lovers and small-scale cake shop owners, combining beautiful design

          </p>

          {/* Why Choose Us Title */}
          <h4 className="text-xl font-bold text-orange-500 mb-6">Why Choose Us?</h4>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="bg-orange-500 inline-block p-4 rounded">
                <FaHeartbeat className="text-white text-3xl" />
              </div>
              <h5 className="font-bold text-lg mt-3">AI-Powered Cake Customization</h5>
              <p className="text-gray-600 mt-2">
                You can select your preferred flavors, layers, colors, and toppings and instantly see a 3D AI-generated cake preview.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-500 inline-block p-4 rounded">
                <FaAward className="text-white text-3xl" />
              </div>
              <h5 className="font-bold text-lg mt-3">Smart Budget Forecasting for Shop Owners</h5>
              <p className="text-gray-600 mt-2">
                CakeZone uses an AI-enabled budgeting system to forecast ingredient prices, helping bakery owners make smarter purchases,
                cut costs, and minimize waste.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;