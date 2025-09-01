-- Update RLS policies to include accountant roles
CREATE POLICY "Pharmacy accountants can update orders" 
ON public.orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM pharmacies p 
    WHERE p.id = orders.pharmacy_id 
    AND p.user_id = auth.uid()
    AND has_role(auth.uid(), 'pharmacy_accountant'::app_role)
  )
);

CREATE POLICY "Barman accountants can view orders" 
ON public.orders 
FOR SELECT 
USING (
  has_role(auth.uid(), 'barman_accountant'::app_role)
  OR has_role(auth.uid(), 'barman_manager'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Barman accountants can update orders" 
ON public.orders 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'barman_accountant'::app_role)
  OR has_role(auth.uid(), 'barman_manager'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Update order_approvals policies to include accountant roles
CREATE POLICY "Accountants can create order approvals" 
ON public.order_approvals 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'pharmacy_accountant'::app_role)
  OR has_role(auth.uid(), 'barman_accountant'::app_role)
  OR has_role(auth.uid(), 'pharmacy_manager'::app_role)
  OR has_role(auth.uid(), 'barman_staff'::app_role)
  OR has_role(auth.uid(), 'barman_manager'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);