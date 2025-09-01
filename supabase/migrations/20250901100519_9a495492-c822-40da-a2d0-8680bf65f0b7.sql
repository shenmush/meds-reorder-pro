-- Insert user roles for testing different dashboards
-- Note: These users need to exist in auth.users first before roles can be assigned

-- Insert roles for the specified users
-- We'll use email addresses to find the user_id from auth.users

DO $$
DECLARE
    user_email text;
    user_uuid uuid;
    role_name app_role;
BEGIN
    -- shenmush@gmail.com : barman_manager
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'shenmush@gmail.com';
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'barman_manager'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;

    -- p.shirazian@gmail.com : barman_accountant
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'p.shirazian@gmail.com';
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'barman_accountant'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;

    -- shenmush@icloud.com : barman_staff
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'shenmush@icloud.com';
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'barman_staff'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;

    -- f.nikvan80@gmail.com : pharmacy_staff
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'f.nikvan80@gmail.com';
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'pharmacy_staff'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;

    -- mohitbal1996@gmail.com : pharmacy_accountant
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'mohitbal1996@gmail.com';
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'pharmacy_accountant'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;

    -- mahdisoltaniaf@gmail.com : pharmacy_manager
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'mahdisoltaniaf@gmail.com';
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'pharmacy_manager'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;

END $$;