-- Remove duplicate order items created today
DELETE FROM order_items 
WHERE order_id = 'b28835bd-8645-4b87-8444-825cbddc2993' 
AND created_at >= '2025-09-10';