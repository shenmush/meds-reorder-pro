import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pill, ArrowLeft, Shield, Clock, Users, Star } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-hidden" dir="rtl">
      {/* Header */}
      <header className="relative z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">فارمان</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="hover:text-emerald-400 transition-colors">ویژگی‌ها</a>
            <a href="#about" className="hover:text-emerald-400 transition-colors">درباره ما</a>
            <a href="#contact" className="hover:text-emerald-400 transition-colors">تماس با ما</a>
          </nav>

          {/* CTA Button */}
          <Button 
            onClick={() => navigate('/login')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            ورود
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <section className="px-6 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full text-sm text-emerald-400 border border-slate-700">
                  <Star className="h-4 w-4" />
                  سیستم مدیریت داروخانه هوشمند
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  مدیریت هوشمند
                  <br />
                  <span className="text-emerald-400">داروخانه شما</span>
                </h1>
                
                <p className="text-xl text-slate-300 leading-relaxed">
                  پلتفرم جامع مدیریت داروخانه که سفارش‌گیری، موجودی و فروش را ساده‌تر می‌کند
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => navigate('/login')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    شروع کنید
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 rounded-lg font-semibold text-lg"
                  >
                    مشاهده دمو
                  </Button>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-700">
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">+500</div>
                    <div className="text-sm text-slate-400">داروخانه فعال</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">+10K</div>
                    <div className="text-sm text-slate-400">سفارش ثبت شده</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-400">24/7</div>
                    <div className="text-sm text-slate-400">پشتیبانی</div>
                  </div>
                </div>
              </div>

              {/* Right Visual */}
              <div className="relative">
                {/* Main Dashboard Mockup */}
                <div className="relative bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-slate-400 text-sm">پنل مدیریت داروخانه</div>
                  </div>
                  
                  {/* Dashboard Content */}
                  <div className="space-y-4">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-700 p-3 rounded-lg">
                        <div className="text-emerald-400 text-lg font-bold">142</div>
                        <div className="text-slate-400 text-xs">سفارش امروز</div>
                      </div>
                      <div className="bg-slate-700 p-3 rounded-lg">
                        <div className="text-blue-400 text-lg font-bold">28</div>
                        <div className="text-slate-400 text-xs">در انتظار</div>
                      </div>
                      <div className="bg-slate-700 p-3 rounded-lg">
                        <div className="text-purple-400 text-lg font-bold">85%</div>
                        <div className="text-slate-400 text-xs">موجودی</div>
                      </div>
                    </div>
                    
                    {/* Orders List */}
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="text-sm font-semibold mb-3 text-slate-200">آخرین سفارشات</div>
                      <div className="space-y-2">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="flex items-center justify-between py-2 border-b border-slate-600 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-600 rounded-full"></div>
                              <div>
                                <div className="text-xs text-slate-200">سفارش #{1000 + item}</div>
                                <div className="text-xs text-slate-400">داروخانه مرکزی</div>
                              </div>
                            </div>
                            <div className="text-xs text-emerald-400">تکمیل شده</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-emerald-500 p-3 rounded-lg shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-500 p-3 rounded-lg shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-16 bg-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                ویژگی‌های <span className="text-emerald-400">فارمان</span>
              </h2>
              <p className="text-slate-300 text-lg">
                همه چیزی که برای مدیریت بهتر داروخانه نیاز دارید
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-emerald-500 transition-colors">
                <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
                  <Pill className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">مدیریت دارو</h3>
                <p className="text-slate-400">
                  مدیریت کامل موجودی داروها با سیستم هشدار اتمام موجودی
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-emerald-500 transition-colors">
                <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
                  <Users className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">مدیریت مشتریان</h3>
                <p className="text-slate-400">
                  ثبت و پیگیری سفارشات مشتریان با سیستم CRM یکپارچه
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-emerald-500 transition-colors">
                <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
                  <Shield className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">امنیت بالا</h3>
                <p className="text-slate-400">
                  حفاظت از اطلاعات با بالاترین استانداردهای امنیتی
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              آماده شروع هستید؟
            </h2>
            <p className="text-slate-300 text-lg mb-8">
              همین امروز داروخانه خود را به آینده متصل کنید
            </p>
            <Button 
              onClick={() => navigate('/login')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              شروع رایگان
            </Button>
          </div>
        </section>
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default HomePage;