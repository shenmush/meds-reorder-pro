-- Allow new workflow statuses including approved_pm and legacy ones used in code
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
    -- legacy/statuses referenced in UI (to avoid constraint failures on existing rows)
    'approved',
    'payment_completed',
    'needs_revision_pm_pricing'
  )
);