// app/about/page.tsx
import Image from 'next/image';

export default function AboutPage() {
  const teamMembers = [
    { name: "Chidi Eze", role: "Bartender", image: "/team1.jpg" },
    { name: "Samira Hadid", role: "Founder", image: "/team2.jpg" },
    { name: "Aaron Loeb", role: "Barista", image: "/team3.jpg" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background Image */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/background.jpg"
            alt="Cake shop background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-md">About Us</h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white leading-relaxed drop-shadow-md">
            At CalleZone, we blend tradition with technology to deliver a truly delightful cake shopping experience. Our smart
            web-based platform empowers small-scale cake businesses by integrating AI-driven tools for both owners and customers.
          </p>
        </div>
      </section>

      {/* Enhanced Vision Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Image Column */}
            <div className="w-full lg:w-1/2 h-96 relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/vision-cake.jpg"
                alt="Our vision in cakes"
                fill
                className="object-cover"
              />
            </div>
            
            {/* Text Column */}
            <div className="w-full lg:w-1/2">
              <h2 className="text-3xl sm:text-4xl font-bold text-pink-600 mb-6">
                Our <span className="text-amber-600">Vision</span>
              </h2>
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-16 h-16 border-t-2 border-l-2 border-pink-300 rounded-tl-lg"></div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 border-b-2 border-r-2 border-amber-300 rounded-br-lg"></div>
                <blockquote className="relative bg-amber-50 p-8 rounded-lg">
                  <p className="text-lg sm:text-xl italic text-gray-700 leading-relaxed">
                    "To be the most loved neighborhood cake shop, delighting every customer with freshly baked creations that
                    celebrate life's sweetest moments, while embracing innovation, sustainability, and a personal touch in every slice."
                  </p>
                </blockquote>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-pink-50 p-4 rounded-lg">
                  <h3 className="font-bold text-pink-600 mb-2">Innovation</h3>
                  <p className="text-sm text-gray-600">Continually improving our recipes and techniques</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-bold text-amber-600 mb-2">Sustainability</h3>
                  <p className="text-sm text-gray-600">Eco-friendly packaging and locally sourced ingredients</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-amber-600 mb-12">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 relative">
                  {/* Replace with actual images */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    Member Photo
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                  <p className="text-pink-600 mt-2">{member.role}</p>
                  <p className="text-gray-600 mt-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}