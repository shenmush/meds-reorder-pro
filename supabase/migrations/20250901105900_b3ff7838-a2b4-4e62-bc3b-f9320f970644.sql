-- Update RLS policies for pharmacies table to allow pharmacy staff access

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all pharmacies" ON public.pharmacies;

-- Create new policies
CREATE POLICY "Admins can view all pharmacies" 
ON public.pharmacies 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Pharmacy staff can view their pharmacy" 
ON public.pharmacies 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
      AND user_roles.pharmacy_id = pharmacies.id
      AND user_roles.role IN ('pharmacy_staff', 'pharmacy_accountant', 'pharmacy_manager')
  )
);

CREATE POLICY "Pharmacy managers can update their pharmacy" 
ON public.pharmacies 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
      AND user_roles.pharmacy_id = pharmacies.id
      AND user_roles.role = 'pharmacy_manager'
  )
);

CREATE POLICY "Admins can insert pharmacies" 
ON public.pharmacies 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update pharmacies" 
ON public.pharmacies 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));