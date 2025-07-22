import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import Head from 'next/head';

const Contact = () => {
  return (
    <>
      <Head>
        <title>Contact Us | CakeZone</title>
        <meta name="description" content="Get in touch with CakeZone for delicious cakes and pastries" />
      </Head>
      
      <section className="bg-white text-black py-20 px-6 lg:px-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold mb-4">Contact Us</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Reach out to us for any queries, suggestions, or orders. We&#39;re here to bake your day better!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Left Section - Contact Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Get In Touch</h3>
            <p className="text-gray-600">Feel free to contact us for personalized cakes, feedback, or general inquiries.</p>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-center">
                <FaMapMarkerAlt className="text-orange-500 mr-3" />
                <span>123 Bakery Lane, Sweetville, CA 90210</span>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt className="text-orange-500 mr-3" />
                <span>+1 (123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-orange-500 mr-3" />
                <span>info@cakezone.com</span>
              </li>
            </ul>

            <div className="mt-6">
              <p className="font-semibold mb-2">Follow Us:</p>
              <div className="flex space-x-4">
                <a href="#" className="text-orange-500 text-2xl hover:text-orange-600"><FaFacebook /></a>
                <a href="#" className="text-orange-500 text-2xl hover:text-orange-600"><FaTwitter /></a>
                <a href="#" className="text-orange-500 text-2xl hover:text-orange-600"><FaInstagram /></a>
                <a href="#" className="text-orange-500 text-2xl hover:text-orange-600"><FaYoutube /></a>
              </div>
            </div>
          </div>

          {/* Right Section - Contact Form */}
          <div className="bg-gray-100 p-8 rounded-lg shadow-md">
            <h4 className="text-xl font-bold mb-6">Send a Message</h4>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                required
              />
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                required
              />
              <textarea
                rows={4}
                placeholder="Message"
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                required
              ></textarea>
              <button
                type="submit"
                className="w-full bg-orange-500 text-white font-bold py-3 rounded hover:bg-orange-600 transition-colors"
              >
                Submit
              </button>
            </form>
          </div>
        </div>

        {/* Embedded Google Map */}
        <div className="w-full h-96">
          <iframe
            title="CakeZone Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.072189176407!2d-122.4194152846816!3d37.77492977975913!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809caaaaaaab%3A0xf59f7d5b912a6d6b!2sBakery!5e0!3m2!1sen!2sus!4v1620730847305!5m2!1sen!2sus"
            width="100%"
            height="100%"
            className="border-0 rounded-lg"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </section>
    </>
  );
};

export default Contact;