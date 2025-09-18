-- Add expiry_date field to barman_orders table
ALTER TABLE public.barman_orders 
ADD COLUMN expiry_date DATE;