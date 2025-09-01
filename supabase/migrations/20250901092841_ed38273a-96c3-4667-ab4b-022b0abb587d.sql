-- Add workflow status column to orders table
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