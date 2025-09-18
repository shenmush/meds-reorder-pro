-- Fix security issues: Set search_path for functions
CREATE OR REPLACE FUNCTION public.authenticate_staff(username_input text, password_input text)
RETURNS TABLE(
  staff_id uuid,
  pharmacy_id uuid,
  staff_name text,
  username text,
  role public.app_role,
  pharmacy_name text
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  stored_hash text;
  account_record record;
BEGIN
  -- Get account details with password hash
  SELECT psa.id, psa.pharmacy_id, psa.staff_name, psa.username, psa.role, psa.password_hash, p.name as pharmacy_name
  INTO account_record
  FROM public.pharmacy_staff_accounts psa
  JOIN public.pharmacies p ON p.id = psa.pharmacy_id
  WHERE psa.username = username_input AND psa.is_active = true;
  
  -- Check if account exists
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Verify password (in real implementation, use proper password hashing)
  -- For now, we'll do simple text comparison but this should use bcrypt or similar
  IF account_record.password_hash = crypt(password_input, account_record.password_hash) THEN
    -- Return account details
    RETURN QUERY SELECT 
      account_record.id,
      account_record.pharmacy_id,
      account_record.staff_name,
      account_record.username,
      account_record.role,
      account_record.pharmacy_name;
  END IF;
END;
$$;

-- Fix search_path for check_staff_limits function
CREATE OR REPLACE FUNCTION public.check_staff_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  staff_count INTEGER;
  accountant_count INTEGER;
  max_staff INTEGER;
  max_accountants INTEGER;
BEGIN
  -- Get pharmacy limits
  SELECT p.max_staff, p.max_accountants 
  INTO max_staff, max_accountants
  FROM public.pharmacies p 
  WHERE p.id = NEW.pharmacy_id;
  
  -- Count existing staff
  SELECT 
    COUNT(*) FILTER (WHERE role = 'pharmacy_staff') as staff_count,
    COUNT(*) FILTER (WHERE role = 'pharmacy_accountant') as accountant_count
  INTO staff_count, accountant_count
  FROM public.pharmacy_staff_accounts 
  WHERE pharmacy_id = NEW.pharmacy_id AND is_active = true;
  
  -- Check limits
  IF NEW.role = 'pharmacy_staff' AND staff_count >= max_staff THEN
    RAISE EXCEPTION 'Maximum number of staff members reached for this pharmacy';
  END IF;
  
  IF NEW.role = 'pharmacy_accountant' AND accountant_count >= max_accountants THEN
    RAISE EXCEPTION 'Maximum number of accountants reached for this pharmacy';
  END IF;
  
  RETURN NEW;
END;
$$;