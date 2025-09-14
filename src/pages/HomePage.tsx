import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pill, Users, Zap, Shield, Target, Brain, Heart } from 'lucide-react';
import ownSystemsImage from '@/assets/own-systems.jpg';
import missionImage from '@/assets/mission.jpg';
import frontlineInsightImage from '@/assets/frontline-insight.jpg';

const HomePage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500 rounded-lg">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">فارمان</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">خانه</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">محصولات</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">درباره ما</a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">تماس با ما</a>
          </nav>

          {/* Login Button */}
          <Button 
            onClick={() => navigate('/login')}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            ورود
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-medium">
                  سامانه مدیریت دارویی
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  مدیریت هوشمند
                  <br />
                  <span className="text-teal-600">داروخانه</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  سامانه‌ای جامع برای مدیریت موجودی، فروش و گزارش‌گیری در داروخانه‌ها
                  با تکنولوژی پیشرفته و امنیت بالا
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg"
                >
                  شروع رایگان
                </Button>
                <Button 
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-xl font-semibold text-lg"
                >
                  مشاهده دمو
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">۱۰۰+</div>
                  <div className="text-sm text-gray-600">داروخانه فعال</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">۹۸%</div>
                  <div className="text-sm text-gray-600">رضایت کاربران</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">۲۴/۷</div>
                  <div className="text-sm text-gray-600">پشتیبانی</div>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-96 h-80 bg-white rounded-2xl shadow-2xl p-8">
                  <div className="space-y-6">
                    {/* Dashboard Header */}
                    <div className="flex items-center justify-between pb-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                          <Pill className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-900">داشبورد فارمان</span>
                      </div>
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-teal-50 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-teal-600">۱۲۳</div>
                        <div className="text-sm text-teal-700">فروش امروز</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">۸۹۵</div>
                        <div className="text-sm text-blue-700">موجودی کل</div>
                      </div>
                    </div>
                    
                    {/* Progress Bars */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">فروش هفته</span>
                          <span className="text-gray-900">۷۸%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-teal-500 h-2 rounded-full" style={{width: '78%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">هدف ماهانه</span>
                          <span className="text-gray-900">۶۲%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '62%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              قابلیت‌های پیشرفته فارمان
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              همه چیزی که برای مدیریت حرفه‌ای داروخانه نیاز دارید در یک پلتفرم
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">مدیریت موجودی</h3>
              <p className="text-gray-600 leading-relaxed">
                کنترل دقیق موجودی داروها، اعلان کمبود، مدیریت انقضا و بهینه‌سازی خرید
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">تحلیل هوشمند</h3>
              <p className="text-gray-600 leading-relaxed">
                گزارش‌های تحلیلی پیشرفته، پیش‌بینی فروش و بهینه‌سازی عملکرد داروخانه
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">امنیت بالا</h3>
              <p className="text-gray-600 leading-relaxed">
                رمزنگاری پیشرفته، بک‌آپ خودکار و انطباق با استانداردهای بین‌المللی
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Own Systems Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src={ownSystemsImage} 
                alt="Own your systems" 
                className="w-full h-80 object-cover rounded-2xl shadow-lg"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                مالک سیستم‌های خود باشید
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                فارمان به شما امکان کنترل کامل بر داده‌ها و فرآیندهای داروخانه را می‌دهد. 
                بدون وابستگی به سیستم‌های خارجی، همه چیز در اختیار شماست.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-gray-700">کنترل کامل بر داده‌ها</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-gray-700">بک‌آپ محلی و ابری</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span className="text-gray-700">قابلیت تنظیمات اختصاصی</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                ماموریت ما: سلامت جامعه
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                هدف ما ارتقای کیفیت خدمات دارویی و تسهیل دسترسی مردم به دارو است. 
                فارمان ابزاری است برای تحقق این هدف بزرگ.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-teal-50 rounded-xl">
                  <div className="text-2xl font-bold text-teal-600 mb-2">
                    <Heart className="h-8 w-8 mx-auto mb-2" />
                    ۱۰۰۰+
                  </div>
                  <div className="text-sm text-teal-700">بیمار خدمت‌دیده</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    ۵۰+
                  </div>
                  <div className="text-sm text-blue-700">داروساز متخصص</div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src={missionImage} 
                alt="Our mission" 
                className="w-full h-80 object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Frontline Insight Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src={frontlineInsightImage} 
                alt="Frontline insight" 
                className="w-full h-80 object-cover rounded-2xl shadow-lg"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                بینش خط مقدم
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                از تجربه و بازخورد داروسازان در خط مقدم استفاده می‌کنیم تا بهترین 
                راه‌حل‌ها را ارائه دهیم. فارمان با همکاری متخصصان طراحی شده است.
              </p>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <blockquote className="text-gray-700 italic">
                  "فارمان کار ما را خیلی ساده‌تر کرده. حالا بیشتر وقت داریم برای مشاوره با بیماران."
                </blockquote>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-gray-900">دکتر احمدی</div>
                    <div className="text-sm text-gray-600">داروساز، داروخانه مرکزی</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stats Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-16">
            آمار و ارقام فارمان
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-2xl">
              <div className="text-4xl font-bold text-teal-600 mb-2">۹۹.۹%</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">آپتایم</div>
              <div className="text-sm text-gray-600">دسترسی مداوم ۲۴/۷</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
              <div className="text-4xl font-bold text-blue-600 mb-2">۲۰۰+</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">داروخانه</div>
              <div className="text-sm text-gray-600">در سراسر کشور</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
              <div className="text-4xl font-bold text-green-600 mb-2">۱M+</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">نسخه</div>
              <div className="text-sm text-gray-600">پردازش شده</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
              <div className="text-4xl font-bold text-purple-600 mb-2">۵s</div>
              <div className="text-lg font-semibold text-gray-900 mb-2">سرعت</div>
              <div className="text-sm text-gray-600">پاسخ‌دهی سیستم</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-500 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            آماده شروع هستید؟
          </h2>
          <p className="text-xl mb-8 opacity-90">
            همین امروز فارمان را رایگان تجربه کنید و تفاوت را حس کنید
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/login')}
              className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg"
            >
              شروع رایگان
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-teal-600 px-8 py-4 rounded-xl font-semibold text-lg"
            >
              درخواست دمو
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500 rounded-lg">
                  <Pill className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">فارمان</span>
              </div>
              <p className="text-gray-400">
                سامانه‌ای پیشرفته برای مدیریت هوشمند داروخانه‌ها
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">محصولات</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">مدیریت موجودی</a></li>
                <li><a href="#" className="hover:text-white transition-colors">فروش و فاکتور</a></li>
                <li><a href="#" className="hover:text-white transition-colors">گزارش‌گیری</a></li>
                <li><a href="#" className="hover:text-white transition-colors">پشتیبانی</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">شرکت</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">درباره ما</a></li>
                <li><a href="#" className="hover:text-white transition-colors">تماس با ما</a></li>
                <li><a href="#" className="hover:text-white transition-colors">حریم خصوصی</a></li>
                <li><a href="#" className="hover:text-white transition-colors">قوانین</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">پشتیبانی</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">مرکز راهنما</a></li>
                <li><a href="#" className="hover:text-white transition-colors">آموزش</a></li>
                <li><a href="#" className="hover:text-white transition-colors">وضعیت سرویس</a></li>
                <li><a href="#" className="hover:text-white transition-colors">تیکت پشتیبانی</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© ۱۴۰۳ فارمان. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;