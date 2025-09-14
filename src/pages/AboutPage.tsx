import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Heart, 
  Award, 
  Users, 
  TrendingUp, 
  Shield,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import LandingLayout from '@/components/layout/LandingLayout';

const AboutPage = () => {
  const values = [
    {
      icon: Heart,
      title: 'مشتری‌مداری',
      description: 'رضایت و موفقیت مشتریان اولویت اصلی ماست'
    },
    {
      icon: Shield,
      title: 'اعتماد و امنیت',
      description: 'حفظ امنیت اطلاعات و کسب اعتماد طولانی‌مدت'
    },
    {
      icon: TrendingUp,
      title: 'نوآوری مستمر',
      description: 'بهبود مداوم محصولات با آخرین فناوری‌ها'
    },
    {
      icon: Users,
      title: 'کار تیمی',
      description: 'همکاری و تعامل سازنده برای دستیابی به اهداف'
    }
  ];

  const milestones = [
    {
      year: '۱۳۹۵',
      title: 'تاسیس شرکت',
      description: 'شروع فعالیت با هدف دیجیتالی کردن صنعت داروخانه‌داری'
    },
    {
      year: '۱۳۹۷',
      title: 'اولین محصول',
      description: 'عرضه اولین نسخه سامانه مدیریت داروخانه'
    },
    {
      year: '۱۴۰۰',
      title: 'گسترش ملی',
      description: 'حضور در بیش از ۱۰ استان کشور'
    },
    {
      year: '۱۴۰۳',
      title: 'رهبری بازار',
      description: 'جزو سه شرکت برتر در حوزه سامانه‌های داروخانه'
    }
  ];

  const teamStats = [
    { number: '۲۵+', label: 'متخصص با تجربه' },
    { number: '۱۰+', label: 'سال تجربه' },
    { number: '۱۰۰+', label: 'پروژه موفق' },
    { number: '۹۸%', label: 'رضایت مشتریان' }
  ];

  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold">
              <span className="text-gradient">درباره</span> ما
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
              ما تیمی از متخصصان با تجربه هستیم که با هدف تحول دیجیتال صنعت داروخانه‌داری 
              و ارائه بهترین خدمات فناوری اطلاعات تلاش می‌کنیم
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            <Card className="card-hover">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Target className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-gradient">مأموریت ما</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  مأموریت ما ارائه راهکارهای فناوری پیشرفته و کاربردی است که 
                  به داروخانه‌ها کمک می‌کند تا فرآیندهای خود را بهینه‌سازی کرده، 
                  کیفیت خدمات را افزایش دهند و در نهایت رضایت بیماران و مشتریان 
                  را به حداکثر برسانند.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                    <Award className="h-8 w-8 text-secondary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-gradient">چشم‌انداز ما</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  چشم‌انداز ما تبدیل شدن به پیشرو در حوزه فناوری اطلاعات سلامت 
                  و ارائه‌دهنده اصلی راهکارهای هوشمند برای صنعت داروخانه‌داری در 
                  منطقه است. ما به دنبال خلق تحولی ماندگار در این صنعت هستیم.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-gradient">ارزش‌های</span> ما
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              اصولی که ما را در مسیر رسیدن به اهدافمان راهنمایی می‌کند
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="card-hover text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <value.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-gradient">مسیر</span> رشد ما
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              نگاهی به مهم‌ترین دستاوردها و نقاط عطف در مسیر فعالیت شرکت
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-8 group">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {milestone.year}
                    </div>
                  </div>
                  <Card className="flex-1 card-hover">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Stats */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-gradient">تیم</span> ما در اعداد
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              آمارهایی که نشان‌دهنده تعهد و تخصص تیم ماست
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {teamStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-gradient mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              آماده همکاری <span className="text-gradient">با ما</span> هستید؟
            </h2>
            <p className="text-xl text-muted-foreground">
              ما مشتاق شناخت بیشتر شما و ارائه بهترین راهکارها برای نیازهای‌تان هستیم
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link to="/contact">
                  تماس با ما
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">
                  ورود به سامانه
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default AboutPage;