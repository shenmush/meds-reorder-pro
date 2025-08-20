-- Create pharmacies table for storing pharmacy information
CREATE TABLE public.pharmacies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  license_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drugs table for the drug inventory
CREATE TABLE public.drugs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  dosage TEXT,
  unit TEXT NOT NULL DEFAULT 'عدد',
  category TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table for pharmacy orders
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  total_items INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table for individual drug requests in orders
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  drug_id UUID NOT NULL REFERENCES public.drugs(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for pharmacies table
CREATE POLICY "Users can view their own pharmacy profile" 
ON public.pharmacies 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pharmacy profile" 
ON public.pharmacies 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pharmacy profile" 
ON public.pharmacies 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for drugs table (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view drugs" 
ON public.drugs 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Create policies for orders table
CREATE POLICY "Pharmacies can view their own orders" 
ON public.orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pharmacies 
    WHERE pharmacies.id = orders.pharmacy_id 
    AND pharmacies.user_id = auth.uid()
  )
);

CREATE POLICY "Pharmacies can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pharmacies 
    WHERE pharmacies.id = orders.pharmacy_id 
    AND pharmacies.user_id = auth.uid()
  )
);

CREATE POLICY "Pharmacies can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.pharmacies 
    WHERE pharmacies.id = orders.pharmacy_id 
    AND pharmacies.user_id = auth.uid()
  )
);

-- Create policies for order_items table
CREATE POLICY "Users can view order items for their orders" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.pharmacies p ON o.pharmacy_id = p.id
    WHERE o.id = order_items.order_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create order items for their orders" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.pharmacies p ON o.pharmacy_id = p.id
    WHERE o.id = order_items.order_id 
    AND p.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_pharmacies_updated_at
  BEFORE UPDATE ON public.pharmacies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drugs_updated_at
  BEFORE UPDATE ON public.drugs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample drugs
INSERT INTO public.drugs (name, generic_name, dosage, unit, category, description) VALUES
('استامینوفن', 'Acetaminophen', '500mg', 'عدد', 'مسکن', 'قرص ضد درد و تب‌بر'),
('ایبوپروفن', 'Ibuprofen', '400mg', 'عدد', 'ضدالتهاب', 'قرص ضدالتهاب و مسکن'),
('آموکسی‌سیلین', 'Amoxicillin', '500mg', 'عدد', 'آنتی‌بیوتیک', 'کپسول آنتی‌بیوتیک'),
('لوزارتان', 'Losartan', '50mg', 'عدد', 'فشار خون', 'قرص کنترل فشار خون'),
('متفورمین', 'Metformin', '500mg', 'عدد', 'دیابت', 'قرص کنترل قند خون'),
('آتورواستاتین', 'Atorvastatin', '20mg', 'عدد', 'چربی خون', 'قرص کاهش کلسترول'),
('اومپرازول', 'Omeprazole', '20mg', 'عدد', 'گوارش', 'کپسول محافظ معده'),
('سالبوتامول', 'Salbutamol', '100mcg', 'عدد', 'تنفسی', 'اسپری آسم'),
('سیتالوپرام', 'Citalopram', '20mg', 'عدد', 'روانپزشکی', 'قرص ضد افسردگی'),
('دیکلوفناک', 'Diclofenac', '50mg', 'عدد', 'ضدالتهاب', 'قرص ضدالتهاب موضعی');