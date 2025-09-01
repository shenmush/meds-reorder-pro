-- Create storage bucket for payment proof images
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false);

-- Create policies for payment proof storage
CREATE POLICY "Pharmacy accountants can upload payment proofs" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND has_role(auth.uid(), 'pharmacy_accountant'::app_role)
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Accountants can view payment proofs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'payment-proofs' 
  AND (
    has_role(auth.uid(), 'pharmacy_accountant'::app_role)
    OR has_role(auth.uid(), 'barman_accountant'::app_role)
    OR has_role(auth.uid(), 'barman_manager'::app_role)
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Add payment_proof_url column to orders table
ALTER TABLE public.orders ADD COLUMN payment_proof_url TEXT;

-- Add payment_date column to orders table  
ALTER TABLE public.orders ADD COLUMN payment_date TIMESTAMP WITH TIME ZONE;