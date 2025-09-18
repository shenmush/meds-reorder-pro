-- Create pharmacy_staff_accounts table for storing staff login credentials
CREATE TABLE public.pharmacy_staff_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  staff_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role public.app_role NOT NULL CHECK (role IN ('pharmacy_staff', 'pharmacy_accountant')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pharmacy_staff_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for pharmacy_staff_accounts
CREATE POLICY "Pharmacy managers can manage their staff accounts" 
ON public.pharmacy_staff_accounts 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND pharmacy_id = pharmacy_staff_accounts.pharmacy_id 
    AND role = 'pharmacy_manager'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND pharmacy_id = pharmacy_staff_accounts.pharmacy_id 
    AND role = 'pharmacy_manager'
  )
);

CREATE POLICY "Staff can view their own account" 
ON public.pharmacy_staff_accounts 
FOR SELECT 
USING (
  username = current_setting('app.current_staff_username', true)
);

CREATE POLICY "Staff can update their own credentials" 
ON public.pharmacy_staff_accounts 
FOR UPDATE 
USING (
  username = current_setting('app.current_staff_username', true)
);

CREATE POLICY "Admins can manage all staff accounts" 
ON public.pharmacy_staff_accounts 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pharmacy_staff_accounts_updated_at
BEFORE UPDATE ON public.pharmacy_staff_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to authenticate staff members
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

-- Add staff account count constraints
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS max_staff INTEGER DEFAULT 3;
ALTER TABLE public.pharmacies ADD COLUMN IF NOT EXISTS max_accountants INTEGER DEFAULT 3;

-- Create function to check staff limits
CREATE OR REPLACE FUNCTION public.check_staff_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- Create trigger to enforce staff limits
CREATE TRIGGER enforce_staff_limits
  BEFORE INSERT ON public.pharmacy_staff_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.check_staff_limits();