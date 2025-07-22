import Image from 'next/image';

const AboutSection = () => {
  return (
    <section className="relative w-full h-[600px]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/cake-background.jpg" // Replace with your actual uploaded background
          alt="Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Left Text Box */}
        <div className="bg-[#A47D65] bg-opacity-90 text-white p-6 rounded-lg max-w-xl shadow-lg">
          <p className="text-lg leading-relaxed">
            At <span className="font-bold">CakeZone</span>, we blend tradition with technology to deliver
            a truly delightful cake shopping experience. Our smart web-based
            platform empowers small-scale cake businesses by integrating AI-driven tools
            for both owners and customers. Whether you’re planning a birthday surprise or
            a custom creation for a special event, CakeZone offers you the freedom to
            design your dream cake within your budget.
          </p>
        </div>

        {/* Right Text - About Us */}
        <div className="text-right pr-8">
          <h2 className="text-6xl font-bold text-white drop-shadow-lg">About</h2>
          <h2 className="text-6xl font-bold text-white drop-shadow-lg -mt-4">Us</h2>
          <hr className="mt-6 w-24 border-white border-t-2 ml-auto" />
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
