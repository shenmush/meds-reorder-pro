-- Update payment_proof_url to use the existing real image
UPDATE orders 
SET payment_proof_url = 'https://rriukgdpjlemgalttztd.supabase.co/storage/v1/object/public/payment-proofs/a2ad5461-3594-406f-b41d-cebd26140777/40cadf2c-fb4f-4d1a-88e2-50128b005fa7_1756979354783.jpg'
WHERE id = 'b28835bd-8645-4b87-8444-825cbddc2993';