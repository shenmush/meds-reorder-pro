-- Update all order-related RLS policies to use user_roles table instead of pharmacies.user_id

-- Drop existing order policies that depend on pharmacies.user_id
DROP POLICY IF EXISTS "Pharmacies can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Pharmacies can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Pharmacies can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Pharmacy users can view their pharmacy orders" ON public.orders;
DROP POLICY IF EXISTS "Pharmacy staff can create orders" ON public.orders;
DROP POLICY IF EXISTS "Authorized users can update orders" ON public.orders;
DROP POLICY IF EXISTS "Pharmacy accountants can update orders" ON public.orders;

-- Create new order policies using user_roles
CREATE POLICY "Pharmacy staff can view orders for their pharmacy"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND pharmacy_id = orders.pharmacy_id
    AND role IN ('pharmacy_staff', 'pharmacy_accountant', 'pharmacy_manager')
  )
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'barman_staff')
  OR has_role(auth.uid(), 'barman_manager')
  OR has_role(auth.uid(), 'barman_accountant')
);

CREATE POLICY "Pharmacy staff can create orders for their pharmacy"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND pharmacy_id = orders.pharmacy_id
    AND role IN ('pharmacy_staff', 'pharmacy_manager')
  )
);

CREATE POLICY "Authorized users can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND pharmacy_id = orders.pharmacy_id
    AND role IN ('pharmacy_staff', 'pharmacy_manager', 'pharmacy_accountant')
  )
  OR has_role(auth.uid(), 'barman_staff')
  OR has_role(auth.uid(), 'barman_manager')
  OR has_role(auth.uid(), 'barman_accountant')
  OR has_role(auth.uid(), 'admin')
);