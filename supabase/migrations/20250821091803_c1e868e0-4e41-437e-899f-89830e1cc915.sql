-- Update order_items to use valid drug_ids
UPDATE order_items 
SET drug_id = (SELECT id FROM drugs LIMIT 1)
WHERE drug_id NOT IN (SELECT id FROM drugs);

-- Now add the foreign key constraint
ALTER TABLE order_items 
ADD CONSTRAINT order_items_drug_id_fkey 
FOREIGN KEY (drug_id) REFERENCES drugs(id);