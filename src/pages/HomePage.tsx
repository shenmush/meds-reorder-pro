import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pill, Menu, Check, Star, Users, ShoppingCart, Award, Shield } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 pt-5 pb-2.5">
        <div className="max-w-6xl mx-auto px-5">
          <div className="bg-white shadow-lg border border-gray-100 rounded-full px-8 py-4 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Pill className="h-6 w-6 text-cyan-600" />
              </div>
              <span className="text-xl font-bold text-gray-800">فارمان</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8 text-sm">
              <a href="#features" className="text-gray-700 hover:text-cyan-600 transition-colors">ویژگی‌ها</a>
              <a href="#about" className="text-gray-700 hover:text-cyan-600 transition-colors">درباره ما</a>
              <a href="#testimonials" className="text-gray-700 hover:text-cyan-600 transition-colors">نظرات</a>
              <a href="#contact" className="text-gray-700 hover:text-cyan-600 transition-colors">تماس</a>
            </div>

            {/* Login Button */}
            <Button 
              onClick={() => navigate('/login')}
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-full font-medium"
            >
              ورود
            </Button>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Menu className="h-6 w-6 text-gray-700" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-gray-50 pt-32 pb-20 overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-gray-100"></div>
          <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-cyan-300 rounded-full opacity-30 animate-pulse"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
                  SMART SUPPLY
                  <br />
                  <span className="text-cyan-600">EASY ACCESS</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  سامانه جامع مدیریت تأمین و توزیع دارو
                  <br />
                  برای داروخانه‌ها و شرکت‌های دارویی
                </p>
              </div>

              {/* Key Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-cyan-500" />
                  <span className="text-gray-700">مدیریت موجودی هوشمند</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-cyan-500" />
                  <span className="text-gray-700">سفارش‌گیری آنلاین</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-cyan-500" />
                  <span className="text-gray-700">گزارش‌گیری پیشرفته</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg"
                >
                  شروع کنید
                </Button>
                <Button 
                  variant="outline"
                  className="border-cyan-200 text-cyan-600 hover:bg-cyan-50 px-8 py-4 rounded-lg font-semibold text-lg"
                >
                  مشاهده دمو
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center">
                  {/* Pharmacy illustration */}
                  <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mb-4">
                    <Pill className="h-16 w-16 text-white" />
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-600">500+</div>
                      <div className="text-xs text-gray-600">داروخانه</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-600">24/7</div>
                      <div className="text-xs text-gray-600">پشتیبانی</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-cyan-400 rounded-full opacity-70 animate-bounce"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-cyan-300 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              ویژگی‌های فارمان
            </h2>
            <p className="text-xl text-gray-600">
              همه چیز که برای مدیریت داروخانه نیاز دارید
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">مدیریت سفارشات</h3>
              <p className="text-gray-600">ثبت، پیگیری و مدیریت سفارشات به صورت آنلاین و هوشمند</p>
            </div>

            <div className="group p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">مدیریت تیم</h3>
              <p className="text-gray-600">مدیریت کارکنان، دسترسی‌ها و نقش‌های مختلف در سیستم</p>
            </div>

            <div className="group p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">گزارش‌گیری</h3>
              <p className="text-gray-600">گزارشات تفصیلی از فروش، موجودی و عملکرد کلی</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">
                طراحی شده برای موفقیت شما
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                فارمان با هدف ساده‌سازی فرآیندهای پیچیده تأمین و توزیع دارو طراحی شده است. 
                این سامانه به داروخانه‌ها کمک می‌کند تا با کیفیت بهتر و سرعت بیشتر خدمات خود را ارائه دهند.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-6 w-6 text-cyan-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800">امنیت بالا</h4>
                    <p className="text-gray-600">تمامی اطلاعات با بالاترین استانداردهای امنیتی محافظت می‌شود</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-cyan-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-800">پشتیبانی 24/7</h4>
                    <p className="text-gray-600">تیم پشتیبانی ما همیشه آماده کمک به شما است</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative">
                <div className="w-96 h-64 bg-white rounded-2xl shadow-xl p-6">
                  <div className="grid grid-cols-2 gap-4 h-full">
                    <div className="space-y-3">
                      <div className="h-4 bg-cyan-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-cyan-300 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-cyan-400 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-cyan-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              نظرات مشتریان
            </h2>
            <p className="text-xl text-gray-600">
              تجربه کسانی که از فارمان استفاده می‌کنند
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "فارمان باعث شده مدیریت داروخانه‌مان بسیار ساده‌تر شود. سیستم بسیار کاربرپسند و مفیده."
              </p>
              <div className="font-semibold text-gray-800">احمد رضایی</div>
              <div className="text-sm text-gray-600">مدیر داروخانه پاسداران</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "پشتیبانی عالی و سیستم بسیار قابل اعتماد. به همه داروخانه‌داران پیشنهاد می‌کنم."
              </p>
              <div className="font-semibold text-gray-800">فاطمه احمدی</div>
              <div className="text-sm text-gray-600">داروساز داروخانه مرکزی</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "از زمان استفاده از فارمان، کیفیت خدمات‌مان به مشتریان بهبود قابل توجهی داشته."
              </p>
              <div className="font-semibold text-gray-800">علی محمدی</div>
              <div className="text-sm text-gray-600">صاحب داروخانه شهر</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-cyan-500 to-cyan-600">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            آماده شروع هستید؟
          </h2>
          <p className="text-xl mb-8 opacity-90">
            همین امروز فارمان را تجربه کنید و تفاوت را احساس کنید
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/login')}
              className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg"
            >
              ورود به سیستم
            </Button>
            <Button 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-cyan-600 px-8 py-4 rounded-lg font-semibold text-lg"
            >
              تماس با ما
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500 rounded-lg">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">فارمان</span>
              </div>
              <p className="text-gray-400">
                سامانه جامع مدیریت تأمین و توزیع دارو
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">خدمات</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">مدیریت موجودی</a></li>
                <li><a href="#" className="hover:text-white transition-colors">سفارش‌گیری</a></li>
                <li><a href="#" className="hover:text-white transition-colors">گزارش‌گیری</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">شرکت</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">درباره ما</a></li>
                <li><a href="#" className="hover:text-white transition-colors">تماس با ما</a></li>
                <li><a href="#" className="hover:text-white transition-colors">پشتیبانی</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">تماس</h4>
              <div className="space-y-2 text-gray-400">
                <p>تهران، ایران</p>
                <p>۰۲۱-۱۲۳۴۵۶۷۸</p>
                <p>info@pharman.ir</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© ۲۰۲۴ فارمان. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;