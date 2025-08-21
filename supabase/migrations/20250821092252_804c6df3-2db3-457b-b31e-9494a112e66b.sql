-- First drop the foreign key constraint
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_drug_id_fkey;

-- Drop the drugs table since we don't need it anymore
DROP TABLE IF EXISTS drugs CASCADE;