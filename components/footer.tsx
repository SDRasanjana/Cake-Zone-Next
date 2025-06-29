import Link from 'next/link';
import { 
  FaFacebook, FaInstagram, FaTwitter, FaYoutube, 
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, 
  FaHome, FaInfoCircle, FaUtensils, FaAddressBook 
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-16 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-orange-500">CAKEZONE</h1>
            <p className="text-gray-300">
              Your premier destination for exquisite cakes and pastries. We craft delicious moments with quality ingredients and artistic designs for every occasion.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/cakezone" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                <FaFacebook className="text-white" />
              </a>
              <a href="https://www.instagram.com/cakezone" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                <FaInstagram className="text-white" />
              </a>
              <a href="https://www.twitter.com/cakezone" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                <FaTwitter className="text-white" />
              </a>
              <a href="https://www.youtube.com/cakezone" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-orange-500 transition-colors">
                <FaYoutube className="text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-orange-500">QUICK LINKS</h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link href="/" className="flex items-center hover:text-orange-500 transition-colors">
                  <FaHome className="text-orange-500 mr-3" />
                  HOME 
                </Link>
              </li>
              <li>
                <Link href="/about" className="flex items-center hover:text-orange-500 transition-colors">
                  <FaInfoCircle className="text-orange-500 mr-3" />
                  ABOUT US 
                </Link>
              </li>
              <li>
                <Link href="/menu" className="flex items-center hover:text-orange-500 transition-colors">
                  <FaUtensils className="text-orange-500 mr-3" />
                  MENU & PRICING 
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center hover:text-orange-500 transition-colors">
                  <FaAddressBook className="text-orange-500 mr-3" />
                  CONTACT US 
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-orange-500">CONTACT US</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start">
                <FaMapMarkerAlt className="text-orange-500 mt-1 mr-3 flex-shrink-0" />
                <span>123 Bakery Street, Sweetville, CA 90210, USA</span>
              </li>
              <li className="flex items-center">
                <FaEnvelope className="text-orange-500 mr-3 flex-shrink-0" />
                <a href="mailto:orders@cakezone.com" className="hover:text-orange-500 transition-colors">
                  orders@cakezone.com
                </a>
              </li>
              <li className="flex items-center">
                <FaPhoneAlt className="text-orange-500 mr-3 flex-shrink-0" />
                <a href="tel:+11234567890" className="hover:text-orange-500 transition-colors">
                  +1 (123) 456-7890
                </a>
              </li>
             
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-orange-500">NEWSLETTER</h3>
            <p className="text-gray-300 font-semibold">Subscribe for our sweetest updates</p>
            <p className="text-gray-300 mb-4">Get exclusive deals, tips, and cake news straight to your inbox.</p>
            <form className="space-y-4">
              <label htmlFor="newsletter" className="sr-only">Email Address</label>
              <input 
                type="email" 
                id="newsletter"
                name="email"
                placeholder="Your Email" 
                className="px-4 py-3 bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-orange-500 w-full rounded"
                required
              />
              <button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 w-full rounded transition-colors"
              >
                Sign Up
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>© 2025 CakeZone. All Rights Reserved. Designed by CakeZone Team</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
