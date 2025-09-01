-- Update orders table to support the new workflow statuses
ALTER TABLE orders 
ALTER COLUMN workflow_status SET DEFAULT 'pending';

-- Add pricing fields for invoice management
ALTER TABLE orders 
ADD COLUMN pricing_notes TEXT,
ADD COLUMN invoice_amount DECIMAL(10,2),
ADD COLUMN payment_rejection_reason TEXT;

-- Create a table for order item pricing
CREATE TABLE IF NOT EXISTS order_item_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  drug_id UUID NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on order_item_pricing
ALTER TABLE order_item_pricing ENABLE ROW LEVEL SECURITY;

-- Create policies for order_item_pricing
CREATE POLICY "Authorized users can view order item pricing"
ON order_item_pricing FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders o
    LEFT JOIN user_roles ur ON ur.pharmacy_id = o.pharmacy_id
    WHERE o.id = order_item_pricing.order_id
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR (ur.user_id = auth.uid() AND ur.role IN ('pharmacy_staff'::app_role, 'pharmacy_accountant'::app_role, 'pharmacy_manager'::app_role))
      OR has_role(auth.uid(), 'barman_staff'::app_role)
      OR has_role(auth.uid(), 'barman_manager'::app_role)
      OR has_role(auth.uid(), 'barman_accountant'::app_role)
    )
  )
);

CREATE POLICY "Pharmacy managers can create order item pricing"
ON order_item_pricing FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders o
    LEFT JOIN user_roles ur ON ur.pharmacy_id = o.pharmacy_id
    WHERE o.id = order_item_pricing.order_id
    AND ur.user_id = auth.uid()
    AND ur.role = 'pharmacy_manager'::app_role
  )
);

CREATE POLICY "Pharmacy managers can update order item pricing"
ON order_item_pricing FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM orders o
    LEFT JOIN user_roles ur ON ur.pharmacy_id = o.pharmacy_id
    WHERE o.id = order_item_pricing.order_id
    AND ur.user_id = auth.uid()
    AND ur.role = 'pharmacy_manager'::app_role
  )
);

-- Add trigger for updated_at on order_item_pricing
CREATE TRIGGER update_order_item_pricing_updated_at
  BEFORE UPDATE ON order_item_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();