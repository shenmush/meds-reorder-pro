-- Update handle_new_user function to check if user was created by manager
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_pharmacy_id uuid;
  existing_role_count integer;
  created_by_manager boolean;
BEGIN
  -- Create profile first
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  
  -- Check if user was created by a manager
  created_by_manager := COALESCE((new.raw_user_meta_data ->> 'created_by_manager')::boolean, false); 
  
  -- Check if user already has a role (created by edge function)
  SELECT COUNT(*) INTO existing_role_count
  FROM public.user_roles
  WHERE user_id = new.id;
  
  -- Only create pharmacy_manager role if user doesn't have any roles yet 
  -- AND was not created by a manager
  IF existing_role_count = 0 AND NOT created_by_manager THEN
    -- Create a default pharmacy for the new user
    INSERT INTO public.pharmacies (name)
    VALUES ('داروخانه جدید')
    RETURNING id INTO new_pharmacy_id;
    
    -- Assign pharmacy_manager role to the new user
    INSERT INTO public.user_roles (user_id, role, pharmacy_id)
    VALUES (new.id, 'pharmacy_manager', new_pharmacy_id);
  END IF;
  
  RETURN new;
END;
$$;