-- Update order_items drug_ids to valid IDs from our three tables
UPDATE order_items 
SET drug_id = (
  SELECT id FROM chemical_drugs 
  ORDER BY random() 
  LIMIT 1
)
WHERE drug_id = '4371c572-8a1a-441f-ab24-cfa5d94b1540';

-- Let's also add some variety with medical supplies and natural products
INSERT INTO order_items (order_id, drug_id, quantity)
SELECT 
  (SELECT id FROM orders LIMIT 1),
  id,
  floor(random() * 10 + 1)::integer
FROM medical_supplies 
LIMIT 2;

INSERT INTO order_items (order_id, drug_id, quantity)
SELECT 
  (SELECT id FROM orders LIMIT 1),
  id,
  floor(random() * 5 + 1)::integer
FROM natural_products 
LIMIT 1;