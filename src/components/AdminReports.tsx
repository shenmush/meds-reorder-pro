import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Building2, 
  Calendar, 
  Download, 
  Store,
  ShoppingCart,
  DollarSign,
  TrendingDown,
  Pill
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface PharmacyAnalytics {
  pharmacy_id: string;
  pharmacy_name: string;
  total_orders: number;
  total_items: number;
  unique_products: number;
  last_order: string;
  products: Array<{
    name: string;
    quantity: number;
    company: string;
    category: string;
  }>;
  companies: Array<{
    name: string;
    total_quantity: number;
    product_count: number;
  }>;
  monthly_trends: Array<{
    month: string;
    orders: number;
    items: number;
  }>;
}

interface CompanyAnalytics {
  company_name: string;
  total_orders: number;
  total_quantity: number;
  unique_products: number;
  products: Array<{
    name: string;
    quantity: number;
    pharmacy_count: number;
  }>;
  pharmacies: Array<{
    name: string;
    orders: number;
    quantity: number;
  }>;
  monthly_trends: Array<{
    month: string;
    quantity: number;
    orders: number;
  }>;
}

interface DrugAnalytics {
  drug_id: string;
  drug_name: string;
  drug_category: string;
  company_name: string;
  total_orders: number;
  total_quantity: number;
  pharmacy_count: number;
  pharmacies: Array<{
    name: string;
    quantity: number;
    orders: number;
  }>;
  monthly_trends: Array<{
    month: string;
    quantity: number;
    orders: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdminReports = () => {
  const [pharmacyAnalytics, setPharmacyAnalytics] = useState<PharmacyAnalytics[]>([]);
  const [companyAnalytics, setCompanyAnalytics] = useState<CompanyAnalytics[]>([]);
  const [drugAnalytics, setDrugAnalytics] = useState<DrugAnalytics[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedDrug, setSelectedDrug] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('month');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    generateAnalytics();
  }, [dateFilter]);

  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();

