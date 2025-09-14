-- Allow unauthenticated users to view pharmacies for signup process
CREATE POLICY "Unauthenticated users can view pharmacies for signup" 
ON public.pharmacies 
FOR SELECT 
TO anon
USING (true);