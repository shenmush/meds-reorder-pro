import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  Headphones,
  FileText
} from 'lucide-react';
import { Navbar } from "@/sections/Navbar";
import { Footer } from "@/sections/Footer";
import { MobileModal } from "@/components/MobileModal";

const ContactPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const contactInfo = [
    {
      icon: Phone,
      title: 'تلفن تماس',
      details: [
        '۰۲۱-۱۲۳۴۵۶۷۸',
        '۰۲۱-۸۷۶۵۴۳۲۱'
      ],
      description: 'پاسخگویی در روزهای کاری'
    },
    {
      icon: Mail,
      title: 'ایمیل',
      details: [
        'info@pharmacysystem.ir',
        'support@pharmacysystem.ir'
      ],
      description: 'پاسخ در کمتر از ۲۴ ساعت'
    },
    {
      icon: MapPin,
      title: 'آدرس دفتر',
      details: [
        'تهران، میدان ولیعصر',
        'ساختمان پزشکان، طبقه ۵'
      ],
      description: 'ساعات کاری: ۸ تا ۱۷'
    },
    {
      icon: Clock,
      title: 'ساعات کاری',
      details: [
        'شنبه تا چهارشنبه: ۸-۱۷',
        'پنج‌شنبه: ۸-۱۳'
      ],
      description: 'پشتیبانی آنلاین ۲۴/۷'
    }
  ];

  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'دکمه چت داخل سایت/اپلیکیشن',
      description: 'پاسخ سریع',
      action: 'شروع چت',
      color: 'text-green-600'
    },
    {
      icon: Phone,
      title: 'شماره پشتیبانی',
      description: 'ساعات فعالیت: ۹–۱۸',
      action: 'تماس بگیرید',
      color: 'text-blue-600'
    },
    {
      icon: FileText,
      title: 'درخواست تماس/مشاوره رایگان',
      description: 'فرم درخواست مشاوره',
      action: 'درخواست مشاوره',
      color: 'text-purple-600'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // شبیه‌سازی ارسال فرم
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "پیام شما ارسال شد",
        description: "به زودی با شما تماس خواهیم گرفت",
      });

      // ریست کردن فرم
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "خطا در ارسال پیام",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <span className="text-gradient">پشتیبانی</span> و مشاوره
            </h1>
            <p className="text-xl lg:text-2xl text-cyan-950/70 leading-relaxed">
              یه تیم واقعی، همیشه در دسترس شما
            </p>
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

        {/* Support Methods */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-cyan-950">
                <span className="text-gradient">راه‌های</span> تماس
              </h2>
              <p className="text-xl text-cyan-950/70 max-w-2xl mx-auto">
                از طریق این روش‌ها می‌توانید با تیم پشتیبانی ما در ارتباط باشید
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {supportOptions.map((option, index) => (
                <Card key={index} className="card-hover bg-white border-cyan-950/10 text-center">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-white shadow-lg flex items-center justify-center ${option.color}`}>
                      <option.icon className="h-8 w-8" />
                    </div>
                    <h3 className="font-semibold text-lg mb-3 text-cyan-950">{option.title}</h3>
                    <p className="text-cyan-950/70 mb-6">{option.description}</p>
                    <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                      {option.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-cyan-950">
                  درخواست <span className="text-gradient">مشاوره رایگان</span>
                </h2>
                <p className="text-xl text-cyan-950/70">
                  فرم زیر را پر کنید تا کارشناسان ما با شما تماس بگیرند
                </p>
              </div>

              <Card className="card-hover bg-white border-cyan-950/10">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-cyan-950">نام و نام خانوادگی</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="نام خود را وارد کنید"
                          required
                          className="border-cyan-950/20 focus:border-cyan-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-cyan-950">تلفن تماس</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                          dir="ltr"
                          className="border-cyan-950/20 focus:border-cyan-600"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-cyan-950">ایمیل</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="example@email.com"
                        required
                        dir="ltr"
                        className="border-cyan-950/20 focus:border-cyan-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-cyan-950">موضوع درخواست</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="مشاوره خرید دارو، راه‌اندازی سیستم و..."
                        required
                        className="border-cyan-950/20 focus:border-cyan-600"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-cyan-950">توضیحات</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="لطفاً نیاز خود را تشریح کنید تا بتوانیم بهترین مشاوره را ارائه دهیم..."
                        rows={6}
                        required
                        className="border-cyan-950/20 focus:border-cyan-600"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 text-lg" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          در حال ارسال درخواست...
                        </div>
                      ) : (
                        <>
                          <Send className="ml-2 h-5 w-5" />
                          ارسال درخواست مشاوره
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <MobileModal />
    </div>
  );
};

export default ContactPage;