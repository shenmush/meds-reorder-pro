import { Linkedin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative bg-cyan-950 py-14 md:py-[88px] mt-32">
      {/* Wave Background - Desktop */}
      <div className="absolute hidden md:block h-[278px] top-[-116px] w-full left-0 z-0">
        <div className="wave-desktop"></div>
      </div>
      
      {/* Wave Background - Mobile */}
      <div className="absolute block md:hidden h-[136px] top-[-136px] w-full left-0 z-0">
        <div className="wave-mobile"></div>
      </div>

      {/* Footer Content */}
      <div className="relative z-20 container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          {/* Logo */}
          <div className="mb-8 lg:mb-0">
            <span className="text-3xl font-bold text-white">
              بارمان
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-4 items-center">
            <a 
              href="#" 
              className="text-white hover:text-gray-300 transition-colors duration-200 font-medium"
            >
              سیستم داروخانه
            </a>
            <a 
              href="#" 
              className="text-white hover:text-gray-300 transition-colors duration-200 font-medium"
            >
              اپلیکیشن بیماران
            </a>
            <a 
              href="#" 
              className="text-white hover:text-gray-300 transition-colors duration-200 font-medium"
            >
              چرا بارمان؟
            </a>
            <a 
              href="#" 
              className="text-white hover:text-gray-300 transition-colors duration-200 font-medium"
            >
              سازمانی
            </a>
            
            {/* LinkedIn Icon */}
            <a 
              href="#" 
              className="text-white hover:text-gray-300 transition-colors duration-200" 
              aria-label="LinkedIn"
            >
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
        </div>
        
        {/* Privacy Policy */}
        <div className="text-left">
          <a 
            href="/privacy" 
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200"
          >
            سیاست حریم خصوصی
          </a>
        </div>
      </div>
    </footer>
  );
};