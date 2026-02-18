import { Link } from 'react-router-dom';
import { HiOutlineHeart } from 'react-icons/hi';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-display font-bold text-gray-900">
                Surpli<span className="text-primary-600">fy</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Connecting surplus food with hungry people. Reduce waste, save money, help the planet.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/browse" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">Browse Food</Link></li>
              <li><Link to="/register" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">Get Started</Link></li>
              <li><Link to="/login" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* For Businesses */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">For Businesses</h4>
            <ul className="space-y-2">
              <li><Link to="/register" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">Register Shop</Link></li>
              <li><Link to="/login" className="text-sm text-gray-500 hover:text-primary-600 transition-colors">Shop Dashboard</Link></li>
            </ul>
          </div>

          {/* Impact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Our Mission</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Every year, billions of meals go to waste. Surplify bridges the gap between surplus food and people who need it — at prices everyone can afford.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Surplify. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            Made with <HiOutlineHeart className="w-4 h-4 text-red-400" /> to fight food waste
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
