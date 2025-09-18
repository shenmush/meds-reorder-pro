-- Add RLS policy to allow pharmacy accountants to update orders for payment upload
CREATE POLICY "Pharmacy accountants can update orders for payment"
ON public.orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
      AND user_roles.pharmacy_id = orders.pharmacy_id 
      AND user_roles.role = 'pharmacy_accountant'::app_role
  )
);