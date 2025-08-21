-- Add admin access policies for pharmacies
CREATE POLICY "Admins can view all pharmacies" 
ON public.pharmacies 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin access policies for orders
CREATE POLICY "Admins can view all orders" 
ON public.orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all orders" 
ON public.orders 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin access policies for order_items
CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));