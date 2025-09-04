-- Fix the workflow_status check constraint to include the new payment statuses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS valid_workflow_status;

-- Add the updated constraint with all valid workflow statuses
ALTER TABLE public.orders ADD CONSTRAINT valid_workflow_status 
CHECK (workflow_status IN (
  'pending', 
  'confirmed', 
  'invoice_issued', 
  'payment_uploaded', 
  'payment_verified', 
  'payment_rejected', 
  'completed', 
  'cancelled'
));