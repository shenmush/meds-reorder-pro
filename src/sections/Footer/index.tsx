export const Footer = () => {
  return (
    <footer className="relative bg-cyan-950 text-white overflow-hidden">
      {/* Smooth Wave */}
      <div className="absolute top-0 left-0 w-full h-24 overflow-hidden">
        <svg 
          className="absolute w-[120%] h-full animate-[wave_8s_ease-in-out_infinite]" 
          style={{ left: '-10%' }}
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,0 L0,0 Z" 
            fill="white"
          />
        </svg>
      </div>
      
      {/* Footer Content */}
      <div className="relative z-10 pt-20 pb-12">
        <div className="container mx-auto px-6">
          {/* Main Footer */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            {/* Logo */}
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl font-bold">بارمان</h2>
            </div>
            
            {/* Navigation Links */}
            <div className="flex flex-wrap gap-8 items-center">
              <a href="#" className="hover:text-gray-300 transition-colors">سیستم داروخانه</a>
              <a href="#" className="hover:text-gray-300 transition-colors">اپلیکیشن بیماران</a>
              <a href="#" className="hover:text-gray-300 transition-colors">چرای بارمان؟</a>
              <a href="#" className="hover:text-gray-300 transition-colors">سازمانی</a>
              <a href="#" className="hover:text-gray-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Privacy Policy */}
          <div className="text-left">
            <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors text-sm">
              سیاست حریم خصوصی
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};