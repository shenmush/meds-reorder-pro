-- Now remove the user_id column from pharmacies table
ALTER TABLE public.pharmacies DROP COLUMN IF EXISTS user_id;