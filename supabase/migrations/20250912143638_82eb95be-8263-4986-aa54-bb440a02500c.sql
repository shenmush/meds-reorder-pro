-- Fix user_roles SELECT recursion by using a SECURITY DEFINER function
-- 1) Create helper function to check manager role for a pharmacy (avoids policy self-reference)
CREATE OR REPLACE FUNCTION public.is_manager_of_pharmacy(_pharmacy_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'pharmacy_manager'::public.app_role
      AND pharmacy_id = _pharmacy_id
  );
$$;

-- 2) Drop the recursive policy and re-create using the helper function
DROP POLICY IF EXISTS "Pharmacy managers can view roles for their pharmacy" ON public.user_roles;

CREATE POLICY "Pharmacy managers can view roles for their pharmacy"
ON public.user_roles
FOR SELECT
USING (
  public.is_manager_of_pharmacy(public.user_roles.pharmacy_id)
);
