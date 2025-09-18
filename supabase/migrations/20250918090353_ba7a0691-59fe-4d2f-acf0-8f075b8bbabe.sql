-- Fix pharmacy creation during signup
-- Allow authenticated users to create pharmacies if they don't have any roles yet (signup process)
CREATE POLICY "New users can create pharmacy during signup" 
ON public.pharmacies 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- User must be authenticated and not have any roles yet (signup in progress)
  auth.uid() IS NOT NULL AND 
  NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid()
  )
);