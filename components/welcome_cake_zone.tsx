import Image from 'next/image';
import { FaHeartbeat, FaAward } from 'react-icons/fa';

const About = () => {
  return (
    <section className="py-20 px-4 max-w-6xl mx-auto">
      <h2 className="text-3xl text-orange-500 font-bold mb-2 text-center">About Us</h2>
      <h1 className="text-5xl font-extrabold text-center mb-6">WELCOME TO CAKEZONE</h1>
      <div className="flex justify-center mb-10">
        <div className="w-20 h-1 bg-orange-500 mx-2" />
      </div>
      
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Image Section */}
        <div>
          <Image 
            src="/cake-banner.jpg"
            alt="CakeZone Cake"
            width={600}
            height={400}
            className="rounded-lg shadow-md"
          />
        </div>

        {/* Text Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            At CakeZone, we blend the timeless joy of baking with the power of intelligent technology.

          </h3>
          <p className="text-gray-600 mb-8">
            More than just 
            a cake shop, we are a digital dessert destination that brings creativity, customization, and smart planning
            to your fingertips. Our platform was built to serve both cake lovers and small-scale cake shop owners, combining beautiful design
             with AI-powered tools that transform how cakes are ordered, created, and managed.
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
