-- Add foreign key constraint to barman_order_items table
ALTER TABLE public.barman_order_items 
ADD CONSTRAINT fk_barman_order_items_barman_order 
FOREIGN KEY (barman_order_id) REFERENCES public.barman_orders(id) ON DELETE CASCADE;

-- Add foreign key constraint to barman_order_items table for order_items
ALTER TABLE public.barman_order_items 
ADD CONSTRAINT fk_barman_order_items_order_item 
FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE CASCADE;