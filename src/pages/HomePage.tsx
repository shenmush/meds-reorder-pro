import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pill, Menu } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-teal-400 via-teal-300 to-teal-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Pill className="h-6 w-6 text-teal-600" />
            </div>
            <span className="text-xl font-bold text-gray-800">فارمان</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">خانه</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">محصولات</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">درباره ما</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors">تماس با ما</a>
          </nav>

          {/* Login Button */}
          <Button 
            onClick={() => navigate('/login')}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
          >
            ورود
          </Button>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Menu className="h-6 w-6 text-gray-700" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
                SMART SUPPLY
                <br />
                EASY ACCESS
              </h1>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                یک سامانه جامع برای مدیریت تأمین و توزیع دارو
              </p>
              
              <Button 
                onClick={() => navigate('/login')}
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                شروع کنید
              </Button>
            </div>

            {/* Right Illustration */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Pharmacy Illustration */}
                <div className="w-80 h-80 bg-white rounded-full shadow-lg p-8 flex items-center justify-center">
                  <div className="text-center">
                    {/* Pharmacist character */}
                    <div className="w-32 h-32 bg-teal-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <div className="w-24 h-24 bg-teal-200 rounded-full relative">
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-teal-600 rounded-full"></div>
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-white rounded-full"></div>
                      </div>
                    </div>
                    {/* Pills and medical elements */}
                    <div className="flex justify-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-teal-400 rounded-full opacity-80"></div>
                <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-teal-300 rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Cards */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-teal-400 to-teal-500 text-white p-6 rounded-xl shadow-lg">
              <h3 className="font-bold text-lg mb-2">مدیریت موجودی</h3>
              <p className="text-sm opacity-90">کنترل دقیق موجودی داروها</p>
            </div>
            
            {/* Card 2 */}
            <div className="bg-gradient-to-br from-teal-300 to-teal-400 text-white p-6 rounded-xl shadow-lg">
              <h3 className="font-bold text-lg mb-2">سفارش آنلاین</h3>
              <p className="text-sm opacity-90">ثبت و پیگیری سفارشات</p>
            </div>
            
            {/* Card 3 */}
            <div className="bg-gradient-to-br from-teal-200 to-teal-300 text-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="font-bold text-lg mb-2">گزارش‌گیری هوشمند</h3>
              <p className="text-sm opacity-80">تحلیل و بررسی عملکرد</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section 1 */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                یک سامانه طراحی شده برای موفقیت
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                فارمان با هدف ساده‌سازی فرآیندهای پیچیده تأمین و توزیع دارو طراحی شده است. 
                این سامانه به داروخانه‌ها کمک می‌کند تا با کیفیت بهتر و سرعت بیشتر خدمات خود را ارائه دهند.
              </p>

              <p className="text-gray-600">
                از مدیریت موجودی تا ثبت سفارش و پیگیری تحویل، همه چیز در یک پلتفرم یکپارچه.
              </p>
            </div>

            {/* Right Illustration */}
            <div className="flex justify-center">
              <div className="w-80 h-60 bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-teal-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded opacity-80"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="w-8 h-2 bg-teal-300 rounded"></div>
                    <div className="w-8 h-2 bg-teal-400 rounded"></div>
                    <div className="w-8 h-2 bg-teal-500 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section 2 */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Illustration */}
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="w-80 h-60 bg-white rounded-xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Pill className="h-8 w-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-20 h-2 bg-gray-200 rounded mx-auto"></div>
                    <div className="w-16 h-2 bg-gray-300 rounded mx-auto"></div>
                    <div className="w-24 h-2 bg-gray-200 rounded mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                مدیریت پیشرفته تامین کنندگان
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                سیستم یکپارچه ارتباط با تامین‌کنندگان که امکان مقایسه قیمت‌ها، 
                بررسی کیفیت محصولات و مدیریت قراردادها را فراهم می‌کند.
              </p>

              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span>مقایسه خودکار قیمت‌ها</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span>ارزیابی عملکرد تامین‌کنندگان</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span>مدیریت قراردادها و شرایط</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                تکنولوژی امن و پیشرفته
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                استفاده از جدیدترین تکنولوژی‌های امنیتی و رمزنگاری داده‌ها برای حفاظت از اطلاعات حساس.
                تمامی اطلاعات شما با بالاترین استانداردهای بین‌المللی محافظت می‌شوند.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">256-bit</div>
                  <div className="text-sm text-gray-600">رمزنگاری</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">24/7</div>
                  <div className="text-sm text-gray-600">نظارت امنیتی</div>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="flex justify-center">
              <div className="w-80 h-60 bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-teal-500 rounded-lg mx-auto mb-4 flex items-center justify-center relative">
                    <div className="absolute inset-2 border-2 border-white rounded opacity-60"></div>
                    <div className="w-6 h-6 bg-white rounded"></div>
                  </div>
                  <div className="flex justify-center gap-1">
                    <div className="w-2 h-8 bg-teal-300 rounded-full"></div>
                    <div className="w-2 h-6 bg-teal-400 rounded-full"></div>
                    <div className="w-2 h-10 bg-teal-500 rounded-full"></div>
                    <div className="w-2 h-4 bg-teal-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-teal-400 to-teal-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            آماده شروع هستید؟
          </h2>
          <p className="text-xl mb-8 opacity-90">
            همین امروز فارمان را تجربه کنید
          </p>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            ورود اینجا کلیک کنید
          </Button>
        </div>
      </section>

      {/* Footer Illustration */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block">
            <div className="w-32 h-32 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <div className="text-white">
                <div className="w-8 h-12 bg-white rounded-sm mx-auto mb-2 opacity-90"></div>
                <div className="flex gap-1 justify-center">
                  <div className="w-2 h-3 bg-white rounded-full opacity-70"></div>
                  <div className="w-2 h-3 bg-white rounded-full opacity-80"></div>
                  <div className="w-2 h-3 bg-white rounded-full opacity-70"></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={() => navigate('/login')}
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200"
              >
                ورود
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Image */}
            <div className="flex justify-center">
              <div className="w-80 h-60 bg-gray-100 rounded-xl overflow-hidden">
                <img 
                  src="/api/placeholder/320/240" 
                  alt="Enterprise pharmacist" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">
                ENTERPRISE
                <br />
                FOR GROUPS
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed">
                راه‌حل‌های سازمانی ویژه زنجیره‌های داروخانه‌ای و شرکت‌های بزرگ تامین دارو
              </p>

              <Button 
                onClick={() => navigate('/login')}
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                اطلاعات بیشتر
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 bg-teal-400">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              "OUR STAFF LOVE THE SYSTEM, AND I
              <br />
              HAVE THE HAPPIEST TEAM I'VE EVER
              <br />
              HAD WORKING FOR ME.
              <br />
              THERE ARE TASK-FOCUSED
              <br />
              PERFORMANCE INDICATORS THAT THEY
              <br />
              CAN CLEARLY SEE WHAT THEIR
              <br />
              ABLE TO DELIVER, AND DEDICATE
              <br />
              SERVICES."
            </h2>
            
            <div className="flex justify-center gap-2 mb-6">
              <div className="w-1 h-1 bg-teal-400 rounded-full"></div>
              <div className="w-1 h-1 bg-teal-400 rounded-full"></div>
              <div className="w-1 h-1 bg-teal-400 rounded-full"></div>
            </div>
            
            <Button 
              onClick={() => navigate('/login')}
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200"
            >
              ورود اینجا کلیک کنید
            </Button>
          </div>
        </div>
      </section>

      {/* Final Dark Section */}
      <section className="py-12 px-6 bg-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-white">
            <p className="text-sm opacity-70">
              © 2024 فارمان. تمامی حقوق محفوظ است.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;