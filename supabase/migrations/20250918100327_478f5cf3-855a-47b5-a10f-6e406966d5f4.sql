-- Drop all existing INSERT policies for pharmacies to avoid conflicts
DROP POLICY IF EXISTS "Users can create pharmacy" ON public.pharmacies;
DROP POLICY IF EXISTS "Authenticated users can create pharmacy" ON public.pharmacies;
DROP POLICY IF EXISTS "Users can create pharmacy if they don't manage one" ON public.pharmacies;

-- Create a new comprehensive policy that allows pharmacy creation
CREATE POLICY "Allow pharmacy creation" 
ON public.pharmacies 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IS NOT NULL
);