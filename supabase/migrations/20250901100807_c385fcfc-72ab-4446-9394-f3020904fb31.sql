-- Add the missing pharmacy_staff role for f.nikvan80@gmail.com
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- f.nikvan80@gmail.com : pharmacy_staff
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'f.nikvan80@gmail.com';
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (user_uuid, 'pharmacy_staff'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;