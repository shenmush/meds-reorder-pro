-- Update the app_role enum to include new roles
ALTER TYPE app_role ADD VALUE 'pharmacy_staff';
ALTER TYPE app_role ADD VALUE 'pharmacy_manager';
ALTER TYPE app_role ADD VALUE 'barman_staff';
ALTER TYPE app_role ADD VALUE 'barman_manager';

-- Add status column to orders table with new workflow statuses
ALTER TABLE orders ADD COLUMN IF NOT EXISTS workflow_status TEXT DEFAULT 'pending';

-- Update existing orders to have the new status
UPDATE orders SET workflow_status = 'pending' WHERE workflow_status IS NULL;

-- Add constraint to ensure valid workflow statuses
ALTER TABLE orders ADD CONSTRAINT valid_workflow_status 
CHECK (workflow_status IN (
  'pending',              -- waiting for pharmacy manager review
  'approved_pm',          -- approved by pharmacy manager, waiting for barman staff
  'needs_revision_ps',    -- needs revision by pharmacy staff
  'approved_bs',          -- approved by barman staff, waiting for barman manager
  'needs_revision_pm',    -- needs revision by pharmacy manager (from barman)
  'needs_revision_bs',    -- needs revision by barman staff
  'approved',             -- final approval
  'rejected'              -- rejected at any stage
));

-- Add approval history table to track workflow
CREATE TABLE IF NOT EXISTS order_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  from_status TEXT NOT NULL,
  to_status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on order_approvals
ALTER TABLE order_approvals ENABLE ROW LEVEL SECURITY;

-- Create policy for order approvals
CREATE POLICY "Users can view order approvals for accessible orders" 
ON order_approvals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM orders o
    LEFT JOIN pharmacies p ON o.pharmacy_id = p.id
    WHERE o.id = order_approvals.order_id
    AND (
      has_role(auth.uid(), 'admin'::app_role) OR
      p.user_id = auth.uid() OR
      has_role(auth.uid(), 'barman_staff'::app_role) OR
      has_role(auth.uid(), 'barman_manager'::app_role)
    )
  )
);

CREATE POLICY "Authorized users can create order approvals" 
ON order_approvals 
FOR INSERT 
WITH CHECK (
  has_role(auth.uid(), 'pharmacy_manager'::app_role) OR
  has_role(auth.uid(), 'barman_staff'::app_role) OR
  has_role(auth.uid(), 'barman_manager'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- Update orders RLS policies for new roles
DROP POLICY IF EXISTS "Pharmacies can view their own orders" ON orders;
DROP POLICY IF EXISTS "Pharmacies can create their own orders" ON orders;
DROP POLICY IF EXISTS "Pharmacies can update their own orders" ON orders;

-- New policies for pharmacy staff and managers
CREATE POLICY "Pharmacy users can view their pharmacy orders" 
ON orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM pharmacies p
    WHERE p.id = orders.pharmacy_id
    AND p.user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'barman_staff'::app_role) OR
  has_role(auth.uid(), 'barman_manager'::app_role)
);

CREATE POLICY "Pharmacy staff can create orders" 
ON orders 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM pharmacies p
    WHERE p.id = orders.pharmacy_id
    AND p.user_id = auth.uid()
    AND has_role(auth.uid(), 'pharmacy_staff'::app_role)
  )
);

CREATE POLICY "Authorized users can update orders" 
ON orders 
FOR UPDATE 
USING (
  (
    EXISTS (
      SELECT 1 FROM pharmacies p
      WHERE p.id = orders.pharmacy_id
      AND p.user_id = auth.uid()
    ) AND (
      has_role(auth.uid(), 'pharmacy_staff'::app_role) OR
      has_role(auth.uid(), 'pharmacy_manager'::app_role)
    )
  ) OR
  has_role(auth.uid(), 'barman_staff'::app_role) OR
  has_role(auth.uid(), 'barman_manager'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);