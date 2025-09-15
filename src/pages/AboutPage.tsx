import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Package, 
  BarChart3, 
  Clock, 
  FileText, 
  DollarSign, 
  Zap,
  ArrowLeft,
  CheckCircle,
  ArrowRight,
  ShoppingCart,
  Truck,
  ClipboardCheck
} from 'lucide-react';
import { Navbar } from "@/sections/Navbar";
import { Footer } from "@/sections/Footer";
import { MobileModal } from "@/components/MobileModal";
import heroImage from "@/assets/pharmacy-barman-hero.jpg";

const AboutPage = () => {
  const benefits = [
    {
      icon: Package,
      title: 'ثبت سفارش ساده',
      description: 'فقط با چند کلیک، سفارش خود را وارد کنید.',
      emoji: '📦'
    },
    {
      icon: DollarSign,
      title: 'دریافت تخفیف بیشتر و شرایط پرداخت بهتر',
      description: 'بارمان با تجمیع سفارشات تخفیف و شرایط پرداخت بهتری از سفارش تکی براتون میگیره',
      emoji: '💰'
    },
    {
      icon: BarChart3,
      title: 'گزارش‌گیری لحظه‌ای',
      description: 'ببینید چه سفارشی دادید، چه چیزی دریافت کردید و سفارش شما در چه مرحله ای قرار داره.',
      emoji: '📊'
    },
    {
      icon: Clock,
      title: 'مدیریت تاریخ انقضا',
      description: 'همه‌ی سفارش‌ها با کنترل تاریخ انقضا مدیریت می‌شوند.',
      emoji: '⏰'
    },
    {
      icon: FileText,
      title: 'تاریخچه‌ی پرداخت و سفارش',
      description: 'همیشه در دسترس، همیشه شفاف.',
      emoji: '📋'
    },
    {
      icon: Zap,
      title: 'صرفه‌جویی در زمان',
      description: 'دیگه لازم نیست از چندین پخش سفارش جدا بدید.',
      emoji: '⚡'
    }
  ];

  const processSteps = [
    {
      step: 1,
      icon: ShoppingCart,
      title: 'ثبت سفارش',
      description: 'داروخانه‌ها سفارشات خود را در اپلیکیشن بارمان ثبت می‌کنند'
    },
    {
      step: 2,
      icon: Package,
      title: 'تجمیع سفارشات',
      description: 'بارمان سفارشات مختلف را جمع‌آوری و تجمیع می‌کند'
    },
    {
      step: 3,
      icon: ClipboardCheck,
      title: 'مذاکره و خرید',
      description: 'تیم بارمان با تولیدکنندگان مذاکره و بهترین قیمت را می‌گیرد'
    },
    {
      step: 4,
      icon: Truck,
      title: 'تحویل به داروخانه',
      description: 'داروها با کیفیت بالا و قیمت مناسب به داروخانه‌ها تحویل داده می‌شود'
    }
  ];

  return (
    <div className="text-cyan-950 text-base not-italic normal-nums font-normal accent-auto bg-white box-border caret-transparent block tracking-[-0.32px] leading-6 list-outside list-disc overflow-x-hidden overflow-y-auto text-start indent-[0px] normal-case visible border-separate font-gt_walsheim md:text-lg md:tracking-[-0.36px] md:leading-[27px]">
      <Navbar />
      
      {/* Hero Section */}
      <header className="relative text-base bg-neutral-100 box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] z-10 py-[150px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:pt-[260px] md:pb-[273px] overflow-hidden">
        {/* Animated wave background */}
        <div className="absolute inset-0 z-[1]">
          <svg className="w-full h-full" viewBox="0 0 1200 600" fill="none">
            <path
              d="M0,300 Q300,100 600,300 T1200,300 V600 H0 Z"
              fill="rgba(165, 255, 235, 0.1)"
              className="animate-pulse"
            />
          </svg>
        </div>
        
        <img
          src="https://c.animaapp.com/mfl9f93tdLmSwy/assets/icon-2.svg"
          alt="Icon"
          className="absolute text-base box-border caret-transparent hidden h-[215px] tracking-[-0.32px] leading-[17.7778px] w-full z-[1] left-0 top-0 md:text-lg md:block md:tracking-[-0.36px] md:leading-[22px] animate-pulse"
        />
        <img
          src="https://c.animaapp.com/mfl9f93tdLmSwy/assets/icon-3.svg"
          alt="Icon"
          className="absolute text-base box-border caret-transparent block h-[127px] tracking-[-0.32px] leading-[17.7778px] w-full z-[1] left-0 top-0 md:text-lg md:hidden md:tracking-[-0.36px] md:leading-[22px] animate-pulse"
        />
        
        <div className="relative text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] max-w-none w-full z-10 mx-auto pb-2 px-[24.8889px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] md:max-w-[1140px] md:pb-6 md:px-[50px]">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-8 text-center lg:text-right">
              <h1 className="text-4xl lg:text-6xl font-bold text-cyan-950">
                چرا <span className="text-gradient">بارمان</span>؟
              </h1>
              <p className="text-xl lg:text-2xl text-cyan-950/70 leading-relaxed">
                بارمان همراه داروخانه‌ها در مسیر خرید هوشمند است.
              </p>
              <p className="text-lg lg:text-xl text-cyan-950/60 leading-relaxed">
                با سفارش‌های دسته‌جمعی، تخفیف بیشتر می‌گیرید، آفر بهتری دریافت می‌کنید و خریدتان ساده‌تر و سریع‌تر انجام می‌شود.
              </p>
            </div>
            
            {/* Hero Image */}
            <div className="order-first lg:order-last">
              <img 
                src={heroImage} 
                alt="داروخانه با اپلیکیشن بارمان" 
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Top Wave */}
      <main className="relative text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] md:text-lg md:tracking-[-0.36px] md:leading-[22px]">
        {/* Top Wave - Desktop */}
        <div className="absolute text-base box-border caret-transparent hidden h-[278px] tracking-[-0.32px] leading-[17.7778px] overflow-x-hidden overflow-y-auto top-[-190px] w-full z-10 left-0 md:text-lg md:block md:tracking-[-0.36px] md:leading-[22px]">
          <div className="wave-desktop text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] before:accent-auto before:bg-[url(data:image/svg+xml;charset=utf-8,<svg%20width=%225080%22%20height=%22278%22%20fill=%22none%22%20xmlns=%22http://www.w3.org/2000/svg%22><path%20d=%22M2540%20278h2540V76.993C4762.5%2076.993%204762.5%200%204444.99%200c-317.5%200-317.5%2076.993-635%2076.993C3492.48%2076.993%203492.45%200%203174.98%200%202857.5%200%202857.48%2076.993%202540%2076.993V278ZM0%20278h2540V76.993C2222.5%2076.993%202222.5%200%201904.99%200c-317.5%200-317.5%2076.993-635%2076.993C952.483%2076.993%20952.455%200%20634.979%200%20317.503%200%20317.476%2076.993%200%2076.993V278Z%22%20fill=%22%23fff%22/></svg>)] before:bg-[position:0px_100%] before:bg-size-[100%_278px] before:box-border before:caret-transparent before:text-cyan-950 before:block before:text-base before:not-italic before:normal-nums before:font-normal before:h-[278px] before:tracking-[-0.32px] before:leading-[17.7778px] before:list-outside before:list-disc before:absolute before:text-start before:indent-[0px] before:normal-case before:origin-[50%_100%] before:visible before:w-[5080px] before:border-separate before:left-0 before:bottom-0 before:font-gt_walsheim before:md:text-lg before:md:tracking-[-0.36px] before:md:leading-[22px]"></div>
        </div>
        {/* Top Wave - Mobile */}
        <div className="absolute text-base box-border caret-transparent block h-[136px] tracking-[-0.32px] leading-[17.7778px] overflow-x-hidden overflow-y-auto top-[-136px] w-full z-10 left-0 md:text-lg md:hidden md:tracking-[-0.36px] md:leading-[22px]">
          <div className="wave-mobile text-base box-border caret-transparent tracking-[-0.32px] leading-[17.7778px] md:text-lg md:tracking-[-0.36px] md:leading-[22px] before:accent-auto before:bg-[url(data:image/svg+xml;charset=utf-8,<svg%20width=%222540%22%20height=%22136%22%20fill=%22none%22%20xmlns=%22http://www.w3.org/2000/svg%22><path%20d=%22m0%20139%201270-2.148V38.496C1111.25%2038.496%201111.25%200%20952.497%200%20793.745%200%20793.745%2038.496%20634.993%2038.496S476.227%200%20317.49%200C158.752%200%20158.738%2038.496%200%2038.496V139ZM2540%20139l-1270-2.148V38.496C1428.75%2038.496%201428.75%200%201587.5%200c158.76%200%20158.76%2038.496%20317.51%2038.496S2063.77%200%202222.51%200%202381.26%2038.496%202540%2038.496V139Z%22%20fill=%22%23fff%22/></svg>)] before:bg-[position:0px_100%] before:bg-size-[100%_136px] before:box-border before:caret-transparent before:text-cyan-950 before:block before:text-base before:not-italic before:normal-nums before:font-normal before:h-[136px] before:tracking-[-0.32px] before:leading-[17.7778px] before:list-outside before:list-disc before:absolute before:text-start before:indent-[0px] before:normal-case before:origin-[50%_100%] before:visible before:w-[2540px] before:border-separate before:left-0 before:bottom-0 before:font-gt_walsheim before:md:text-lg before:md:tracking-[-0.36px] before:md:leading-[22px]"></div>
        </div>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-cyan-950">
                بارمان چطوری به <span className="text-gradient">داروخانه‌ها</span> کمک میکنه؟
              </h2>
              <p className="text-xl text-cyan-950/70 max-w-3xl mx-auto">
                با استفاده از بارمان، داروخانه‌ها از مزایای زیادی بهره‌مند می‌شوند
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="card-hover bg-white border-cyan-950/10 group">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-3xl">{benefit.emoji}</div>
                      <div className="w-12 h-12 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                        <benefit.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-3 text-cyan-950">{benefit.title}</h3>
                    <p className="text-cyan-950/70 leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-cyan-950">
                سفارش‌گذاری تا تحویل داروها چطور در <span className="text-gradient">بارمان</span> اتفاق میوفته؟
              </h2>
              <p className="text-xl text-cyan-950/70 max-w-3xl mx-auto">
                فرآیند ساده و شفاف بارمان در ۴ مرحله
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {processSteps.map((step, index) => (
                  <div key={index} className="relative">
                    <Card className="card-hover bg-white border-cyan-950/10 text-center relative z-10">
                      <CardContent className="p-8">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center text-white font-bold text-xl">
                          {step.step}
                        </div>
                        <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                          <step.icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold text-lg mb-3 text-cyan-950">{step.title}</h3>
                        <p className="text-cyan-950/70 text-sm leading-relaxed">{step.description}</p>
                      </CardContent>
                    </Card>
                    
                    {/* Arrow between steps - only show for desktop and not for last item */}
                    {index < processSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -left-4 transform -translate-y-1/2 z-0">
                        <ArrowRight className="h-8 w-8 text-cyan-600/30" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-cyan-950">
                آماده شروع <span className="text-gradient">خرید هوشمند</span> هستید؟
              </h2>
              <p className="text-xl text-cyan-950/70">
                همین الان به بارمان بپیوندید و از مزایای خرید دسته‌جمعی بهره‌مند شوید
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  <Link to="/contact">
                    درخواست مشاوره
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50">
                  <Link to="/faq">
                    سوالات متداول
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <MobileModal />
    </div>
  );
};

export default AboutPage;