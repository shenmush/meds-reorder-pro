-- Add missing roles for f.nikvand80@gmail.com's pharmacy team
DO $$
DECLARE
    user_uuid uuid;
BEGIN
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