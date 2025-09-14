-- Create barman_orders table to track orders placed by barman manager
CREATE TABLE public.barman_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drug_id UUID NOT NULL,
  drug_name TEXT NOT NULL,
  drug_type TEXT NOT NULL,
  company_name TEXT NOT NULL,
  quantity_ordered INTEGER NOT NULL,
  bonus_percentage DECIMAL(5,2) DEFAULT 0,
  bonus_quantity INTEGER DEFAULT 0,
  total_received_quantity INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT,
  notes TEXT,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  irc TEXT,
  gtin TEXT,
  erx_code TEXT
);

-- Enable RLS
ALTER TABLE public.barman_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for barman_orders
CREATE POLICY "Barman managers can manage barman orders" 
ON public.barman_orders 
FOR ALL
USING (has_role(auth.uid(), 'barman_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'barman_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Barman staff can view barman orders" 
ON public.barman_orders 
FOR SELECT 
USING (has_role(auth.uid(), 'barman_staff'::app_role) OR has_role(auth.uid(), 'barman_accountant'::app_role) OR has_role(auth.uid(), 'barman_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_barman_orders_updated_at
BEFORE UPDATE ON public.barman_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add status field to track consolidated drug statuses
CREATE TABLE public.consolidated_drug_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drug_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for consolidated_drug_status
ALTER TABLE public.consolidated_drug_status ENABLE ROW LEVEL SECURITY;

-- Create policies for consolidated_drug_status
CREATE POLICY "Barman managers can manage consolidated drug status" 
ON public.consolidated_drug_status 
FOR ALL
USING (has_role(auth.uid(), 'barman_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'barman_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Barman staff can view consolidated drug status" 
ON public.consolidated_drug_status 
FOR SELECT 
USING (has_role(auth.uid(), 'barman_staff'::app_role) OR has_role(auth.uid(), 'barman_accountant'::app_role) OR has_role(auth.uid(), 'barman_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_consolidated_drug_status_updated_at
BEFORE UPDATE ON public.consolidated_drug_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();