import { motion } from 'framer-motion';
import { FiGithub, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-primary to-secondary text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">🏛️ Sampark</h3>
            <p className="text-sm opacity-90">
              Empowering rural governance through digital transformation. 
              Sampark connects panchayats with modern survey management tools.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/dashboard" className="hover:text-accent transition">Dashboard</a></li>
              <li><a href="/surveys" className="hover:text-accent transition">Surveys</a></li>
              <li><a href="/about" className="hover:text-accent transition">About</a></li>
              <li><a href="/help" className="hover:text-accent transition">Help & Support</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/docs" className="hover:text-accent transition">Documentation</a></li>
              <li><a href="/api" className="hover:text-accent transition">API Reference</a></li>
              <li><a href="/privacy" className="hover:text-accent transition">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-accent transition">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <FiMail />
                <span>support@sampark.gov.in</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiPhone />
                <span>1800-XXX-XXXX</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiMapPin />
                <span>New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm opacity-90">
            © 2025 Sampark. All rights reserved. | Developed for Rural Governance
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <motion.a
              whileHover={{ scale: 1.1, y: -2 }}
              href="#"
              className="hover:text-accent transition"
            >
              <FiGithub size={20} />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
