# راهنمای نصب و اجرای پروژه روی سرور

## پیش‌نیازها

قبل از شروع، مطمئن شوید که موارد زیر روی سرور شما نصب شده‌اند:

- **Node.js** (نسخه 18 یا بالاتر)
- **npm** یا **yarn** 
- **Git**

## مراحل نصب

### 1. کلون کردن پروژه

```bash
git clone <repository-url>
cd <project-name>
```

### 2. نصب وابستگی‌ها

```bash
npm install
# یا
yarn install
```

### 3. تنظیم متغیرهای محیطی (Environment Variables)

فایل `.env` را در ریشه پروژه ایجاد کنید و مقادیر زیر را وارد کنید:

```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
```

**نکته مهم:** مقادیر فوق را با اطلاعات دیتابیس Supabase خودتان جایگزین کنید.

### 4. اجرای پروژه در حالت توسعه

```bash
npm run dev
# یا
yarn dev
```

پروژه روی پورت 3000 در دسترس خواهد بود: `http://localhost:3000`

### 5. ساخت نسخه تولید (Production Build)

```bash
npm run build
# یا
yarn build
```

### 6. پیش‌نمایش نسخه تولید

```bash
npm run preview
# یا
yarn preview
```

## راه‌اندازی روی سرور

### استفاده از PM2 (توصیه شده)

1. نصب PM2:
```bash
npm install -g pm2
```

2. ساخت فایل `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'pharmacy-app',
    script: 'npm',
    args: 'run preview',
    cwd: '/path/to/your/project',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

3. اجرای پروژه با PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### استفاده از سرور ساده

اگر از build استاتیک استفاده می‌کنید:

```bash
# نصب serve
npm install -g serve

# اجرای فایل‌های build شده
serve -s dist -l 3000
```

## تنظیمات Nginx (اختیاری)

اگر از Nginx استفاده می‌کنید، کانفیگ زیر را اضافه کنید:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## حل مشکلات متداول

### خطای پورت در حال استفاده

اگر پورت 3000 اشغال است:

```bash
# پیدا کردن پروسه‌ای که از پورت استفاده می‌کند
lsof -i :3000

# کشتن پروسه
kill -9 <process-id>
```

### خطای دسترسی به دیتابیس

- مطمئن شوید که اطلاعات Supabase در فایل `.env` درست باشد
- بررسی کنید که Rule های RLS در Supabase به درستی تنظیم شده‌اند

### خطای نصب وابستگی‌ها

```bash
# پاک کردن cache npm
npm cache clean --force

# حذف node_modules و نصب مجدد
rm -rf node_modules package-lock.json
npm install
```

## اسکریپت‌های مفید

### ساخت اسکریپت deploy خودکار

فایل `deploy.sh` بسازید:

```bash
#!/bin/bash

echo "🚀 شروع deployment..."

# گرفتن آخرین تغییرات از git
git pull origin main

# نصب وابستگی‌های جدید
npm install

# ساخت build جدید
npm run build

# ری‌استارت سرویس
pm2 restart pharmacy-app

echo "✅ Deployment تکمیل شد!"
```

اجازه اجرا به اسکریپت بدهید:
```bash
chmod +x deploy.sh
```

## مانیتورینگ

### مشاهده لاگ‌ها با PM2

```bash
# مشاهده لاگ‌ها
pm2 logs pharmacy-app

# مشاهده وضعیت
pm2 status

# ری‌استارت
pm2 restart pharmacy-app

# متوقف کردن
pm2 stop pharmacy-app
```

## نکات امنیتی

1. **HTTPS**: حتماً از SSL certificate استفاده کنید
2. **Environment Variables**: هرگز کلیدهای خصوصی را در کد قرار ندهید
3. **Firewall**: پورت‌های غیرضروری را مسدود کنید
4. **Updates**: به‌طور مرتب dependencies را به‌روزرسانی کنید

```bash
# بررسی آپدیت‌های امنیتی
npm audit

# رفع مشکلات امنیتی
npm audit fix
```

## پشتیبانی

در صورت بروز مشکل:

1. ابتدا لاگ‌ها را بررسی کنید
2. مطمئن شوید تمام وابستگی‌ها نصب شده‌اند
3. تنظیمات environment variables را چک کنید
4. در صورت نیاز از اسکریپت‌های حل مشکل استفاده کنید