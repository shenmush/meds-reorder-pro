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
import LandingLayout from '@/components/layout/LandingLayout';

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
      title: 'چت آنلاین',
      description: 'گفتگوی زنده با پشتیبانی',
      action: 'شروع چت',
      color: 'text-green-600'
    },
    {
      icon: Headphones,
      title: 'پشتیبانی تلفنی',
      description: 'تماس مستقیم با کارشناسان',
      action: 'تماس بگیرید',
      color: 'text-blue-600'
    },
    {
      icon: FileText,
      title: 'مرکز راهنمایی',
      description: 'راهنماها و مستندات کامل',
      action: 'مطالعه راهنما',
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
    <LandingLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold">
              <span className="text-gradient">تماس</span> با ما
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              ما آماده‌ایم تا سؤالات شما را پاسخ دهیم و بهترین راهکار را برای نیازهای‌تان ارائه کنیم
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <Card key={index} className="card-hover text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <info.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-3">{info.title}</h3>
                  <div className="space-y-1 mb-3">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-muted-foreground">{detail}</p>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {info.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Support Options */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="text-2xl text-gradient">
                  پیام شما برای ما مهم است
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">نام و نام خانوادگی</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="نام خود را وارد کنید"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">تلفن تماس</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">ایمیل</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="example@email.com"
                      required
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">موضوع</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="موضوع پیام خود را بنویسید"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">پیام</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="پیام خود را تفصیلی بنویسید..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-primary" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        در حال ارسال...
                      </div>
                    ) : (
                      <>
                        <Send className="ml-2 h-5 w-5" />
                        ارسال پیام
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Support Options */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  <span className="text-gradient">راه‌های</span> دریافت پشتیبانی
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  علاوه بر فرم تماس، می‌توانید از طریق روش‌های زیر نیز با ما در ارتباط باشید
                </p>
              </div>

              <div className="space-y-6">
                {supportOptions.map((option, index) => (
                  <Card key={index} className="card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${option.color}`}>
                          <option.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{option.title}</h3>
                          <p className="text-muted-foreground mb-4">{option.description}</p>
                          <Button variant="outline" size="sm">
                            {option.action}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto card-hover">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                سؤال شما در <span className="text-gradient">پرسش‌های متداول</span> پاسخ دارد؟
              </h2>
              <p className="text-muted-foreground mb-6">
                شاید پاسخ سؤال شما در بخش سؤالات متداول موجود باشد. 
                ابتدا آن‌ها را بررسی کنید
              </p>
              <Button asChild variant="outline" size="lg">
                <a href="/faq">
                  مشاهده سؤالات متداول
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </LandingLayout>
  );
};

export default ContactPage;