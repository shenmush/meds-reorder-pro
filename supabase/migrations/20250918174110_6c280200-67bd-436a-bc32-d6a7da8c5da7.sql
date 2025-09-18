-- Add policy for pharmacy managers to view consolidated drug status
CREATE POLICY "Pharmacy managers can view consolidated drug status" 
ON public.consolidated_drug_status 
FOR SELECT 
USING (has_role(auth.uid(), 'pharmacy_manager'::app_role) OR has_role(auth.uid(), 'pharmacy_staff'::app_role) OR has_role(auth.uid(), 'pharmacy_accountant'::app_role));