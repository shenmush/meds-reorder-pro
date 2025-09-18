-- Update the handle_new_user function to automatically create pharmacy and role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_pharmacy_id uuid;
BEGIN
  -- Create profile first
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  
  -- Create a default pharmacy for the new user
  INSERT INTO public.pharmacies (name)
  VALUES ('داروخانه جدید')
  RETURNING id INTO new_pharmacy_id;
  
  -- Assign pharmacy_manager role to the new user
  INSERT INTO public.user_roles (user_id, role, pharmacy_id)
  VALUES (new.id, 'pharmacy_manager', new_pharmacy_id);
  
  RETURN new;
END;
$function$;