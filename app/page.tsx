import About from "@/components/welcome_cake_zone";
import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Background Image and Overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/cake-background.jpg" // Your background image path
          alt="CakeZone background"
          fill
          priority
          quality={100}
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-80 z-20"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-30 container mx-auto px-4 py-20">
        <div className="max-w-2xl">
          <h3 className="text-orange-500 text-3xl italic font-light mb-4">
            Super Crispy
          </h3>
          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            CAKEZONE
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-200">
            THE BEST CAKE IN SRILANKA
          </h2>

          <div className="flex items-center gap-6">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded font-semibold transition duration-300 transform hover:scale-105">
              Read More
            </button>

            <button className="flex items-center gap-3 text-white hover:text-orange-400 transition duration-300 group">
              <div className="bg-white text-orange-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300">
                <svg
                  className="w-6 h-6 ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <span className="text-xl font-semibold">Play Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full blur-2xl"></div>

      <About />
      {/*linked from the welcome_cake_zone.tsx file*/}
    </>
  );
}
