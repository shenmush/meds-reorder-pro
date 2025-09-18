-- Add created_by field to orders table to track who created the order
ALTER TABLE public.orders 
ADD COLUMN created_by uuid REFERENCES auth.users(id);

-- Update existing orders to set created_by (optional - can be null for existing orders)
-- We won't update existing orders since we don't have the data

-- Update RLS policies to allow staff and managers to edit orders they created or manage
-- Drop existing policies first
DROP POLICY IF EXISTS "Pharmacy staff can create orders for their pharmacy" ON public.orders;
DROP POLICY IF EXISTS "Authorized users can update orders" ON public.orders;

-- Recreate with better permissions
CREATE POLICY "Pharmacy staff can create orders for their pharmacy" 
ON public.orders 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
      AND pharmacy_id = orders.pharmacy_id 
      AND role IN ('pharmacy_staff', 'pharmacy_manager')
  ) 
  AND created_by = auth.uid()
);

CREATE POLICY "Order creators and managers can update orders" 
ON public.orders 
FOR UPDATE 
TO authenticated
USING (
  -- Order creator can edit if status is 'pending' 
  (created_by = auth.uid() AND status = 'pending')
  OR
  -- Pharmacy manager can always edit orders from their pharmacy
  (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
      AND pharmacy_id = orders.pharmacy_id 
      AND role = 'pharmacy_manager'
  ))
  OR
  -- Barman staff and managers can edit
  (has_role(auth.uid(), 'barman_staff') OR has_role(auth.uid(), 'barman_manager') OR has_role(auth.uid(), 'barman_accountant'))
  OR
  -- Admins can edit all
  has_role(auth.uid(), 'admin')
);