    switch (dateFilter) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return { startDate: startDate.toISOString(), endDate: now.toISOString() };
  };

  const generateAnalytics = async () => {
    setLoading(true);
    const { startDate, endDate } = getDateRange();

    try {
      await Promise.all([
        generatePharmacyAnalytics(startDate, endDate),
        generateCompanyAnalytics(startDate, endDate),
        generateDrugAnalytics(startDate, endDate)
      ]);
    } catch (error) {
      console.error('Error generating analytics:', error);
      toast({
        title: "خطا",
        description: "خطا در تولید تحلیل‌ها",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePharmacyAnalytics = async (startDate: string, endDate: string) => {
    // Get detailed pharmacy data with orders and items
    const { data: orderData, error } = await supabase
      .from('orders')
      .select(`
        id,
        total_items,
        created_at,
        pharmacies!inner(id, name),
        order_items(
          quantity,
          drug_id
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    // Get drug details
    const [chemicalData, medicalData, naturalData] = await Promise.all([
      supabase.from('chemical_drugs').select('id, full_brand_name, license_owner_company_name'),
      supabase.from('medical_supplies').select('id, title, license_owner_company_name'),
      supabase.from('natural_products').select('id, full_en_brand_name, license_owner_name')
    ]);

    const drugMap = new Map();
    chemicalData.data?.forEach(d => drugMap.set(d.id, { name: d.full_brand_name, company: d.license_owner_company_name, category: 'دارو شیمیایی' }));
    medicalData.data?.forEach(d => drugMap.set(d.id, { name: d.title, company: d.license_owner_company_name, category: 'تجهیزات پزشکی' }));
    naturalData.data?.forEach(d => drugMap.set(d.id, { name: d.full_en_brand_name, company: d.license_owner_name, category: 'محصولات طبیعی' }));

    // Process pharmacy analytics
    const pharmacyMap = new Map<string, PharmacyAnalytics>();

    orderData?.forEach(order => {
      const pharmacyId = order.pharmacies.id;
      const pharmacyName = order.pharmacies.name;

      if (!pharmacyMap.has(pharmacyId)) {
        pharmacyMap.set(pharmacyId, {
          pharmacy_id: pharmacyId,
          pharmacy_name: pharmacyName,
          total_orders: 0,
          total_items: 0,
          unique_products: 0,
          last_order: order.created_at,
          products: [],
          companies: [],
          monthly_trends: []
        });
      }

      const pharmacy = pharmacyMap.get(pharmacyId)!;
      pharmacy.total_orders += 1;
      pharmacy.total_items += order.total_items;
      
      if (new Date(order.created_at) > new Date(pharmacy.last_order)) {
        pharmacy.last_order = order.created_at;
      }

      // Process order items
      order.order_items?.forEach(item => {
        const drugInfo = drugMap.get(item.drug_id);
        if (drugInfo) {
          const existingProduct = pharmacy.products.find(p => p.name === drugInfo.name);
          if (existingProduct) {
            existingProduct.quantity += item.quantity;
          } else {
            pharmacy.products.push({
              name: drugInfo.name,
              quantity: item.quantity,
              company: drugInfo.company || 'نامشخص',
              category: drugInfo.category
            });
          }

          // Process companies
          const existingCompany = pharmacy.companies.find(c => c.name === (drugInfo.company || 'نامشخص'));
          if (existingCompany) {
            existingCompany.total_quantity += item.quantity;
            existingCompany.product_count += 1;
          } else {
            pharmacy.companies.push({
              name: drugInfo.company || 'نامشخص',
              total_quantity: item.quantity,
              product_count: 1
            });
          }
        }
      });
    });

    // Update unique products count
    pharmacyMap.forEach(pharmacy => {
      pharmacy.unique_products = pharmacy.products.length;
      pharmacy.products.sort((a, b) => b.quantity - a.quantity);
      pharmacy.companies.sort((a, b) => b.total_quantity - a.total_quantity);
    });

    setPharmacyAnalytics(Array.from(pharmacyMap.values()).sort((a, b) => b.total_orders - a.total_orders));
  };

  const generateCompanyAnalytics = async (startDate: string, endDate: string) => {
    // Similar logic for company analytics
    const { data: orderData, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        pharmacies!inner(id, name),
        order_items(
          quantity,
          drug_id
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    // Get drug details
    const [chemicalData, medicalData, naturalData] = await Promise.all([
      supabase.from('chemical_drugs').select('id, full_brand_name, license_owner_company_name'),
      supabase.from('medical_supplies').select('id, title, license_owner_company_name'),
      supabase.from('natural_products').select('id, full_en_brand_name, license_owner_name')
    ]);

    const drugMap = new Map();
    chemicalData.data?.forEach(d => drugMap.set(d.id, { name: d.full_brand_name, company: d.license_owner_company_name }));
    medicalData.data?.forEach(d => drugMap.set(d.id, { name: d.title, company: d.license_owner_company_name }));
    naturalData.data?.forEach(d => drugMap.set(d.id, { name: d.full_en_brand_name, company: d.license_owner_name }));

    // Process company analytics
    const companyMap = new Map<string, CompanyAnalytics>();

    orderData?.forEach(order => {
      order.order_items?.forEach(item => {
        const drugInfo = drugMap.get(item.drug_id);
        const companyName = drugInfo?.company || 'نامشخص';

        if (!companyMap.has(companyName)) {
          companyMap.set(companyName, {
            company_name: companyName,
            total_orders: 0,
            total_quantity: 0,
            unique_products: 0,
            products: [],
            pharmacies: [],
            monthly_trends: []
          });
        }

        const company = companyMap.get(companyName)!;
        company.total_orders += 1;
        company.total_quantity += item.quantity;

        if (drugInfo) {
          const existingProduct = company.products.find(p => p.name === drugInfo.name);
          if (existingProduct) {
            existingProduct.quantity += item.quantity;
          } else {
            company.products.push({
              name: drugInfo.name,
              quantity: item.quantity,
              pharmacy_count: 1
            });
          }
        }

        const existingPharmacy = company.pharmacies.find(p => p.name === order.pharmacies.name);
        if (existingPharmacy) {
          existingPharmacy.orders += 1;
          existingPharmacy.quantity += item.quantity;
        } else {
          company.pharmacies.push({
            name: order.pharmacies.name,
            orders: 1,
            quantity: item.quantity
          });
        }
      });
    });

    // Update unique products count
    companyMap.forEach(company => {
      company.unique_products = company.products.length;
      company.products.sort((a, b) => b.quantity - a.quantity);
      company.pharmacies.sort((a, b) => b.quantity - a.quantity);
    });

    setCompanyAnalytics(Array.from(companyMap.values()).sort((a, b) => b.total_quantity - a.total_quantity));
  };

  const generateDrugAnalytics = async (startDate: string, endDate: string) => {
    // Get detailed drug data with orders and pharmacies
    const { data: orderData, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        pharmacies!inner(id, name),
        order_items(
          quantity,
          drug_id
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    // Get drug details
    const [chemicalData, medicalData, naturalData] = await Promise.all([
      supabase.from('chemical_drugs').select('id, full_brand_name, license_owner_company_name'),
      supabase.from('medical_supplies').select('id, title, license_owner_company_name'),
      supabase.from('natural_products').select('id, full_en_brand_name, license_owner_name')
    ]);

    const drugMap = new Map();
    chemicalData.data?.forEach(d => drugMap.set(d.id, { name: d.full_brand_name, company: d.license_owner_company_name, category: 'دارو شیمیایی' }));
    medicalData.data?.forEach(d => drugMap.set(d.id, { name: d.title, company: d.license_owner_company_name, category: 'تجهیزات پزشکی' }));
    naturalData.data?.forEach(d => drugMap.set(d.id, { name: d.full_en_brand_name, company: d.license_owner_name, category: 'محصولات طبیعی' }));

    // Process drug analytics
    const drugAnalyticsMap = new Map<string, DrugAnalytics>();

    orderData?.forEach(order => {
      order.order_items?.forEach(item => {
        const drugInfo = drugMap.get(item.drug_id);
        if (drugInfo) {
          const drugId = item.drug_id;

          if (!drugAnalyticsMap.has(drugId)) {
            drugAnalyticsMap.set(drugId, {
              drug_id: drugId,
              drug_name: drugInfo.name,
              drug_category: drugInfo.category,
              company_name: drugInfo.company || 'نامشخص',
              total_orders: 0,
              total_quantity: 0,
              pharmacy_count: 0,
              pharmacies: [],
              monthly_trends: []
            });
          }

          const drug = drugAnalyticsMap.get(drugId)!;
          drug.total_orders += 1;
          drug.total_quantity += item.quantity;

          const existingPharmacy = drug.pharmacies.find(p => p.name === order.pharmacies.name);
          if (existingPharmacy) {
            existingPharmacy.orders += 1;
            existingPharmacy.quantity += item.quantity;
          } else {
            drug.pharmacies.push({
              name: order.pharmacies.name,
              orders: 1,
              quantity: item.quantity
            });
          }
        }
      });
    });

    // Update pharmacy count
    drugAnalyticsMap.forEach(drug => {
      drug.pharmacy_count = drug.pharmacies.length;
      drug.pharmacies.sort((a, b) => b.quantity - a.quantity);
    });

    setDrugAnalytics(Array.from(drugAnalyticsMap.values()).sort((a, b) => b.total_quantity - a.total_quantity));
  };

  const exportToCSV = (type: 'pharmacy' | 'company' | 'drug') => {
    let csvContent = "";
    let filename = "";

    if (type === 'pharmacy') {
      csvContent = "نام داروخانه,تعداد سفارشات,تعداد اقلام,محصولات منحصر به فرد,آخرین سفارش\n";
      pharmacyAnalytics.forEach(pharmacy => {
        csvContent += `"${pharmacy.pharmacy_name}","${pharmacy.total_orders}","${pharmacy.total_items}","${pharmacy.unique_products}","${pharmacy.last_order}"\n`;
      });
      filename = `pharmacy_analytics_${dateFilter}.csv`;
    } else if (type === 'company') {
      csvContent = "نام شرکت,تعداد سفارشات,مقدار کل,محصولات منحصر به فرد\n";
      companyAnalytics.forEach(company => {
        csvContent += `"${company.company_name}","${company.total_orders}","${company.total_quantity}","${company.unique_products}"\n`;
      });
      filename = `company_analytics_${dateFilter}.csv`;
    } else {
      csvContent = "نام دارو,دسته‌بندی,شرکت سازنده,تعداد سفارشات,مقدار کل,تعداد داروخانه‌ها\n";
      drugAnalytics.forEach(drug => {
        csvContent += `"${drug.drug_name}","${drug.drug_category}","${drug.company_name}","${drug.total_orders}","${drug.total_quantity}","${drug.pharmacy_count}"\n`;
      });
      filename = `drug_analytics_${dateFilter}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "موفقیت",
      description: "گزارش با موفقیت دانلود شد",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const selectedPharmacyData = pharmacyAnalytics.find(p => p.pharmacy_id === selectedPharmacy);
  const selectedCompanyData = companyAnalytics.find(c => c.company_name === selectedCompany);
  const selectedDrugData = drugAnalytics.find(d => d.drug_id === selectedDrug);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">تحلیل‌های جامع گزارشات</h2>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="بازه زمانی" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">هفته گذشته</SelectItem>
            <SelectItem value="month">ماه گذشته</SelectItem>
            <SelectItem value="3months">سه ماه گذشته</SelectItem>
            <SelectItem value="6months">شش ماه گذشته</SelectItem>
            <SelectItem value="year">سال گذشته</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="pharmacy" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pharmacy" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            بر اساس داروخانه
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            بر اساس شرکت
          </TabsTrigger>
          <TabsTrigger value="drug" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            بر اساس دارو
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pharmacy" className="space-y-6">
          <div className="flex items-center justify-between">
            <Select value={selectedPharmacy} onValueChange={setSelectedPharmacy}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="انتخاب داروخانه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه داروخانه‌ها</SelectItem>
                {pharmacyAnalytics.map(pharmacy => (
                  <SelectItem key={pharmacy.pharmacy_id} value={pharmacy.pharmacy_id}>
                    {pharmacy.pharmacy_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={() => exportToCSV('pharmacy')} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              دانلود گزارش داروخانه‌ها
            </Button>
          </div>

          {selectedPharmacy === 'all' ? (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">کل داروخانه‌ها</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{pharmacyAnalytics.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">کل سفارشات</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {pharmacyAnalytics.reduce((sum, p) => sum + p.total_orders, 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">کل اقلام</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {pharmacyAnalytics.reduce((sum, p) => sum + p.total_items, 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">میانگین سفارش</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {pharmacyAnalytics.length > 0 
                        ? Math.round(pharmacyAnalytics.reduce((sum, p) => sum + p.total_items, 0) / pharmacyAnalytics.reduce((sum, p) => sum + p.total_orders, 0))
                        : 0
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>عملکرد داروخانه‌ها - تعداد سفارشات</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pharmacyAnalytics.slice(0, 10)} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          dataKey="pharmacy_name" 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          fontSize={12}
                          interval={0}
                        />
                        <YAxis fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="total_orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {pharmacyAnalytics.map((pharmacy) => (
                  <Card key={pharmacy.pharmacy_id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium flex items-center gap-2">
                            <Store className="h-4 w-4 text-primary" />
                            {pharmacy.pharmacy_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            آخرین سفارش: {formatDate(pharmacy.last_order)}
                          </p>
                        </div>
                        <div className="flex gap-6">
                          <div className="text-center">
                            <div className="font-bold">{pharmacy.total_orders}</div>
                            <div className="text-xs text-muted-foreground">سفارش</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{pharmacy.total_items}</div>
                            <div className="text-xs text-muted-foreground">قلم</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{pharmacy.unique_products}</div>
                            <div className="text-xs text-muted-foreground">محصول</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : selectedPharmacyData ? (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">تعداد سفارشات</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{selectedPharmacyData.total_orders}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">کل اقلام</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{selectedPharmacyData.total_items}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">محصولات منحصر به فرد</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{selectedPharmacyData.unique_products}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">آخرین سفارش</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">{formatDate(selectedPharmacyData.last_order)}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>محبوب‌ترین محصولات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPharmacyData.products.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{product.name}</p>
                            <div className="flex gap-2">
                              <Badge variant="outline">{product.company}</Badge>
                              <Badge variant="secondary">{product.category}</Badge>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-bold">{product.quantity}</div>
                            <div className="text-xs text-muted-foreground">واحد</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>شرکت‌های برتر</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPharmacyData.companies.slice(0, 5).map((company, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{company.name}</p>
                            <p className="text-xs text-muted-foreground">{company.product_count} محصول</p>
                          </div>
                          <div className="text-left">
                            <div className="font-bold">{company.total_quantity}</div>
                            <div className="text-xs text-muted-foreground">واحد</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <div className="flex items-center justify-between">
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="انتخاب شرکت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه شرکت‌ها</SelectItem>
                {companyAnalytics.map(company => (
                  <SelectItem key={company.company_name} value={company.company_name}>
                    {company.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={() => exportToCSV('company')} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              دانلود گزارش شرکت‌ها
            </Button>
          </div>

          {selectedCompany === 'all' ? (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">کل شرکت‌ها</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{companyAnalytics.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">کل سفارشات</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {companyAnalytics.reduce((sum, c) => sum + c.total_orders, 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">کل مقدار</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {companyAnalytics.reduce((sum, c) => sum + c.total_quantity, 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">میانگین محصولات</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {companyAnalytics.length > 0 
                        ? Math.round(companyAnalytics.reduce((sum, c) => sum + c.unique_products, 0) / companyAnalytics.length)
                        : 0
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>عملکرد شرکت‌ها - کل مقدار</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={companyAnalytics.slice(0, 10)} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          dataKey="company_name" 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          fontSize={12}
                          interval={0}
                        />
                        <YAxis fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="total_quantity" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {companyAnalytics.map((company) => (
                  <Card key={company.company_name} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary" />
                            {company.company_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {company.unique_products} محصول منحصر به فرد
                          </p>
                        </div>
                        <div className="flex gap-6">
                          <div className="text-center">
                            <div className="font-bold">{company.total_orders}</div>
                            <div className="text-xs text-muted-foreground">سفارش</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{company.total_quantity}</div>
                            <div className="text-xs text-muted-foreground">واحد</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{company.pharmacies.length}</div>
                            <div className="text-xs text-muted-foreground">داروخانه</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : selectedCompanyData ? (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">تعداد سفارشات</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{selectedCompanyData.total_orders}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">کل مقدار</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{selectedCompanyData.total_quantity}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">محصولات منحصر به فرد</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{selectedCompanyData.unique_products}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">تعداد داروخانه‌ها</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{selectedCompanyData.pharmacies.length}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>محبوب‌ترین محصولات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedCompanyData.products.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.pharmacy_count} داروخانه</p>
                          </div>
                          <div className="text-left">
                            <div className="font-bold">{product.quantity}</div>
                            <div className="text-xs text-muted-foreground">واحد</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>داروخانه‌های برتر</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedCompanyData.pharmacies.slice(0, 5).map((pharmacy, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="font-medium">{pharmacy.name}</p>
                            <p className="text-xs text-muted-foreground">{pharmacy.orders} سفارش</p>
                          </div>
                          <div className="text-left">
                            <div className="font-bold">{pharmacy.quantity}</div>
                            <div className="text-xs text-muted-foreground">واحد</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="drug" className="space-y-6">
          <div className="flex items-center justify-between">
            <Select value={selectedDrug} onValueChange={setSelectedDrug}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="انتخاب دارو" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه داروها</SelectItem>
                {drugAnalytics.map(drug => (
                  <SelectItem key={drug.drug_id} value={drug.drug_id}>
                    {drug.drug_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={() => exportToCSV('drug')} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              دانلود گزارش داروها
            </Button>
          </div>

          {selectedDrug === 'all' ? (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">کل داروها</CardTitle>
                    <Pill className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{drugAnalytics.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">کل سفارشات</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {drugAnalytics.reduce((sum, d) => sum + d.total_orders, 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">کل مقدار</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {drugAnalytics.reduce((sum, d) => sum + d.total_quantity, 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">میانگین تقاضا</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">
                      {drugAnalytics.length > 0 
                        ? Math.round(drugAnalytics.reduce((sum, d) => sum + d.total_quantity, 0) / drugAnalytics.length)
                        : 0
                      }
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>پرتقاضاترین داروها</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={drugAnalytics.slice(0, 10)} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          dataKey="drug_name" 
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          fontSize={12}
                          interval={0}
                        />
                        <YAxis fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="total_quantity" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                {drugAnalytics.map((drug) => (
                  <Card key={drug.drug_id} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-medium flex items-center gap-2">
                            <Pill className="h-4 w-4 text-primary" />
                            {drug.drug_name}
                          </h3>
                          <div className="flex gap-2">
                            <Badge variant="outline">{drug.company_name}</Badge>
                            <Badge variant="secondary">{drug.drug_category}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-6">
                          <div className="text-center">
                            <div className="font-bold">{drug.total_orders}</div>
                            <div className="text-xs text-muted-foreground">سفارش</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{drug.total_quantity}</div>
                            <div className="text-xs text-muted-foreground">واحد</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{drug.pharmacy_count}</div>
                            <div className="text-xs text-muted-foreground">داروخانه</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : selectedDrugData ? (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">تعداد سفارشات</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{selectedDrugData.total_orders}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">کل مقدار</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{selectedDrugData.total_quantity}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">تعداد داروخانه‌ها</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{selectedDrugData.pharmacy_count}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">دسته‌بندی</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">{selectedDrugData.drug_category}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>داروخانه‌های مصرف‌کننده</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedDrugData.pharmacies.map((pharmacy, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{pharmacy.name}</p>
                          <p className="text-xs text-muted-foreground">{pharmacy.orders} سفارش</p>
                        </div>
                        <div className="text-left">
                          <div className="font-bold">{pharmacy.quantity}</div>
                          <div className="text-xs text-muted-foreground">واحد</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;