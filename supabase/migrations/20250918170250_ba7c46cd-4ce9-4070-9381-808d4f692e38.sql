-- Add DELETE policy for order_items so users can delete items when editing orders
CREATE POLICY "Pharmacy staff can delete order items for their pharmacy orders"
ON public.order_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM orders o
    JOIN user_roles ur ON ur.pharmacy_id = o.pharmacy_id
    WHERE o.id = order_items.order_id
    AND ur.user_id = auth.uid()
    AND ur.role IN ('pharmacy_staff', 'pharmacy_manager')
  )
);

-- Also add UPDATE policy for order_items for editing functionality
CREATE POLICY "Pharmacy staff can update order items for their pharmacy orders"
ON public.order_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 
    FROM orders o
    JOIN user_roles ur ON ur.pharmacy_id = o.pharmacy_id
    WHERE o.id = order_items.order_id
    AND ur.user_id = auth.uid()
    AND ur.role IN ('pharmacy_staff', 'pharmacy_manager')
  )
);