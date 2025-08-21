-- Make shenmush@gmail.com an admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'shenmush@gmail.com'
ON CONFLICT (user_id, role) 
DO UPDATE SET role = 'admin';