-- Add English name field to pharmacies table
ALTER TABLE public.pharmacies 
ADD COLUMN english_name TEXT;