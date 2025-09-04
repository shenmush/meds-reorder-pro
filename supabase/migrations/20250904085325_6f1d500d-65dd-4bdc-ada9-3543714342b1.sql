-- Add RLS policy for barman managers to view order items
CREATE POLICY "Barman managers can view order items" 
ON public.order_items 
FOR SELECT 
USING (has_role(auth.uid(), 'barman_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for barman managers to view order item pricing
CREATE POLICY "Barman managers can view order item pricing" 
ON public.order_item_pricing 
FOR SELECT 
USING (has_role(auth.uid(), 'barman_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for barman managers to create/update order item pricing
CREATE POLICY "Barman managers can manage order item pricing" 
ON public.order_item_pricing 
FOR ALL 
USING (has_role(auth.uid(), 'barman_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'barman_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));