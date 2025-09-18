-- Fix the handle_new_user trigger to not assign any role automatically
-- Let the PharmacySetup component handle role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create profile, don't assign any role
  -- Roles will be assigned later during pharmacy setup
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  
  RETURN new;
END;
$$;