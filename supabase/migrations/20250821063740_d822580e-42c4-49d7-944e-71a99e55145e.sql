-- Create table for chemical drugs (داروهای شیمیایی)
CREATE TABLE public.chemical_drugs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  irc TEXT NOT NULL UNIQUE,
  full_brand_name TEXT NOT NULL,
  generic_code TEXT,
  license_owner_company_name TEXT,
  license_owner_company_national_id TEXT,
  package_count INTEGER,
  gtin TEXT,
  erx_code TEXT,
  action TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for medical supplies (ملزومات دارویی)
CREATE TABLE public.medical_supplies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  irc TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  license_owner_company_name TEXT,
  license_owner_company_national_code TEXT,
  package_count INTEGER,
  erx_code TEXT,
  gtin TEXT,
  action TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for natural products (فرآورده های طبیعی)
CREATE TABLE public.natural_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  irc TEXT NOT NULL UNIQUE,
  atc_code TEXT,
  full_en_brand_name TEXT NOT NULL,
  license_owner_name TEXT,
  license_owner_national_code TEXT,
  erx_code TEXT,
  package_count INTEGER,
  gtin TEXT,
  action TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all three tables
ALTER TABLE public.chemical_drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natural_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for chemical drugs
CREATE POLICY "Authenticated users can view active chemical drugs" 
ON public.chemical_drugs 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for medical supplies
CREATE POLICY "Authenticated users can view active medical supplies" 
ON public.medical_supplies 
FOR SELECT 
USING (is_active = true);

-- Create RLS policies for natural products
CREATE POLICY "Authenticated users can view active natural products" 
ON public.natural_products 
FOR SELECT 
USING (is_active = true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_chemical_drugs_updated_at
BEFORE UPDATE ON public.chemical_drugs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_supplies_updated_at
BEFORE UPDATE ON public.medical_supplies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_natural_products_updated_at
BEFORE UPDATE ON public.natural_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add sample data
INSERT INTO public.chemical_drugs (irc, full_brand_name, generic_code, license_owner_company_name, license_owner_company_national_id, package_count, gtin, erx_code, action) 
VALUES ('9154715040124503', 'ACA TABLET ORAL 162.5 mg/32.5 mg/325 mg', '1', 'البرز دارو', '10861412626', 100, '06260152410148', '60000', '');

INSERT INTO public.medical_supplies (irc, title, license_owner_company_name, license_owner_company_national_code, package_count, erx_code, gtin, action) 
VALUES ('8995136492413977', 'A.T.P VISC PREFILLED SYRINGE 2% 3 mL', 'ابزار طب پویا', '10103090187', 1, '10000', '06261454601081', 'Old');

INSERT INTO public.natural_products (irc, atc_code, full_en_brand_name, license_owner_name, license_owner_national_code, erx_code, package_count, gtin, action) 
VALUES ('7244191137640241', '', 'ACTIVEIN CAPSULE ORAL', 'گیاهان سبز زندگی', '10101908439', '90013', 30, '6260465200573', 'Old');