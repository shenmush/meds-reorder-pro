-- First, let's add the missing order items for the test order
INSERT INTO order_items (order_id, drug_id, quantity)
SELECT 
  'b28835bd-8645-4b87-8444-825cbddc2993' as order_id,
  pricing.drug_id,
  CASE pricing.drug_id
    WHEN '66e75aff-595a-4e71-a1bb-24937b027dd8' THEN 2  -- VELOTYL (400000/200000 = 2)
    WHEN '9ee1330e-d04d-40a0-a151-090e3e7f86ec' THEN 1  -- AMIPHEN (150000/150000 = 1)  
    WHEN '9754280d-8cd0-42b6-9e23-9bd5b9a646fa' THEN 5  -- ACETAMINOPHEN (750000/150000 = 5)
  END as quantity
FROM order_item_pricing pricing
WHERE pricing.order_id = 'b28835bd-8645-4b87-8444-825cbddc2993';