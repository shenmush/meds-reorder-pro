-- Add pharmacy_id to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN pharmacy_id UUID REFERENCES public.pharmacies(id) ON DELETE CASCADE;

-- Update existing pharmacy staff roles to link to their pharmacies
-- f.nikvand80@gmail.com (pharmacy_staff) -> pharmacy 4e4ea413-6968-40cb-9521-a6c389dd5a95
UPDATE public.user_roles 
SET pharmacy_id = '4e4ea413-6968-40cb-9521-a6c389dd5a95'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'f.nikvand80@gmail.com')
AND role = 'pharmacy_staff';

-- mohitbal1996@gmail.com (pharmacy_accountant) -> pharmacy 4e4ea413-6968-40cb-9521-a6c389dd5a95  
UPDATE public.user_roles 
SET pharmacy_id = '4e4ea413-6968-40cb-9521-a6c389dd5a95'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'mohitbal1996@gmail.com')
AND role = 'pharmacy_accountant';

-- mahdisoltaniaf@gmail.com (pharmacy_manager) -> pharmacy 4e4ea413-6968-40cb-9521-a6c389dd5a95
UPDATE public.user_roles 
SET pharmacy_id = '4e4ea413-6968-40cb-9521-a6c389dd5a95'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'mahdisoltaniaf@gmail.com')
AND role = 'pharmacy_manager';

-- shenmush@yahoo.com (pharmacy_staff) -> pharmacy 66d95dac-ccae-4b49-8d52-9185ef4b9873
UPDATE public.user_roles 
SET pharmacy_id = '66d95dac-ccae-4b49-8d52-9185ef4b9873'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'shenmush@yahoo.com')
AND role = 'pharmacy_staff';

-- Create index for better performance
CREATE INDEX idx_user_roles_pharmacy_id ON public.user_roles(pharmacy_id);

-- Update the unique constraint to include pharmacy_id for pharmacy roles
-- Drop old constraint first
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

-- Add new constraint that allows same user to have same role for different pharmacies
-- but prevents duplicate role assignments for same user in same pharmacy
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_pharmacy_role_unique 
UNIQUE (user_id, role, pharmacy_id);