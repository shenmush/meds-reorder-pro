-- Allow barman accountants to view order items 
CREATE POLICY "Barman accountants can view order items" 
ON order_items 
FOR SELECT 
USING (has_role(auth.uid(), 'barman_accountant'::app_role) OR has_role(auth.uid(), 'barman_manager'::app_role));