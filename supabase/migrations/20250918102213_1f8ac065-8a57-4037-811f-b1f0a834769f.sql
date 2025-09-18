-- Fix existing user without pharmacy/role
DO $$
DECLARE
  user_id_val UUID := '4c390274-474c-4a6f-8bb8-4995fa47fdb2';
  new_pharmacy_id UUID;
BEGIN
  -- Check if user already has a pharmacy
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_id_val AND role = 'pharmacy_manager'
  ) THEN
    -- Create a default pharmacy for this user
    INSERT INTO public.pharmacies (name)
    VALUES ('داروخانه جدید')
    RETURNING id INTO new_pharmacy_id;
    
    -- Assign pharmacy_manager role to the user
    INSERT INTO public.user_roles (user_id, role, pharmacy_id)
    VALUES (user_id_val, 'pharmacy_manager', new_pharmacy_id);
    
    RAISE NOTICE 'Created pharmacy and role for user %', user_id_val;
  ELSE
    RAISE NOTICE 'User % already has pharmacy_manager role', user_id_val;
  END IF;
END $$;