-- Add foreign key constraint between order_items and drugs
ALTER TABLE order_items 
ADD CONSTRAINT order_items_drug_id_fkey 
FOREIGN KEY (drug_id) REFERENCES drugs(id);