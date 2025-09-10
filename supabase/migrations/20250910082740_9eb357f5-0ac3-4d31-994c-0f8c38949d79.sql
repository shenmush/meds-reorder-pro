-- Update the test order to use the existing payment receipt
UPDATE orders 
SET payment_proof_url = 'https://rriukgdpjlemgalttztd.supabase.co/storage/v1/object/public/payment-proofs/a2ad5461-3594-406f-b41d-cebd26140777/40cadf2c-fb4f-4d1a-88e2-50128b005fa7_1756979354783.jpg'
WHERE pharmacy_id = (SELECT id FROM pharmacies WHERE name = 'داروخانه تست' LIMIT 1)
  AND workflow_status = 'payment_uploaded';