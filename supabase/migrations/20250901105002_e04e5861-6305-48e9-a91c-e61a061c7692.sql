-- Remove user_id column from pharmacies table since we now use user_roles with pharmacy_id
-- First, update RLS policies that depend on user_id

-- Drop existing policies that use user_id
DROP POLICY IF EXISTS "Users can create their own pharmacy profile" ON public.pharmacies;
DROP POLICY IF EXISTS "Users can update their own pharmacy profile" ON public.pharmacies;
DROP POLICY IF EXISTS "Users can view their own pharmacy profile" ON public.pharmacies;

-- Create new policies that work with pharmacy_id in user_roles
CREATE POLICY "Pharmacy managers can create pharmacy profiles"
ON public.pharmacies
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'pharmacy_manager'
    AND pharmacy_id IS NULL  -- Allow creating new pharmacy for managers without assigned pharmacy
  )
);

CREATE POLICY "Pharmacy staff can view their pharmacy profile"
ON public.pharmacies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND pharmacy_id = pharmacies.id
    AND role IN ('pharmacy_staff', 'pharmacy_accountant', 'pharmacy_manager')
  )
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Pharmacy managers can update their pharmacy profile"
ON public.pharmacies
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND pharmacy_id = pharmacies.id
    AND role = 'pharmacy_manager'
  )
  OR has_role(auth.uid(), 'admin')
);

-- Now remove the user_id column
ALTER TABLE public.pharmacies DROP COLUMN IF EXISTS user_id;