-- Create barman_order_items table to map barman orders to specific order items
CREATE TABLE public.barman_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barman_order_id UUID NOT NULL,
  order_item_id UUID NOT NULL,
  quantity_fulfilled INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(barman_order_id, order_item_id)
);

-- Enable RLS
ALTER TABLE public.barman_order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for barman_order_items
CREATE POLICY "Barman managers can manage barman order items" 
ON public.barman_order_items 
FOR ALL 
USING (has_role(auth.uid(), 'barman_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'barman_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Barman staff can view barman order items" 
ON public.barman_order_items 
FOR SELECT 
USING (has_role(auth.uid(), 'barman_staff'::app_role) OR has_role(auth.uid(), 'barman_accountant'::app_role) OR has_role(auth.uid(), 'barman_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create policy for pharmacy staff to view order items that are related to their orders
CREATE POLICY "Pharmacy staff can view barman order items for their orders" 
ON public.barman_order_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  JOIN user_roles ur ON ur.pharmacy_id = o.pharmacy_id
  WHERE oi.id = barman_order_items.order_item_id
  AND ur.user_id = auth.uid()
  AND ur.role IN ('pharmacy_staff', 'pharmacy_accountant', 'pharmacy_manager')
));

-- Add order_items field to consolidated_drug_status to track which items are included
ALTER TABLE public.consolidated_drug_status 
ADD COLUMN order_item_ids UUID[] DEFAULT '{}';