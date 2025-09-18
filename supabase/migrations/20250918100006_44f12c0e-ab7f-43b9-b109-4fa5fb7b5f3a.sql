-- Drop existing INSERT policy and create a simpler one
DROP POLICY IF EXISTS "Users can create pharmacy if they don't manage one" ON public.pharmacies;

-- Create simple policy for authenticated users to create pharmacy
CREATE POLICY "Authenticated users can create pharmacy" 
ON public.pharmacies 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix the search path issue for has_role function while we're at it
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;