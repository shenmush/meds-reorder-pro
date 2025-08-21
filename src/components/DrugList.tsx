import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pill, Plus, Minus, ShoppingCart, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UnifiedDrug {
  id: string;
  name: string;
  company: string;
  packageCount?: number;
  action?: string;
  irc: string;
  type: 'chemical' | 'medical' | 'natural';
  erxCode?: string;
  gtin?: string;
  genericCode?: string;
  atcCode?: string;
}

interface Pharmacy {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  license_number?: string;
}

interface DrugListProps {
  pharmacy: Pharmacy | null;
}

interface CartItem {
  drugId: string;
  drugName: string;
  company: string;
  quantity: number;
  type: 'chemical' | 'medical' | 'natural';
}

const DrugList: React.FC<DrugListProps> = ({ pharmacy }) => {
  const [chemicalDrugs, setChemicalDrugs] = useState<UnifiedDrug[]>([]);
  const [medicalSupplies, setMedicalSupplies] = useState<UnifiedDrug[]>([]);
  const [naturalProducts, setNaturalProducts] = useState<UnifiedDrug[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      const [chemicalResult, medicalResult, naturalResult] = await Promise.all([
        supabase.from('chemical_drugs').select('*').eq('is_active', true),
        supabase.from('medical_supplies').select('*').eq('is_active', true),
        supabase.from('natural_products').select('*').eq('is_active', true)
      ]);

      const chemical = (chemicalResult.data || []).map(drug => ({
        id: drug.id,
        name: drug.full_brand_name,
        company: drug.license_owner_company_name || 'نامشخص',
        packageCount: drug.package_count,
        action: drug.action,
        irc: drug.irc,
        type: 'chemical' as const,
        erxCode: drug.erx_code,
        gtin: drug.gtin,
        genericCode: drug.generic_code
      }));

      const medical = (medicalResult.data || []).map(drug => ({
        id: drug.id,
        name: drug.title,
        company: drug.license_owner_company_name || 'نامشخص',
        packageCount: drug.package_count,
        action: drug.action,
        irc: drug.irc,
        type: 'medical' as const,
        erxCode: drug.erx_code,
        gtin: drug.gtin
      }));

      const natural = (naturalResult.data || []).map(drug => ({
        id: drug.id,
        name: drug.full_en_brand_name,
        company: drug.license_owner_name || 'نامشخص',
        packageCount: drug.package_count,
        action: drug.action,
        irc: drug.irc,
        type: 'natural' as const,
        erxCode: drug.erx_code,
        gtin: drug.gtin,
        atcCode: drug.atc_code
      }));

      setChemicalDrugs(chemical);
      setMedicalSupplies(medical);
      setNaturalProducts(natural);
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری فهرست داروها",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAllDrugs = () => [...chemicalDrugs, ...medicalSupplies, ...naturalProducts];

  const getCurrentDrugs = () => {
    switch (activeTab) {
      case 'chemical':
        return chemicalDrugs;
      case 'medical':
        return medicalSupplies;
      case 'natural':
        return naturalProducts;
      default:
        return getAllDrugs();
    }
  };

  const filteredDrugs = getCurrentDrugs().filter(drug => {
    const searchLower = searchTerm.toLowerCase();
    return (
      drug.name?.toLowerCase().includes(searchLower) ||
      drug.company?.toLowerCase().includes(searchLower) ||
      drug.irc?.toLowerCase().includes(searchLower) ||
      drug.erxCode?.toLowerCase().includes(searchLower) ||
      drug.gtin?.toLowerCase().includes(searchLower) ||
      drug.genericCode?.toLowerCase().includes(searchLower) ||
      drug.atcCode?.toLowerCase().includes(searchLower)
    );
  });

  const addToCart = (drug: UnifiedDrug) => {
    setCart(prev => {
      const existing = prev.find(item => item.drugId === drug.id);
      if (existing) {
        return prev.map(item =>
          item.drugId === drug.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { 
        drugId: drug.id, 
        drugName: drug.name, 
        company: drug.company,
        quantity: 1, 
        type: drug.type 
      }];
    });
  };

  const updateQuantity = (drugId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.drugId !== drugId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.drugId === drugId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const getCartQuantity = (drugId: string) => {
    const item = cart.find(item => item.drugId === drugId);
    return item ? item.quantity : 0;
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const submitOrder = async () => {
    if (!pharmacy) {
      toast({
        title: "خطا",
        description: "لطفاً ابتدا اطلاعات داروخانه را تکمیل کنید",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "سبد خرید خالی",
        description: "لطفاً حداقل یک دارو انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          pharmacy_id: pharmacy.id,
          total_items: getTotalItems(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        drug_id: item.drugId,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setCart([]);
      
      toast({
        title: "سفارش ثبت شد",
        description: `سفارش شما با ${getTotalItems()} قلم دارو ثبت شد`,
      });
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در ثبت سفارش",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'chemical':
        return 'شیمیایی';
      case 'medical':
        return 'ملزومات';
      case 'natural':
        return 'طبیعی';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Pill className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">در حال بارگذاری فهرست داروها...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Cart Summary */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="جستجو در داروها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 text-right"
          />
        </div>
        
        {cart.length > 0 && (
          <Card className="w-full sm:w-auto">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">سبد خرید</p>
                  <p className="font-bold">{getTotalItems()} قلم</p>
                </div>
                <Button 
                  onClick={submitOrder}
                  disabled={submitting}
                  className="gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  ثبت سفارش
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">همه</TabsTrigger>
          <TabsTrigger value="chemical">داروهای شیمیایی</TabsTrigger>
          <TabsTrigger value="medical">ملزومات پزشکی</TabsTrigger>
          <TabsTrigger value="natural">فرآورده های طبیعی</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">
                {activeTab === 'all' && 'تمام محصولات'}
                {activeTab === 'chemical' && 'داروهای شیمیایی'}
                {activeTab === 'medical' && 'ملزومات پزشکی'}
                {activeTab === 'natural' && 'فرآورده های طبیعی'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">نام محصول</TableHead>
                    <TableHead className="text-right">شرکت تولیدکننده</TableHead>
                    <TableHead className="text-right">نوع</TableHead>
                    <TableHead className="text-right">کد IRC</TableHead>
                    <TableHead className="text-right">تعداد بسته</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrugs.map((drug) => {
                    const quantity = getCartQuantity(drug.id);
                    
                    return (
                      <TableRow key={drug.id}>
                        <TableCell className="text-right font-medium">
                          {drug.name}
                          {drug.genericCode && (
                            <div className="text-sm text-muted-foreground">
                              کد ژنریک: {drug.genericCode}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{drug.company}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="text-xs">
                            {getTypeLabel(drug.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {drug.irc}
                        </TableCell>
                        <TableCell className="text-right">
                          {drug.packageCount || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {quantity > 0 ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(drug.id, quantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="min-w-[2rem] text-center font-bold">
                                {quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(drug.id, quantity + 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => addToCart(drug)}
                              className="gap-2"
                            >
                              <Plus className="h-3 w-3" />
                              افزودن
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredDrugs.length === 0 && (
                <div className="py-8 text-center">
                  <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'محصول مورد نظر یافت نشد' : 'محصولی در دسترس نیست'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DrugList;