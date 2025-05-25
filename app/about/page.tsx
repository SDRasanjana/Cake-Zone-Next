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
<section className="relative h-[90vh] min-h-[600px] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
  {/* Enhanced Background with Parallax Effect */}
  <div className="absolute inset-0 z-0">
    <Image
      src="/background1.jpg"
      alt="Artisanal cake bakery"
      fill
      className="object-cover object-center scale-110"
      priority
      quality={90}
    />
    {/* Gradient Overlay with Directional Light */}
    <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/25 to-black/40"></div>
    {/* Decorative Floating Elements */}
    <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-pink-400/10 blur-[80px]"></div>
    <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-amber-400/10 blur-[80px]"></div>
  </div>

  {/* Glassmorphic Content Container */}
  <div className="relative z-10 max-w-5xl mx-auto text-center backdrop-blur-sm bg-white/10 p-8 sm:p-12 rounded-2xl border border-white/20 shadow-2xl transform transition-all hover:scale-[1.01]">
    {/* Animated Title with Gradient Text */}
    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 animate-fadeIn">
      <span className="bg-gradient-to-r from-pink-300 to-amber-200 bg-clip-text text-transparent">
        About Us
      </span>
    </h1>
    
    {/* Decorative Divider */}
    <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-amber-400 mx-auto mb-8 rounded-full"></div>
    
    {/* Enhanced Content with Typography Hierarchy */}
    <div className="space-y-6">
      <p className="text-xl sm:text-2xl text-white font-medium leading-relaxed">
        Where <span className="text-pink-300 font-bold">tradition</span> meets <span className="text-amber-300 font-bold">innovation</span>
      </p>
      <p className="text-lg sm:text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
        We make cake shopping easy by using skilled bakers and smart technology for both businesses and customers.
      </p>
    </div>
    
    {/* Interactive CTA Button */}
    <div className="mt-10">
      <button className="px-8 py-3 bg-gradient-to-r from-pink-500 to-amber-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 group">
        Our Menu
        <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
      </button>
    </div>
  </div>

  
</section>
      {/* Vision Section */}
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
                    celebrate life&apos;s sweetest moments, while embracing innovation, sustainability, and a personal touch in every slice."
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
                  {/* Member Image Placeholder */}
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