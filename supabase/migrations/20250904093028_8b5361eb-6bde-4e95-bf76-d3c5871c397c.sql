-- Fix storage bucket RLS policies for payment proofs
-- First, ensure the bucket exists and is configured correctly
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Barman staff can view payment proofs" ON storage.objects;

-- Create policies for payment-proofs bucket
CREATE POLICY "Users can upload payment proofs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'payment-proofs' AND 
  auth.uid() IS NOT NULL AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own payment proofs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'payment-proofs' AND 
  auth.uid() IS NOT NULL AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all payment proofs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'payment-proofs' AND 
  has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Barman staff can view payment proofs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'payment-proofs' AND 
  (has_role(auth.uid(), 'barman_staff'::app_role) OR 
   has_role(auth.uid(), 'barman_manager'::app_role) OR 
   has_role(auth.uid(), 'barman_accountant'::app_role))
);

-- Add missing workflow status for payment verification
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_workflow_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_workflow_status_check 
CHECK (workflow_status IN (
  'pending', 
  'needs_revision_pm', 
  'needs_revision_bs', 
  'needs_revision_pa',
  'approved', 
  'approved_bs', 
  'invoice_issued',
  'payment_uploaded',
  'payment_verified',
  'payment_rejected',
  'rejected',
  'completed'
));