-- Insert a test order with uploaded payment for testing the barman accountant dashboard
INSERT INTO orders (id, pharmacy_id, workflow_status, invoice_amount, payment_proof_url, payment_date, notes, total_items)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM pharmacies LIMIT 1),
  'payment_uploaded',
  850000,
  'https://via.placeholder.com/600x800/cccccc/333333?text=Payment+Receipt',
  now(),
  'تست سفارش برای پنل حسابدار بارمان',
  3
);

-- Get the order ID for adding items
WITH test_order AS (
  SELECT id FROM orders WHERE workflow_status = 'payment_uploaded' ORDER BY created_at DESC LIMIT 1
)
INSERT INTO order_items (order_id, drug_id, quantity)
SELECT 
  (SELECT id FROM test_order),
  (SELECT id FROM chemical_drugs LIMIT 1 OFFSET 0),
  2
UNION ALL
SELECT 
  (SELECT id FROM test_order),
  (SELECT id FROM chemical_drugs LIMIT 1 OFFSET 1),
  1
UNION ALL
SELECT 
  (SELECT id FROM test_order),
  (SELECT id FROM chemical_drugs LIMIT 1 OFFSET 2),
  5;

-- Add pricing for the order items
WITH test_order AS (
  SELECT id FROM orders WHERE workflow_status = 'payment_uploaded' ORDER BY created_at DESC LIMIT 1
),
order_drugs AS (
  SELECT oi.drug_id, oi.quantity, cd.full_brand_name
  FROM order_items oi
  JOIN chemical_drugs cd ON oi.drug_id = cd.id
  WHERE oi.order_id = (SELECT id FROM test_order)
)
INSERT INTO order_item_pricing (order_id, drug_id, unit_price, total_price, notes)
SELECT 
  (SELECT id FROM test_order),
  od.drug_id,
  CASE 
    WHEN RANDOM() < 0.5 THEN 150000
    ELSE 200000
  END as unit_price,
  CASE 
    WHEN RANDOM() < 0.5 THEN 150000 * od.quantity
    ELSE 200000 * od.quantity
  END as total_price,
  'قیمت تست برای ' || od.full_brand_name
FROM order_drugs od;