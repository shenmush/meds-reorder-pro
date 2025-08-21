-- Add unique constraint to user_roles table first
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- Now update existing users to be admin and insert new admin roles for any users without roles
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_roles)
ON CONFLICT (user_id) DO UPDATE SET role = 'admin'::app_role;