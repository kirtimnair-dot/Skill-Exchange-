import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-cyan-900 to-blue-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                SE
              </div>
              <span className="ml-3 text-xl font-bold">SkillExchange</span>
            </div>
            <p className="text-cyan-300 mb-4">
              Connecting communities through skill sharing. Learn, teach, and grow together.
            </p>
            <div className="space-y-2 text-cyan-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@skillexchange.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-cyan-100">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-cyan-300 hover:text-white transition hover:translate-x-1 inline-block">Home</Link></li>
              <li><Link to="/skills" className="text-cyan-300 hover:text-white transition hover:translate-x-1 inline-block">Browse Skills</Link></li>
              <li><Link to="/how-it-works" className="text-cyan-300 hover:text-white transition hover:translate-x-1 inline-block">How It Works</Link></li>
              <li><Link to="/safety" className="text-cyan-300 hover:text-white transition hover:translate-x-1 inline-block">Safety</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-cyan-100">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/terms" className="text-cyan-300 hover:text-white transition hover:translate-x-1 inline-block">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-cyan-300 hover:text-white transition hover:translate-x-1 inline-block">Privacy Policy</Link></li>
              <li><Link to="/community" className="text-cyan-300 hover:text-white transition hover:translate-x-1 inline-block">Community Guidelines</Link></li>
              <li><Link to="/contact" className="text-cyan-300 hover:text-white transition hover:translate-x-1 inline-block">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-cyan-100">Stay Updated</h3>
            <p className="text-cyan-300 mb-4">Get the latest skill sharing tips</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-grow px-4 py-2 rounded-l-lg text-gray-900 outline-none focus:ring-2 focus:ring-cyan-500" 
              />
              <button className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 rounded-r-lg hover:opacity-90 transition">
                Subscribe
              </button>
            </div>
            <p className="text-cyan-400 text-sm mt-3">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        <div className="border-t border-cyan-800 mt-8 pt-8 text-center text-cyan-400">
          <p>&copy; {new Date().getFullYear()} SkillExchange. All rights reserved.</p>
          <p className="text-sm mt-2">Building communities through knowledge sharing</p>
        </div>
      </div>
    </footer>
  );
}