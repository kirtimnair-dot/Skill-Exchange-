import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-cyan-900 to-blue-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Info */}
          <div>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                SE
              </div>
              <span className="ml-3 text-xl font-bold">SkillExchange</span>
            </div>
            <p className="text-cyan-300">
              A community-driven platform where people learn, teach, and grow by exchanging skills locally and securely.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-cyan-100">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-cyan-300 hover:text-white transition hover:translate-x-1 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/skills" className="text-cyan-300 hover:text-white transition hover:translate-x-1 inline-block">
                  Browse Skills
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-cyan-300 hover:text-white transition hover:translate-x-1 inline-block">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-cyan-300 hover:text-white transition hover:translate-x-1 inline-block">
                  Safety
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-cyan-100">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-cyan-300 hover:text-white transition hover:translate-x-1 inline-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-cyan-300 hover:text-white transition hover:translate-x-1 inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/guidelines" className="text-cyan-300 hover:text-white transition hover:translate-x-1 inline-block">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cyan-800 mt-10 pt-6 text-center text-cyan-400">
          <p>&copy; {new Date().getFullYear()} SkillExchange. All rights reserved.</p>
          <p className="text-sm mt-2">Building communities through knowledge sharing.</p>
        </div>
      </div>
    </footer>
  );
}
