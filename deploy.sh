#!/bin/bash

echo "🚀 شروع deployment سامانه مدیریت داروخانه..."

# بررسی اینکه git repository موجود باشد
if [ ! -d ".git" ]; then
    echo "❌ خطا: این دایرکتوری یک git repository نیست"
    exit 1
fi

# گرفتن آخرین تغییرات از git
echo "📥 دریافت آخرین تغییرات از repository..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ خطا در دریافت تغییرات از git"
    exit 1
fi

# بررسی وجود Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js یافت نشد. لطفاً ابتدا Node.js را نصب کنید"
    exit 1
fi

# بررسی وجود npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm یافت نشد. لطفاً ابتدا npm را نصب کنید"
    exit 1
fi

# نصب وابستگی‌های جدید
echo "📦 نصب وابستگی‌ها..."
npm ci --only=production

if [ $? -ne 0 ]; then
    echo "❌ خطا در نصب وابستگی‌ها"
    exit 1
fi

# بررسی وجود فایل .env
if [ ! -f ".env" ]; then
    echo "⚠️  فایل .env یافت نشد. لطفاً آن را از .env.example کپی کنید"
    echo "cp .env.example .env"
    echo "سپس متغیرهای محیطی را تنظیم کنید"
    exit 1
fi

# ساخت build جدید
echo "🏗️  ساخت build production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ خطا در ساخت build"
    exit 1
fi

# بررسی وجود PM2
if command -v pm2 &> /dev/null; then
    echo "🔄 ری‌استارت سرویس با PM2..."
    
    # بررسی اینکه سرویس در حال اجرا باشد
    if pm2 describe pharmacy-management &> /dev/null; then
        pm2 restart pharmacy-management
    else
        pm2 start ecosystem.config.js
    fi
    
    pm2 save
    echo "✅ سرویس با موفقیت restart شد"
else
    echo "⚠️  PM2 یافت نشد. سرویس را به صورت دستی راه‌اندازی کنید:"
    echo "npm install -g pm2"
    echo "pm2 start ecosystem.config.js"
fi

# ایجاد دایرکتوری logs اگر موجود نباشد
mkdir -p logs

echo "✅ Deployment با موفقیت تکمیل شد!"
echo "🌐 سایت در دسترس است: http://localhost:3000"

# نمایش وضعیت PM2 اگر موجود باشد
if command -v pm2 &> /dev/null; then
    echo ""
    echo "📊 وضعیت فعلی سرویس‌ها:"
    pm2 status
fi