-- Remove pharmacy_staff_accounts table as it's not needed
-- We'll use user_roles and profiles instead for staff management
DROP TABLE IF EXISTS public.pharmacy_staff_accounts;