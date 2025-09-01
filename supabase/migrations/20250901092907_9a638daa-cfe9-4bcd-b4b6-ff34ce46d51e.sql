-- Add RLS policies for order_approvals table
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
DROP POLICY IF EXISTS "Pharmacy users can view their pharmacy orders" ON orders;
DROP POLICY IF EXISTS "Pharmacy staff can create orders" ON orders;
DROP POLICY IF EXISTS "Authorized users can update orders" ON orders;

-- New policies for the workflow-based access
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