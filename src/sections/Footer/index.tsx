export const Footer = () => {
  return (
    <footer className="relative text-base bg-cyan-950 box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] z-[3] py-14 md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:py-[88px] mt-32">
      {/* Wave Background - Desktop */}
      <div className="absolute text-base box-border caret-transparent hidden h-[278px] tracking-[-0.32px] leading-[17.7778px] top-[-116px] w-full z-10 left-0 md:text-lg md:block md:tracking-[-0.36px] md:leading-[22px]">
        <div className="wave-desktop text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] before:accent-auto before:bg-[url(data:image/svg+xml;charset=utf-8,<svg%20width=%225080%22%20height=%22278%22%20fill=%22none%22%20xmlns=%22http://www.w3.org/2000/svg%22><path%20d=%22M2540%20278h2540V76.993C4762.5%2076.993%204762.5%200%204444.99%200c-317.5%200-317.5%2076.993-635%2076.993C3492.48%2076.993%203492.45%200%203174.98%200%202857.5%200%202857.48%2076.993%202540%2076.993V278ZM0%20278h2540V76.993C2222.5%2076.993%202222.5%200%201904.99%200c-317.5%200-317.5%2076.993-635%2076.993C952.483%2076.993%20952.455%200%20634.979%200%20317.503%200%20317.476%2076.993%200%2076.993V278Z%22%20fill=%22%23003241%22/></svg>)] before:bg-[position:0px_100%] before:bg-size-[100%_278px] before:box-border before:caret-transparent before:text-cyan-950 before:block before:text-base before:not-italic before:normal-nums before:font-normal before:h-[278px] before:tracking-[-0.32px] before:leading-[17.7778px] before:list-outside before:list-disc before:absolute before:text-start before:indent-[0px] before:normal-case before:origin-[50%_100%] before:visible before:w-[5080px] before:border-separate before:left-0 before:bottom-0 before:font-gt_walsheim before:md:text-lg before:md:tracking-[-0.36px] before:md:leading-[22px]"></div>
      </div>
      
      {/* Wave Background - Mobile */}
      <div className="absolute text-base box-border caret-transparent block h-[136px] tracking-[-0.32px] leading-[17.7778px] top-[-136px] w-full z-10 left-0 md:text-lg md:hidden md:tracking-[-0.36px] md:leading-[22px]">
        <div className="wave-mobile text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] before:accent-auto before:bg-[url(data:image/svg+xml;charset=utf-8,<svg%20width=%222540%22%20height=%22136%22%20fill=%22none%22%20xmlns=%22http://www.w3.org/2000/svg%22><path%20d=%22m0%20139%201270-2.148V38.496C1111.25%2038.496%201111.25%200%20952.497%200%20793.745%200%20793.745%2038.496%20634.993%2038.496S476.227%200%20317.49%200C158.752%200%20158.738%2038.496%200%2038.496V139ZM2540%20139l-1270-2.148V38.496C1428.75%2038.496%201428.75%200%201587.5%200c158.76%200%20158.76%2038.496%20317.51%2038.496S2063.77%200%202222.51%200%202381.26%2038.496%202540%2038.496V139Z%22%20fill=%22%23003241%22/></svg>)] before:bg-[position:0px_100%] before:bg-size-[100%_136px] before:box-border before:caret-transparent before:text-cyan-950 before:block before:text-base before:not-italic before:normal-nums before:font-normal before:h-[136px] before:tracking-[-0.32px] before:leading-[17.7778px] before:list-outside before:list-disc before:absolute before:text-start before:indent-[0px] before:normal-case before:origin-[50%_100%] before:visible before:w-[2540px] before:border-separate before:left-0 before:bottom-0 before:font-gt_walsheim before:md:text-lg before:md:tracking-[-0.36px] before:md:leading-[22px]"></div>
      </div>

      {/* Footer Content */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3 space-x-reverse mb-8 lg:mb-0">
            <span className="text-2xl font-bold text-white">
              بارمان
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-4 items-center mb-8 lg:mb-0">
            <a href="#" className="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium">
              سیستم داروخانه
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium">
              اپلیکیشن بیماران
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium">
              چرا بارمان؟
            </a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium">
              سازمانی
            </a>
            
            {/* LinkedIn Icon */}
            <a href="#" className="text-white hover:text-gray-300 transition-colors duration-200" aria-label="LinkedIn">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
        
        {/* Privacy Policy */}
        <div className="text-center lg:text-right mt-8 pt-4 border-t border-white/10">
          <a href="/privacy" className="text-sm text-gray-400 hover:text-gray-300 transition-colors duration-200">
            سیاست حریم خصوصی
          </a>
        </div>
      </div>
    </footer>
  );
};