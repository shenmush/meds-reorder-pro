-- Make payment-proofs bucket public so payment receipts can be viewed
UPDATE storage.buckets 
SET public = true 
WHERE name = 'payment-proofs';