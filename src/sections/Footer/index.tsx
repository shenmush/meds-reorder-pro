import { Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="relative bg-cyan-950 py-14 md:py-[88px] mt-32">
      {/* Wave Background - Desktop */}
      <div className="absolute hidden md:block h-[278px] top-[-116px] w-full left-0 z-10">
        <div className="wave-desktop before:accent-auto before:bg-[url(data:image/svg+xml;charset=utf-8,<svg%20width=%225080%22%20height=%22278%22%20fill=%22none%22%20xmlns=%22http://www.w3.org/2000/svg%22><path%20d=%22M2540%20278h2540V76.993C4762.5%2076.993%204762.5%200%204444.99%200c-317.5%200-317.5%2076.993-635%2076.993C3492.48%2076.993%203492.45%200%203174.98%200%202857.5%200%202857.48%2076.993%202540%2076.993V278ZM0%20278h2540V76.993C2222.5%2076.993%202222.5%200%201904.99%200c-317.5%200-317.5%2076.993-635%2076.993C952.483%2076.993%20952.455%200%20634.979%200%20317.503%200%20317.476%2076.993%200%2076.993V278Z%22%20fill=%22%23003241%22/></svg>)] before:bg-[position:0px_100%] before:bg-size-[100%_278px] before:block before:h-[278px] before:absolute before:w-[5080px] before:left-0 before:bottom-0"></div>
      </div>
      
      {/* Wave Background - Mobile */}
      <div className="absolute block md:hidden h-[136px] top-[-136px] w-full left-0 z-10">
        <div className="wave-mobile before:accent-auto before:bg-[url(data:image/svg+xml;charset=utf-8,<svg%20width=%222540%22%20height=%22136%22%20fill=%22none%22%20xmlns=%22http://www.w3.org/2000/svg%22><path%20d=%22m0%20139%201270-2.148V38.496C1111.25%2038.496%201111.25%200%20952.497%200%20793.745%200%20793.745%2038.496%20634.993%2038.496S476.227%200%20317.49%200C158.752%200%20158.738%2038.496%200%2038.496V139ZM2540%20139l-1270-2.148V38.496C1428.75%2038.496%201428.75%200%201587.5%200c158.76%200%20158.76%2038.496%20317.51%2038.496S2063.77%200%202222.51%200%202381.26%2038.496%202540%2038.496V139Z%22%20fill=%22%23003241%22/></svg>)] before:bg-[position:0px_100%] before:bg-size-[100%_136px] before:block before:h-[136px] before:absolute before:w-[2540px] before:left-0 before:bottom-0"></div>
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
            <Link 
              to="/about" 
              className="text-white hover:text-gray-300 transition-colors duration-200 font-medium"
            >
              چرا بارمان؟
            </Link>
            <Link 
              to="/contact" 
              className="text-white hover:text-gray-300 transition-colors duration-200 font-medium"
            >
              پشتیبانی و مشاوره
            </Link>
            <Link 
              to="/faq" 
              className="text-white hover:text-gray-300 transition-colors duration-200 font-medium"
            >
              سوالات متداول
            </Link>
            <Link 
              to="/blog" 
              className="text-white hover:text-gray-300 transition-colors duration-200 font-medium"
            >
              وبلاگ
            </Link>
            
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