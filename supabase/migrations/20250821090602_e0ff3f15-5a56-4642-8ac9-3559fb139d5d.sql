-- Make the current logged-in user an admin (you'll need to replace with actual user_id)
-- First, let's see current users
SELECT * FROM auth.users;

-- Create admin role for any user who doesn't have a role yet
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';