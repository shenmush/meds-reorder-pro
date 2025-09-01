-- First, remove any existing roles that might conflict and clean up old admin/user roles
DELETE FROM public.user_roles WHERE role NOT IN ('barman_manager', 'barman_accountant', 'barman_staff', 'pharmacy_staff', 'pharmacy_accountant', 'pharmacy_manager');

-- Clear all existing user roles to start fresh
DELETE FROM public.user_roles;

-- Insert user roles for testing different dashboards
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- shenmush@gmail.com : barman_manager
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'shenmush@gmail.com';
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'barman_manager'::app_role);
    END IF;

    -- p.shirazian@gmail.com : barman_accountant
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'p.shirazian@gmail.com';
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'barman_accountant'::app_role);
    END IF;

    -- shenmush@icloud.com : barman_staff
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'shenmush@icloud.com';
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'barman_staff'::app_role);
    END IF;

    -- f.nikvan80@gmail.com : pharmacy_staff  
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'f.nikvan80@gmail.com';
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'pharmacy_staff'::app_role);
    END IF;

    -- mohitbal1996@gmail.com : pharmacy_accountant
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'mohitbal1996@gmail.com';
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'pharmacy_accountant'::app_role);
    END IF;

    -- mahdisoltaniaf@gmail.com : pharmacy_manager
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'mahdisoltaniaf@gmail.com';
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'pharmacy_manager'::app_role);
    END IF;

END $$;