-- Allow pharmacy managers with null pharmacy_id to create a pharmacy
DROP POLICY IF EXISTS "Authenticated users can create pharmacy" ON public.pharmacies;

CREATE POLICY "Users can create pharmacy" 
ON public.pharmacies 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (
    -- Allow any user who doesn't have a pharmacy_manager role yet
    NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'pharmacy_manager'
    )
    OR
    -- Allow pharmacy managers who don't have a pharmacy assigned yet
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
        AND role = 'pharmacy_manager' 
        AND pharmacy_id IS NULL
    )
    OR
    -- Allow admins
    has_role(auth.uid(), 'admin'::app_role)
  )
);