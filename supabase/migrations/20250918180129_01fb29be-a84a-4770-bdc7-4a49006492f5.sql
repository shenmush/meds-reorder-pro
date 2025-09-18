-- اجازه دسترسی خواندن barman_orders برای مدیرهای داروخانه
CREATE POLICY "Pharmacy managers can view barman orders"
ON public.barman_orders 
FOR SELECT 
USING (
  has_role(auth.uid(), 'pharmacy_manager'::app_role) 
  OR has_role(auth.uid(), 'pharmacy_staff'::app_role) 
  OR has_role(auth.uid(), 'pharmacy_accountant'::app_role)
);