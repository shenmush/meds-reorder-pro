import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pill, Plus, Minus, ShoppingCart, Search, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const [tempQuantities, setTempQuantities] = useState<Record<string, number>>({});
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({
    name: '',
    company: '',
    type: '',
    irc: '',
    erxCode: '',
    gtin: '',
    packageCount: ''
  });
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
    // Global search
    const globalMatch = !searchTerm || (
      drug.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.irc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.erxCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.gtin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.genericCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.atcCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Column-specific filters
    const nameMatch = !columnFilters.name || drug.name?.toLowerCase().includes(columnFilters.name.toLowerCase());
    const companyMatch = !columnFilters.company || drug.company?.toLowerCase().includes(columnFilters.company.toLowerCase());
    const typeMatch = !columnFilters.type || getTypeLabel(drug.type).toLowerCase().includes(columnFilters.type.toLowerCase());
    const ircMatch = !columnFilters.irc || drug.irc?.toLowerCase().includes(columnFilters.irc.toLowerCase());
    const erxCodeMatch = !columnFilters.erxCode || drug.erxCode?.toLowerCase().includes(columnFilters.erxCode.toLowerCase());
    const gtinMatch = !columnFilters.gtin || drug.gtin?.toLowerCase().includes(columnFilters.gtin.toLowerCase());
    const packageCountMatch = !columnFilters.packageCount || drug.packageCount?.toString().includes(columnFilters.packageCount);

    return globalMatch && nameMatch && companyMatch && typeMatch && ircMatch && erxCodeMatch && gtinMatch && packageCountMatch;
  });

  const updateColumnFilter = (column: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const getTempQuantity = (drugId: string) => {
    return tempQuantities[drugId] || 1;
  };

  const setTempQuantity = (drugId: string, quantity: number) => {
    setTempQuantities(prev => ({
      ...prev,
      [drugId]: Math.max(1, quantity)
    }));
  };

  const addToCartWithQuantity = (drug: UnifiedDrug, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.drugId === drug.id);
      if (existing) {
        return prev.map(item =>
          item.drugId === drug.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { 
        drugId: drug.id, 
        drugName: drug.name, 
        company: drug.company,
        quantity: quantity, 
        type: drug.type 
      }];
    });
    
    // Reset temp quantity after adding
    setTempQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[drug.id];
      return newQuantities;
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
          <div className="flex items-center gap-4">
            <Card className="w-full sm:w-auto">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">سبد خرید</p>
                    <p className="font-bold">{getTotalItems()} قلم</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        مشاهده سبد
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-right">سبد خرید شما</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-right">نام محصول</TableHead>
                              <TableHead className="text-right">شرکت</TableHead>
                              <TableHead className="text-right">تعداد</TableHead>
                              <TableHead className="text-right">عملیات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cart.map((item) => (
                              <TableRow key={item.drugId}>
                                <TableCell className="text-right font-medium">
                                  {item.drugName}
                                </TableCell>
                                <TableCell className="text-right">{item.company}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateQuantity(item.drugId, item.quantity - 1)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="min-w-[2rem] text-center font-bold">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateQuantity(item.drugId, item.quantity + 1)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateQuantity(item.drugId, 0)}
                                  >
                                    حذف
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        <div className="flex justify-end gap-4 pt-4 border-t">
                          <div className="text-right">
                            <p className="text-lg font-bold">مجموع: {getTotalItems()} قلم</p>
                          </div>
                          <Button 
                            onClick={submitOrder}
                            disabled={submitting}
                            className="gap-2"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            ثبت سفارش نهایی
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
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
                    <TableHead className="text-right">کد ERX</TableHead>
                    <TableHead className="text-right">کد GTIN</TableHead>
                    <TableHead className="text-right">تعداد بسته</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                  {/* Column Filters Row */}
                  <TableRow className="bg-muted/50">
                    <TableHead className="p-2">
                      <Input
                        placeholder="جستجو نام..."
                        value={columnFilters.name}
                        onChange={(e) => updateColumnFilter('name', e.target.value)}
                        className="h-8 text-xs text-right"
                      />
                    </TableHead>
                    <TableHead className="p-2">
                      <Input
                        placeholder="جستجو شرکت..."
                        value={columnFilters.company}
                        onChange={(e) => updateColumnFilter('company', e.target.value)}
                        className="h-8 text-xs text-right"
                      />
                    </TableHead>
                    <TableHead className="p-2">
                      <Input
                        placeholder="جستجو نوع..."
                        value={columnFilters.type}
                        onChange={(e) => updateColumnFilter('type', e.target.value)}
                        className="h-8 text-xs text-right"
                      />
                    </TableHead>
                    <TableHead className="p-2">
                      <Input
                        placeholder="جستجو IRC..."
                        value={columnFilters.irc}
                        onChange={(e) => updateColumnFilter('irc', e.target.value)}
                        className="h-8 text-xs text-right"
                      />
                    </TableHead>
                    <TableHead className="p-2">
                      <Input
                        placeholder="جستجو ERX..."
                        value={columnFilters.erxCode}
                        onChange={(e) => updateColumnFilter('erxCode', e.target.value)}
                        className="h-8 text-xs text-right"
                      />
                    </TableHead>
                    <TableHead className="p-2">
                      <Input
                        placeholder="جستجو GTIN..."
                        value={columnFilters.gtin}
                        onChange={(e) => updateColumnFilter('gtin', e.target.value)}
                        className="h-8 text-xs text-right"
                      />
                    </TableHead>
                    <TableHead className="p-2">
                      <Input
                        placeholder="جستجو تعداد..."
                        value={columnFilters.packageCount}
                        onChange={(e) => updateColumnFilter('packageCount', e.target.value)}
                        className="h-8 text-xs text-right"
                      />
                    </TableHead>
                    <TableHead className="p-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setColumnFilters({
                          name: '',
                          company: '',
                          type: '',
                          irc: '',
                          erxCode: '',
                          gtin: '',
                          packageCount: ''
                        })}
                        className="h-8 text-xs"
                      >
                        پاک کردن
                      </Button>
                    </TableHead>
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
                        <TableCell className="text-right font-mono text-sm">
                          {drug.erxCode || '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {drug.gtin || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {drug.packageCount || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setTempQuantity(drug.id, getTempQuantity(drug.id) - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={getTempQuantity(drug.id)}
                              onChange={(e) => setTempQuantity(drug.id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setTempQuantity(drug.id, getTempQuantity(drug.id) + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => addToCartWithQuantity(drug, getTempQuantity(drug.id))}
                              className="gap-2"
                            >
                              <ShoppingCart className="h-3 w-3" />
                              افزودن
                            </Button>
                          </div>
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