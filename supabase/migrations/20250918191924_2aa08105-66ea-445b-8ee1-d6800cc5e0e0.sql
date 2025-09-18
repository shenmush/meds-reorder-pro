-- حذف فیلدهای تحویل از جدول consolidated_drug_status
ALTER TABLE public.consolidated_drug_status 
DROP COLUMN IF EXISTS received_at,
DROP COLUMN IF EXISTS received_by,
DROP COLUMN IF EXISTS is_received;

-- اضافه کردن فیلدهای تحویل به جدول order_items
ALTER TABLE public.order_items 
ADD COLUMN received_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN received_by UUID NULL REFERENCES auth.users(id),
ADD COLUMN is_received BOOLEAN NOT NULL DEFAULT false;