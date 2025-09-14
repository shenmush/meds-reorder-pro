import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Linkedin } from 'lucide-react';

const LandingFooter = () => {
  const footerLinks = [
    { name: 'سیستم داروخانه', href: '/products' },
    { name: 'اپلیکیشن بیماران', href: '/patient-app' },
    { name: 'چرا سامانه داروخانه؟', href: '/about' },
    { name: 'سازمانی', href: '/enterprise' },
  ];

  return (
    <footer className="relative">
      {/* Main Footer */}
      <div className="bg-slate-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3 space-x-reverse mb-8 lg:mb-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-800">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                سامانه داروخانه
              </span>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-wrap gap-x-8 gap-y-4 items-center mb-8 lg:mb-0">
              {footerLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium"
                >
                  {link.name}
                </Link>
              ))}
              
              {/* LinkedIn Icon */}
              <a
                href="#"
                className="text-white hover:text-gray-300 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-slate-800 text-gray-400 py-4">
        <div className="container mx-auto px-4">
          <div className="text-center lg:text-right">
            <Link
              to="/privacy"
              className="text-sm hover:text-gray-300 transition-colors duration-200"
            >
              سیاست حریم خصوصی
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;