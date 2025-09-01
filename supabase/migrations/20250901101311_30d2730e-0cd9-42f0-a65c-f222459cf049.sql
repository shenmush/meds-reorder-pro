-- Add missing pharmacy_staff roles for the specified users
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- f.nikvand80@gmail.com : pharmacy_staff (for pharmacy 4e4ea413-6968-40cb-9521-a6c389dd5a95)
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'f.nikvand80@gmail.com';
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'pharmacy_staff'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;

    -- shenmush@yahoo.com : pharmacy_staff (for pharmacy 66d95dac-ccae-4b49-8d52-9185ef4b9873)
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'shenmush@yahoo.com';
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'pharmacy_staff'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;

END $$;