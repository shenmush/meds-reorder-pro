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
import LandingLayout from '@/components/layout/LandingLayout';

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
    <LandingLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold">
              <span className="text-gradient">سؤالات</span> متداول
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              پاسخ سؤالات رایج درباره بارمان
            </p>
            
            {/* Search Box */}
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="سؤال خود را جستجو کنید..."
                className="w-full pr-12 pl-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Answers */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">
              <span className="text-gradient">پاسخ‌های</span> سریع
            </h2>
            <p className="text-muted-foreground">
              پرطرفدارترین سؤالات و پاسخ‌های فوری
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {quickAnswers.map((item, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3 text-primary">
                    {item.question}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-gradient">دسته‌بندی</span> سؤالات
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              سؤالات را بر اساس موضوع دسته‌بندی کرده‌ایم تا راحت‌تر پیدایشان کنید
            </p>
          </div>

          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-6">
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${category.color}`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-gradient">
                    {category.title}
                  </h3>
                </div>

                {/* Questions */}
                <Card className="card-hover">
                  <CardContent className="p-8">
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem 
                          key={faqIndex} 
                          value={`${categoryIndex}-${faqIndex}`}
                          className="border-border/50"
                        >
                          <AccordionTrigger className="text-right hover:text-primary">
                            <span className="font-medium">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed">
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto card-hover bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <HelpCircle className="h-10 w-10 text-primary-foreground" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4">
                هنوز سؤالی <span className="text-gradient">دارید</span>؟
              </h2>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                اگر پاسخ سؤال خود را پیدا نکردید، تیم ما آماده کمک به شماست. 
                از طریق راه‌های زیر با ما در ارتباط باشید
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="btn-primary">
                  <Link to="/contact">
                    <MessageCircle className="ml-2 h-5 w-5" />
                    تماس با پشتیبانی
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg">
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
    </LandingLayout>
  );
};

export default FAQPage;