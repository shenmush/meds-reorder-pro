-- Add INSERT policies for admins on drug tables

-- Chemical drugs - allow admins to insert
CREATE POLICY "Admins can insert chemical drugs"
ON public.chemical_drugs
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Medical supplies - allow admins to insert  
CREATE POLICY "Admins can insert medical supplies"
ON public.medical_supplies
FOR INSERT
TO authenticated  
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Natural products - allow admins to insert
CREATE POLICY "Admins can insert natural products" 
ON public.natural_products
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));