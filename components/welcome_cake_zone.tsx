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
            src="/images/about-cake.png"
            alt="CakeZone Cake"
            width={600}
            height={500}
            className="rounded-lg shadow-md"
          />
        </div>

        {/* Text Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Tempor erat elitr rebum clita. Diam dolor diam ipsum erat lorem sed stet labore lorem sit clita duo
          </h3>
          <p className="text-gray-600 mb-8">
            Tempor erat elitr at rebum at at clita. Diam dolor diam ipsum et tempor sit. Clita erat ipsum et lorem et sit, sed stet no labore lorem sit. Sanctus clita duo justo et tempor eirmod magna dolore erat amet magna.
          </p>

          {/* Why Choose Us Title */}
          <h4 className="text-xl font-bold text-orange-500 mb-6">Why Choose Us?</h4>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="bg-orange-500 inline-block p-4 rounded">
                <FaHeartbeat className="text-white text-3xl" />
              </div>
              <h5 className="font-bold text-lg mt-3">100% HEALTHY</h5>
              <p className="text-gray-600 mt-2">
                Labore justo vero ipsum sit clita erat lorem magna clita nonumy dolor magna dolor vero
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-500 inline-block p-4 rounded">
                <FaAward className="text-white text-3xl" />
              </div>
              <h5 className="font-bold text-lg mt-3">AWARD WINNING</h5>
              <p className="text-gray-600 mt-2">
                Labore justo vero ipsum sit clita erat lorem magna clita nonumy dolor magna dolor vero
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
