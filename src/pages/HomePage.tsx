import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import LandingLayout from '@/components/layout/LandingLayout';
import transformIllustration from '@/assets/transform-illustration.svg';
import missionIllustration from '@/assets/mission.svg';
import efficiencyIllustration from '@/assets/efficiency-unlocked.svg';
import frontlineImage from '@/assets/frontline-insight.jpg';
import ownSystemsImage from '@/assets/own-systems.jpg';
import missionImage from '@/assets/mission.jpg';

const HomePage = () => {
  const navigate = useNavigate();
  
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative min-h-[700px] overflow-hidden bg-slate-50 pt-4">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[700px] pt-8">
            {/* Left Content */}
            <div className="space-y-8 lg:pr-8">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-teal-900">
                کمک به وارد کردن
                <br />
                داروخانه شما
                <br />
                به عصر دیجیتال
              </h1>
              
              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-lg">
                توانمندسازی بیماران، حداکثر کارایی و پیدا کردن جریان کاری شما با سامانه داروخانه
              </p>
              
              <Button 
                size="lg" 
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold px-8 py-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Play className="ml-2 h-5 w-5" />
                مشاهده ویدیو
              </Button>
            </div>

            {/* Right Illustration - Using PharmacyX illustration */}
            <div className="relative lg:pl-8">
              <div className="relative w-full h-96 lg:h-[500px] flex items-center justify-center">
                <img 
                  src={transformIllustration} 
                  alt="PharmacyX Illustration" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subtitle Section */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg lg:text-xl text-teal-900 leading-relaxed max-w-4xl mx-auto">
            سامانه داروخانه داروسازان و تیم‌هایشان را آزاد می‌کند تا با فرآیندهای هموارتر، گردش کارهای بدون کاغذ و خدمات خودخدمات بیماران بر مراقبت عالی بیماران تمرکز کنند.
          </p>
        </div>
      </section>

      {/* Transform Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-black text-teal-900 mb-8 leading-tight">
                تبدیل تجربه مشتری
              </h2>
              
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                توانمندسازی بیماران برای ثبت سفارش و پیگیری نسخه‌ها از طریق اپلیکیشن وب دوستانه ما که مخصوص کاربران داروخانه‌های محلی طراحی شده است.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-slate-700 text-lg">تأیید هویت بیماران با استفاده از سامانه ملی</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-slate-700 text-lg">اتصال بیماران، پزشکان و خدمات داروخانه</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-slate-700 text-lg">سفارش‌گیری آسان از بیماران</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-slate-700 text-lg">پرداخت‌های یکپارچه</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-slate-700 text-lg">چت وب یکپارچه</span>
                </li>
              </ul>
            </div>
            
            <div className="flex items-center justify-center lg:pl-8">
              <img 
                src={transformIllustration} 
                alt="تبدیل تجربه مشتری" 
                className="w-full max-w-md h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Paperless Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex items-center justify-center order-2 lg:order-1 lg:pr-8">
              <img 
                src={missionIllustration} 
                alt="آزادی بدون کاغذ" 
                className="w-full max-w-md h-auto object-contain"
              />
            </div>
            
            <div className="space-y-8 order-1 lg:order-2">
              <h2 className="text-4xl lg:text-5xl font-black text-teal-900 mb-8 leading-tight">
                کشف آزادی بدون کاغذ
              </h2>
              
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                سیستم قدرتمند و مبتنی بر ابر ما فرآیندهای پرهرج و مرج را با گردش کار دیجیتال آرام می‌کند و بررسی‌های بالینی ذخیره شده و دقت بارکد را برای ایمنی پیشرفته ارائه می‌دهد.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-slate-700 text-lg">گردش کار بدون کاغذ</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-slate-700 text-lg">بررسی‌های بالینی ذخیره شده</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-slate-700 text-lg">بررسی دقت بارکد</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-slate-700 text-lg">مدیریت موجودی به موقع</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-slate-700 text-lg">مبتنی بر ابر برای راه‌اندازی و نگهداری ساده</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pioneer Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-black text-teal-900 mb-8 leading-tight">
                پیشگام داروخانه محلی شوید
              </h2>
              
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                سامانه داروخانه اولین ارائه‌دهنده راه‌حل‌های داروخانه محلی در ایران است که خدمات عالی خودخدمات مشتری را با پلتفرم قدرتمندی برای کارایی عملیاتی ترکیب می‌کند.
              </p>
              
              <p className="text-lg text-slate-600 leading-relaxed">
                به جامعه رو به رشد داروخانه‌هایی بپیوندید که مصمم هستند از قدرت تکنولوژی استفاده کنند - نه اینکه توسط آن کنار گذاشته شوند.
              </p>
            </div>
            
            <div className="flex items-center justify-center lg:pl-8">
              <img 
                src={efficiencyIllustration} 
                alt="پیشگام داروخانه محلی" 
                className="w-full max-w-md h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Built by pharmacists section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl lg:text-4xl font-black text-teal-900 mb-16">
            ساخته شده توسط داروسازان محلی، برای داروسازان محلی
          </h3>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={frontlineImage} 
                alt="بینش خط مقدم" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <p className="text-slate-700 font-semibold text-lg">بینش خط مقدم</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={ownSystemsImage} 
                alt="سیستم‌های خود ما" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <p className="text-slate-700 font-semibold text-lg">سیستم‌های خود ما</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={missionImage} 
                alt="ماموریت ما" 
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <p className="text-slate-700 font-semibold text-lg">ماموریت ما</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* Book Demo Button and Text */}
            <div className="flex flex-col items-center lg:items-start space-y-6">
              <Button 
                onClick={() => navigate('/login')}
                size="lg" 
                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-12 py-4 text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              >
                ورود
              </Button>
            </div>
            
            {/* Pharmacist Illustration */}
            <div className="relative">
              <div className="w-32 h-48 relative">
                {/* Pharmacist figure */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                  {/* Head */}
                  <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-2 relative">
                    <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mt-2"></div>
                    {/* Hair */}
                    <div className="absolute -top-2 left-2 w-12 h-8 bg-teal-900 rounded-t-full"></div>
                  </div>
                  
                  {/* Body - White coat */}
                  <div className="w-20 h-24 bg-white rounded-lg mx-auto relative border-2 border-slate-200">
                    {/* Coat details */}
                    <div className="w-2 h-2 bg-slate-400 rounded-full absolute top-2 left-2"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full absolute top-4 left-2"></div>
                    <div className="w-4 h-1 bg-slate-300 absolute top-2 right-2"></div>
                    
                    {/* Arms */}
                    <div className="absolute -left-4 top-3 w-8 h-3 bg-white rounded-full border border-slate-200"></div>
                    <div className="absolute -right-4 top-3 w-8 h-3 bg-white rounded-full border border-slate-200"></div>
                    
                    {/* Legs */}
                    <div className="absolute -bottom-6 left-2 w-3 h-8 bg-teal-900 rounded-b-lg"></div>
                    <div className="absolute -bottom-6 right-2 w-3 h-8 bg-teal-900 rounded-b-lg"></div>
                  </div>
                  
                  {/* Scarf flowing */}
                  <div className="absolute top-4 -right-8 w-16 h-2 bg-slate-300 rounded-full transform rotate-12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave shape */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-20">
            <path d="M0 120L50 110C100 100 200 80 300 70C400 60 500 60 600 65C700 70 800 80 900 85C1000 90 1100 90 1150 90L1200 90V120H1150C1100 120 1000 120 900 120C800 120 700 120 600 120C500 120 400 120 300 120C200 120 100 120 50 120H0V120Z" fill="#1e293b"/>
          </svg>
        </div>
      </section>
    </LandingLayout>
  );
};

export default HomePage;