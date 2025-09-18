-- Fix RLS policy for pharmacy creation
-- Drop the restrictive policy that prevents users with existing roles from creating pharmacies
DROP POLICY IF EXISTS "New users can create pharmacy during signup" ON public.pharmacies;

-- Create a new policy that allows authenticated users to create a pharmacy if they don't already manage one
CREATE POLICY "Users can create pharmacy if they don't manage one" 
ON public.pharmacies 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'pharmacy_manager'
  )
);