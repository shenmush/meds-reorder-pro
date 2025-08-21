# سامانه مدیریت داروخانه

سامانه جامع مدیریت داروخانه با قابلیت‌های سفارش‌گیری، مدیریت موجودی، و تحلیل گزارشات.

## ویژگی‌ها

- 🏪 مدیریت پروفایل داروخانه
- 💊 جستجو و سفارش داروهای شیمیایی، تجهیزات پزشکی و محصولات طبیعی
- 📋 پیگیری سفارشات و تاریخچه خرید
- 👨‍💼 پنل ادمین برای مدیریت کامل سامانه
- 📊 گزارشات جامع و آنالیز داده‌ها
- 🌙 پشتیبانی از تم تاریک و روشن
- 📱 طراحی کاملاً ریسپانسیو

## فناوری‌های استفاده شده

- **Frontend**: React 18, TypeScript, Vite
- **UI/UX**: Tailwind CSS, shadcn/ui Components
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router DOM

## راه‌اندازی سریع

### پیش‌نیازها

- Node.js (نسخه 18+)
- npm یا yarn

### مراحل نصب

```bash
# کلون پروژه
git clone <repository-url>
cd pharmacy-management

# نصب وابستگی‌ها
npm install

# کپی کردن فایل environment
cp .env.example .env

# تنظیم متغیرهای محیطی در فایل .env
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# اجرای پروژه
npm run dev
```

پروژه روی `http://localhost:3000` در دسترس خواهد بود.

## دستورات موجود

```bash
# اجرای development server
npm run dev

# ساخت برای production
npm run build

# پیش‌نمایش build
npm run preview

# اجرای linter
npm run lint

# Type checking
npm run type-check
```

## ساختار پروژه

```
src/
├── components/          # کامپوننت‌های UI
│   ├── ui/             # کامپوننت‌های پایه shadcn
│   ├── AdminAddDrug.tsx
│   ├── AdminOrders.tsx
│   ├── AdminPharmacies.tsx
│   ├── AdminReports.tsx
│   ├── AuthPage.tsx
│   ├── Dashboard.tsx
│   ├── DrugCard.tsx
│   ├── DrugList.tsx
│   └── ...
├── hooks/              # Custom React hooks
├── integrations/       # تنظیمات Supabase
├── lib/               # توابع کمکی
├── pages/             # صفحات اصلی
└── main.tsx           # نقطه ورود اپلیکیشن
```

## دیتابیس

پروژه از Supabase استفاده می‌کند با جداول زیر:

- `pharmacies` - اطلاعات داروخانه‌ها
- `chemical_drugs` - داروهای شیمیایی
- `medical_supplies` - تجهیزات پزشکی  
- `natural_products` - محصولات طبیعی
- `orders` - سفارشات
- `order_items` - اقلام سفارش
- `profiles` - پروفایل کاربران
- `user_roles` - نقش‌های کاربری

## احراز هویت

سامانه دارای سه سطح دسترسی است:

- **کاربر عادی**: دسترسی به داشبورد و ثبت سفارش
- **صاحب داروخانه**: مدیریت داروخانه و سفارشات
- **ادمین**: دسترسی کامل به تمام بخش‌ها

## Deployment

برای اطلاعات کامل deployment بر روی سرور، فایل [DEPLOYMENT.md](./DEPLOYMENT.md) را مطالعه کنید.

### Deploy سریع

```bash
# ساخت production build
npm run build

# اجرا با serve
npm install -g serve
serve -s dist -p 3000
```

## مشارکت در پروژه

1. Fork کنید
2. برنچ feature بسازید (`git checkout -b feature/AmazingFeature`)
3. تغییرات را commit کنید (`git commit -m 'Add some AmazingFeature'`)
4. به برنچ push کنید (`git push origin feature/AmazingFeature`)
5. Pull Request باز کنید

## لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

## پشتیبانی

برای گزارش باگ یا درخواست feature جدید، از بخش Issues استفاده کنید.
