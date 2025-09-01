-- Update order_items and order_approvals policies to use user_roles instead of pharmacies.user_id

-- Drop existing order_items policies
DROP POLICY IF EXISTS "Users can view order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;

-- Create new order_items policies
CREATE POLICY "Pharmacy staff can view order items for their pharmacy orders"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.user_roles ur ON ur.pharmacy_id = o.pharmacy_id
    WHERE o.id = order_items.order_id
    AND ur.user_id = auth.uid()
    AND ur.role IN ('pharmacy_staff', 'pharmacy_accountant', 'pharmacy_manager')
  )
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Pharmacy staff can create order items for their pharmacy orders"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.user_roles ur ON ur.pharmacy_id = o.pharmacy_id
    WHERE o.id = order_items.order_id
    AND ur.user_id = auth.uid()
    AND ur.role IN ('pharmacy_staff', 'pharmacy_manager')
  )
);

-- Drop existing order_approvals policy
DROP POLICY IF EXISTS "Users can view order approvals for accessible orders" ON public.order_approvals;

-- Create new order_approvals policy
CREATE POLICY "Users can view order approvals for accessible orders"
ON public.order_approvals
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    LEFT JOIN public.user_roles ur ON ur.pharmacy_id = o.pharmacy_id
    WHERE o.id = order_approvals.order_id
    AND (
      has_role(auth.uid(), 'admin')
      OR (ur.user_id = auth.uid() AND ur.role IN ('pharmacy_staff', 'pharmacy_accountant', 'pharmacy_manager'))
      OR has_role(auth.uid(), 'barman_staff')
      OR has_role(auth.uid(), 'barman_manager')
      OR has_role(auth.uid(), 'barman_accountant')
    )
  )
);