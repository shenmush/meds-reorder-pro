import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pill, Menu, X } from 'lucide-react';
import { useState } from 'react';

const LandingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    { name: 'محصولات', href: '/products' },
    { name: 'چرا سامانه داروخانه؟', href: '/about' },
    { name: 'سازمانی', href: '/enterprise' },
  ];

  return (
    <header className="relative z-50 w-full">
      {/* Curved bubble background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[120%] h-40 bg-gradient-to-r from-green-200 via-green-300 to-green-200 rounded-full opacity-60"></div>
      </div>

      {/* White header container */}
      <div className="relative z-10 mx-4 lg:mx-8 mt-4">
        <div className="bg-white rounded-full shadow-lg border border-gray-100">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 space-x-reverse">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-800">
                  <Pill className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-teal-800">
                  سامانه داروخانه
                </span>
              </Link>

              {/* Desktop Navigation - Center */}
              <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-slate-700 hover:text-teal-800 transition-colors duration-200 font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* CTA Button - Right */}
              <div className="hidden md:flex items-center">
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold px-6 py-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg border-0"
                >
                  ورود
                </Button>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6 text-slate-700" />
                ) : (
                  <Menu className="h-6 w-6 text-slate-700" />
                )}
              </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="md:hidden py-4 border-t border-slate-200">
                <nav className="flex flex-col space-y-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-slate-700 hover:text-teal-800 transition-colors duration-200 font-medium py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Button 
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold px-6 py-2 rounded-full mt-4 w-fit"
                  >
                    ورود
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;