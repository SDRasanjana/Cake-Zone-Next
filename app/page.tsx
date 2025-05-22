import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white min-h-screen flex items-center overflow-hidden">
        {/* Background with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-80 z-20"></div>
        </div>

        {/* Left Content */}
        <div className="relative z-30 container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
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

            {/* Cake Image with Effects */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Glowing Background Circle */}
                <div className="absolute -inset-8 bg-gradient-to-r from-orange-500/20 via-orange-400/30 to-yellow-400/20 rounded-full blur-3xl animate-pulse"></div>

                {/* Main Cake Image */}
                <div className="relative z-10 transform hover:scale-105 transition duration-500">
                  <Image
                    src="/cake-background.jpg" // Replace with your actual cake image path
                    alt="Delicious chocolate cake with cherries and cream"
                    width={500}
                    height={500}
                    className="rounded-lg shadow-2xl"
                  />

                  {/* Sparkle Effects */}
                  <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
                  <div className="absolute top-12 left-8 w-2 h-2 bg-orange-400 rounded-full animate-ping delay-300"></div>
                  <div className="absolute bottom-16 right-12 w-4 h-4 bg-yellow-200 rounded-full animate-ping delay-700"></div>
                  <div className="absolute bottom-8 left-4 w-2 h-2 bg-orange-300 rounded-full animate-ping delay-1000"></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 bg-orange-500/20 rounded-full animate-bounce delay-200"></div>
                <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-yellow-400/30 rounded-full animate-bounce delay-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full blur-2xl"></div>
      </section>

      {/* About Us Section */}
      <section className="bg-white text-center px-6 py-16">
        {/* Section title */}
        <h2 className="text-orange-500 font-bold text-lg mb-2 uppercase">
          About Us
        </h2>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900">
          WELCOME TO CAKEZONE
        </h1>
        <div className="w-24 h-1 bg-orange-500 mx-auto mb-8"></div>

        {/* Description */}
        <p className="max-w-3xl mx-auto text-gray-700 mb-4">
          Tempor erat elitr reb um clita. Diam dolor diam ipsum erat lorem sed
          stet labore lorem sit clita duo
        </p>
        <p className="max-w-3xl mx-auto text-gray-600 mb-12">
          Tempor erat elitr at rebum at clita. Diam dolor diam ipsum et tempor
          sit. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit.
          Sanctus clita duo justo et tempor eirmod magna dolore erat amet magna
        </p>

        {/* Image + Features */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-10">
          <Image
            src="/cake-banner.jpg"
            alt="Cake Banner"
            width={400}
            height={300}
            className="rounded-xl shadow-lg"
          />

          <div className="flex flex-col gap-6 text-left">
            {/* Feature 1 */}
            <div className="flex items-start gap-4">
              <div className="bg-orange-400 p-3 rounded-md text-white text-2xl">
                ❤️
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  100% HEALTHY
                </h3>
                <p className="text-sm text-gray-600">
                  Labore justo vero ipsum sit clita erat lorem magna clita
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4">
              <div className="bg-orange-400 p-3 rounded-md text-white text-2xl">
                🏆
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  AWARD WINNING
                </h3>
                <p className="text-sm text-gray-600">
                  Labore justo vero ipsum sit clita erat lorem magna clita
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
