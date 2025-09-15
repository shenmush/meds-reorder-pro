import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Search, 
  HelpCircle, 
  MessageCircle, 
  ArrowLeft,
  Shield,
  CreditCard,
  Settings,
  Users
} from 'lucide-react';
import { Navbar } from "@/sections/Navbar";
import { Footer } from "@/sections/Footer";
import { MobileModal } from "@/components/MobileModal";

const FAQPage = () => {
  const faqCategories = [
    {
      icon: Settings,
      title: 'عمومی',
      color: 'text-blue-600',
      questions: [
        {
          question: 'بارمان برای چه کسانی است؟',
          answer: 'بارمان ویژه‌ی داروخانه‌ها طراحی شده تا بتوانند به‌راحتی از شرکت‌ها و توزیع‌کنندگان معتبر سفارش ثبت کنند.'
        }
      ]
    },
    {
      icon: Users,
      title: 'شروع کار',
      color: 'text-green-600',
      questions: [
        {
          question: 'ثبت‌نام چطور انجام می‌شود؟',
          answer: 'فرمِ ساده در سایت/اپ را پر کنید؛ تیم ما فعال‌سازی حساب و راه‌اندازی اولیه را انجام می‌دهد.'
        },
        {
          question: 'چطور می‌توانم اپلیکیشن را دانلود کنم؟',
          answer: 'نسخه اندروید و iOS از طریق لینک‌های موجود در سایت و فروشگاه‌های معتبر در دسترس است.'
        }
      ]
    },
    {
      icon: CreditCard,
      title: 'پرداخت',
      color: 'text-purple-600',
      questions: [
        {
          question: 'شرایط پرداخت به چه صورت است؟',
          answer: 'ما شرایط پرداخت رو طوری طراحی کردیم که داروخانه‌ها راحت‌تر بتونن مدیریت مالی کنن؛ از پرداخت نقدی تا اعتباری.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'پشتیبانی و خدمات',
      color: 'text-orange-600',
      questions: [
        {
          question: 'آیا سفارش‌ها قابل پیگیری هستند؟',
          answer: 'بله، هر سفارش از لحظه ثبت تا ارسال در اپلیکیشن بارمان قابل مشاهده و پیگیری لحظه‌ای است.'
        },
        {
          question: 'در صورت بروز مشکل چه کنم؟',
          answer: 'می‌توانید از طریق بخش پشتیبانی آنلاین یا تماس تلفنی با کارشناسان بارمان ارتباط بگیرید.'
        }
      ]
    }
  ];

  const quickAnswers = [
    {
      question: 'چگونه شروع کنم؟',
      answer: 'فرمِ ساده را پر کنید؛ تیم ما فعال‌سازی حساب را انجام می‌دهد.'
    },
    {
      question: 'بارمان برای کیست؟',
      answer: 'بارمان ویژه‌ی داروخانه‌ها برای سفارش از شرکت‌های معتبر طراحی شده.'
    },
    {
      question: 'سفارش‌ها قابل پیگیری است؟',
      answer: 'بله، هر سفارش از ثبت تا ارسال قابل پیگیری لحظه‌ای است.'
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
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-cyan-950">
              <span className="text-gradient">سؤالات</span> متداول
            </h1>
            <p className="text-xl lg:text-2xl text-cyan-950/70 leading-relaxed">
              پاسخ سؤالات رایج درباره بارمان
            </p>
            
            {/* Search Box */}
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-950/50 h-5 w-5" />
              <input
                type="text"
                placeholder="سؤال خود را جستجو کنید..."
                className="w-full pr-12 pl-4 py-3 rounded-lg border border-cyan-950/20 bg-white focus:ring-2 focus:ring-cyan-600 focus:border-transparent text-cyan-950"
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

        {/* Quick Answers */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-4 text-cyan-950">
                <span className="text-gradient">پاسخ‌های</span> سریع
              </h2>
              <p className="text-cyan-950/70">
                پرطرفدارترین سؤالات و پاسخ‌های فوری
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {quickAnswers.map((item, index) => (
                <Card key={index} className="card-hover bg-white border-cyan-950/10">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3 text-cyan-800">
                      {item.question}
                    </h3>
                    <p className="text-cyan-950/70 text-sm">
                      {item.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-20 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-cyan-950">
                <span className="text-gradient">دسته‌بندی</span> سؤالات
              </h2>
              <p className="text-xl text-cyan-950/70 max-w-2xl mx-auto">
                سؤالات را بر اساس موضوع دسته‌بندی کرده‌ایم تا راحت‌تر پیدایشان کنید
              </p>
            </div>

            <div className="space-y-12">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-6">
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`w-12 h-12 rounded-lg bg-white flex items-center justify-center ${category.color}`}>
                      <category.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-gradient">
                      {category.title}
                    </h3>
                  </div>

                  {/* Questions */}
                  <Card className="card-hover bg-white border-cyan-950/10">
                    <CardContent className="p-8">
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((faq, faqIndex) => (
                          <AccordionItem 
                            key={faqIndex} 
                            value={`${categoryIndex}-${faqIndex}`}
                            className="border-cyan-950/10"
                          >
                            <AccordionTrigger className="text-right hover:text-cyan-800">
                              <span className="font-medium text-cyan-950">{faq.question}</span>
                            </AccordionTrigger>
                            <AccordionContent className="text-cyan-950/70 leading-relaxed">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto card-hover bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-950/10">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center">
                  <HelpCircle className="h-10 w-10 text-white" />
                </div>
                
                <h2 className="text-3xl font-bold mb-4 text-cyan-950">
                  هنوز سؤالی <span className="text-gradient">دارید</span>؟
                </h2>
                
                <p className="text-xl text-cyan-950/70 mb-8 max-w-2xl mx-auto">
                  اگر پاسخ سؤال خود را پیدا نکردید، تیم ما آماده کمک به شماست. 
                  از طریق راه‌های زیر با ما در ارتباط باشید
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    <Link to="/contact">
                      <MessageCircle className="ml-2 h-5 w-5" />
                      تماس با پشتیبانی
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="lg" className="border-cyan-600 text-cyan-600 hover:bg-cyan-50">
                    <Link to="/login">
                      شروع دوره آزمایشی
                      <ArrowLeft className="mr-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
      <MobileModal />
    </div>
  );
};

export default FAQPage;