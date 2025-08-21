-- Remove the old foreign key constraint to drugs table
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_drug_id_fkey;

-- Since we now have drugs from multiple tables (chemical_drugs, medical_supplies, natural_products),
-- we'll remove the strict foreign key constraint and handle validation at the application level
-- The drug_id will still store UUIDs from any of the three drug tables