-- Remove legacy check constraint blocking approved_pm
alter table public.orders drop constraint if exists valid_workflow_status;

-- Ensure a single unified constraint remains with all allowed statuses
alter table public.orders drop constraint if exists orders_workflow_status_check;

alter table public.orders
add constraint orders_workflow_status_check
check (
  workflow_status in (
    'pending',
    'approved_pm',
    'approved_bs',
    'invoice_issued',
    'payment_uploaded',
    'payment_verified',
    'completed',
    'rejected',
    'needs_revision_ps',
    'needs_revision_pm',
    'needs_revision_bs',
    'needs_revision_pa',
    'payment_rejected',
    'approved',
    'payment_completed',
    'needs_revision_pm_pricing'
  )
);