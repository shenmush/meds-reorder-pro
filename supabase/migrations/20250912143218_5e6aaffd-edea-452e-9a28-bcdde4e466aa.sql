-- Revert user_roles RLS policies to the stable baseline
-- 1) Ensure RLS is enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2) Drop ALL existing policies on user_roles safely
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
  END LOOP;
END$$;

-- 3) Re-create baseline policies exactly
-- Policy: Only admins can manage roles (ALL commands)
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Policy: Pharmacy managers can view roles for their pharmacy (SELECT)
CREATE POLICY "Pharmacy managers can view roles for their pharmacy"
ON public.user_roles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.pharmacy_id = public.user_roles.pharmacy_id
      AND ur.role = 'pharmacy_manager'::public.app_role
  )
);

-- Policy: Users can view their own roles (SELECT)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = public.user_roles.user_id);
