-- اضافه کردن فیلد آفر به جدول قیمت‌گذاری
ALTER TABLE public.order_item_pricing 
ADD COLUMN offer_percentage NUMERIC DEFAULT 0;

-- اضافه کردن فیلد روش پرداخت به جدول سفارشات
ALTER TABLE public.orders 
ADD COLUMN payment_method TEXT;