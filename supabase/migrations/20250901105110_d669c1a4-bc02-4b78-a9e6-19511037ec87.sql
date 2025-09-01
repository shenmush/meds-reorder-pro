-- Drop all remaining pharmacy policies that depend on user_id
DROP POLICY IF EXISTS "Users can view their own pharmacy profile" ON public.pharmacies;
DROP POLICY IF EXISTS "Users can create their own pharmacy profile" ON public.pharmacies;
DROP POLICY IF EXISTS "Users can update their own pharmacy profile" ON public.pharmacies;

-- Now remove the user_id column from pharmacies table
ALTER TABLE public.pharmacies DROP COLUMN IF EXISTS user_id;