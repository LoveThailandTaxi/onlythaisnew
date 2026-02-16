import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-6 h-6 text-red-500" fill="currentColor" />
              <span className="text-white text-xl font-bold">OnlyThais</span>
            </div>
            <p className="text-sm text-gray-400">
              Premium platform connecting you with verified Thai content creators.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/browse" className="hover:text-white transition-colors">
                  Browse Profiles
                </Link>
              </li>
              <li>
                <Link to="/subscribe" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/creator-signup" className="hover:text-white transition-colors">
                  Become a Creator
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/guidelines" className="hover:text-white transition-colors">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="mailto:support@onlythais.club" className="hover:text-white transition-colors">
                  support@onlythais.club
                </a>
              </li>
              <li>
                <a href="mailto:support@onlythais.club" className="hover:text-white transition-colors">
                  Creator Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © 2026 OnlyThais. All rights reserved.
            </p>
            <p className="text-sm text-gray-400">
              Made with <Heart className="w-4 h-4 inline text-red-500" fill="currentColor" /> in Thailand
            </p>
          </div>
          <div className="mt-4 text-center">
            <Link to="/auth?admin=true" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
