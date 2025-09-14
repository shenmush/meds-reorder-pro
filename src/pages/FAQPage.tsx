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
          question: 'سامانه مدیریت داروخانه چیست؟',
          answer: 'سامانه مدیریت داروخانه یک نرم‌افزار جامع است که تمامی فرآیندهای مربوط به مدیریت داروخانه از جمله مدیریت موجودی، ثبت سفارشات، پیگیری فروش، مدیریت مشتریان و ارائه گزارشات تحلیلی را پوشش می‌دهد.'
        },
        {
          question: 'چه کسانی می‌توانند از این سامانه استفاده کنند؟',
          answer: 'این سامانه برای داروخانه‌های مستقل، زنجیره‌ای، مراکز درمانی، و همچنین شرکت‌های پخش دارو طراحی شده است. همچنین کارمندان داروخانه، صاحبان داروخانه و مدیران شبکه‌های داروخانه‌ای می‌توانند از آن بهره‌مند شوند.'
        },
        {
          question: 'آیا سامانه در دستگاه‌های مختلف کار می‌کند؟',
          answer: 'بله، سامانه ما responsive است و روی تمامی دستگاه‌ها شامل کامپیوتر، تبلت و گوشی همراه به صورت بهینه کار می‌کند. همچنین از مرورگرهای مختلف پشتیبانی می‌کند.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'امنیت',
      color: 'text-green-600',
      questions: [
        {
          question: 'اطلاعات من چقدر امن است؟',
          answer: 'امنیت اطلاعات اولویت اصلی ماست. تمامی داده‌ها با استفاده از رمزنگاری پیشرفته محافظت می‌شوند و از پروتکل‌های امنیتی استاندارد بین‌المللی استفاده می‌کنیم. همچنین پشتیبان‌گیری خودکار و مستمر انجام می‌شود.'
        },
        {
          question: 'آیا از استانداردهای بین‌المللی پیروی می‌کنید؟',
          answer: 'بله، سامانه ما از استانداردهای بین‌المللی امنیت اطلاعات مانند ISO 27001 و GDPR پیروی می‌کند. همچنین به صورت مستمر ممیزی امنیتی انجام می‌دهیم.'
        },
        {
          question: 'در صورت قطع اینترنت چه اتفاقی می‌افتد؟',
          answer: 'سامانه دارای قابلیت کار آفلاین محدود است که امکان ادامه کار در موارد ضروری را فراهم می‌کند. پس از برقراری اتصال، تمامی اطلاعات به صورت خودکار همگام‌سازی می‌شوند.'
        }
      ]
    },
    {
      icon: CreditCard,
      title: 'قیمت‌گذاری',
      color: 'text-purple-600',
      questions: [
        {
          question: 'قیمت استفاده از سامانه چقدر است؟',
          answer: 'ما بسته‌های مختلفی متناسب با اندازه و نیاز داروخانه‌ها ارائه می‌دهیم. از پلن پایه برای داروخانه‌های کوچک تا پلن‌های enterprise برای شبکه‌های بزرگ. برای اطلاع از قیمت‌ها با ما تماس بگیرید.'
        },
        {
          question: 'آیا دوره آزمایشی رایگان دارید؟',
          answer: 'بله، ما ۳۰ روز دوره آزمایشی رایگان ارائه می‌دهیم که در طول آن می‌توانید تمامی امکانات سامانه را بدون محدودیت تست کنید.'
        },
        {
          question: 'آیا هزینه‌های مخفی وجود دارد؟',
          answer: 'نه، تمامی هزینه‌ها از ابتدا مشخص و شفاف اعلام می‌شوند. تنها هزینه اضافی که ممکن است وجود داشته باشد، مربوط به خدمات اختیاری مانند آموزش تخصصی یا سفارشی‌سازی خاص است.'
        }
      ]
    },
    {
      icon: Users,
      title: 'پشتیبانی',
      color: 'text-orange-600',
      questions: [
        {
          question: 'چگونه می‌توانم پشتیبانی دریافت کنم؟',
          answer: 'شما می‌توانید از طریق تیکت درون سامانه، تماس تلفنی، ایمیل، چت آنلاین و یا ویدیو کال با تیم پشتیبانی ما در ارتباط باشید. پشتیبانی ما ۲۴/۷ در دسترس است.'
        },
        {
          question: 'زمان پاسخگویی پشتیبانی چقدر است؟',
          answer: 'معمولاً در کمتر از ۲ ساعت به تیکت‌های شما پاسخ می‌دهیم. برای مسائل فوری، پشتیبانی تلفنی در دسترس است که فوراً پاسخگو است.'
        },
        {
          question: 'آیا آموزش ارائه می‌دهید؟',
          answer: 'بله، ما آموزش‌های کاملی شامل ویدیوهای آموزشی، وبینارهای زنده، راهنمای کاربری و همچنین آموزش حضوری در صورت نیاز ارائه می‌دهیم.'
        }
      ]
    }
  ];

  const quickAnswers = [
    {
      question: 'چگونه شروع کنم؟',
      answer: 'برای شروع کافی است ثبت‌نام کنید و از دوره آزمایشی ۳۰ روزه استفاده کنید.'
    },
    {
      question: 'آیا قابل سفارشی‌سازی است؟',
      answer: 'بله، سامانه قابلیت سفارشی‌سازی زیادی دارد و می‌تواند با نیازهای خاص شما تطبیق یابد.'
    },
    {
      question: 'پشتیبانی ۲۴/۷ دارید؟',
      answer: 'بله، تیم پشتیبانی ما در تمامی ساعات شبانه‌روز آماده کمک به شماست.'
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
              پاسخ سؤالات رایج درباره سامانه مدیریت داروخانه
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