-- Add 'invoice_issued' to valid workflow statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS valid_workflow_status;

ALTER TABLE orders ADD CONSTRAINT valid_workflow_status 
CHECK (workflow_status IN (
  'pending',              -- waiting for pharmacy manager review
  'approved_pm',          -- approved by pharmacy manager, waiting for barman staff
  'needs_revision_ps',    -- needs revision by pharmacy staff
  'approved_bs',          -- approved by barman staff, waiting for barman manager
  'needs_revision_pm',    -- needs revision by pharmacy manager (from barman)
  'needs_revision_bs',    -- needs revision by barman staff
  'approved',             -- final approval
  'rejected',             -- rejected at any stage
  'invoice_issued'        -- invoice has been issued
));