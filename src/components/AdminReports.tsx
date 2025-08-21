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
  TrendingDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
// Fixed Pharmacy import issue - using Store instead
import { useToast } from '@/hooks/use-toast';

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AdminReports = () => {
  const [pharmacyAnalytics, setPharmacyAnalytics] = useState<PharmacyAnalytics[]>([]);
  const [companyAnalytics, setCompanyAnalytics] = useState<CompanyAnalytics[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('month');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
        generateCompanyAnalytics(startDate, endDate)
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

  const exportToCSV = (type: 'pharmacy' | 'company') => {
    let csvContent = "";
    let filename = "";

    if (type === 'pharmacy') {
      csvContent = "نام داروخانه,تعداد سفارشات,تعداد اقلام,محصولات منحصر به فرد,آخرین سفارش\n";
      pharmacyAnalytics.forEach(pharmacy => {
        csvContent += `"${pharmacy.pharmacy_name}","${pharmacy.total_orders}","${pharmacy.total_items}","${pharmacy.unique_products}","${pharmacy.last_order}"\n`;
      });
      filename = `pharmacy_analytics_${dateFilter}.csv`;
    } else {
      csvContent = "نام شرکت,تعداد سفارشات,مقدار کل,محصولات منحصر به فرد\n";
      companyAnalytics.forEach(company => {
        csvContent += `"${company.company_name}","${company.total_orders}","${company.total_quantity}","${company.unique_products}"\n`;
      });
      filename = `company_analytics_${dateFilter}.csv`;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">تحلیل‌های جامع گزارشات</h2>
        
        <div className="flex items-center gap-2">
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
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="pharmacy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pharmacy" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              تحلیل بر اساس داروخانه
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              تحلیل بر اساس شرکت
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pharmacy" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
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
              </div>
              <Button onClick={() => exportToCSV('pharmacy')} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                دانلود گزارش داروخانه‌ها
              </Button>
            </div>

            {selectedPharmacy === 'all' ? (
              // Overview of all pharmacies
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">کل داروخانه‌ها</CardTitle>
                      <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{pharmacyAnalytics.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">کل سفارشات</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
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
                      <div className="text-2xl font-bold">
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
                      <div className="text-2xl font-bold">
                        {pharmacyAnalytics.length > 0 ? 
                          Math.round(pharmacyAnalytics.reduce((sum, p) => sum + p.total_orders, 0) / pharmacyAnalytics.length) 
                          : 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Pharmacy performance chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>عملکرد داروخانه‌ها - تعداد سفارشات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pharmacyAnalytics.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="pharmacy_name" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="total_orders" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* List of pharmacies */}
                <div className="grid gap-4">
                  {pharmacyAnalytics.map((pharmacy) => (
                    <Card key={pharmacy.pharmacy_id} className="hover:shadow-elegant transition-all duration-300">
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
                          <div className="text-left space-y-1">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="font-bold">{pharmacy.total_orders}</div>
                                <div className="text-xs text-muted-foreground">سفارش</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold">{pharmacy.total_items}</div>
                                <div className="text-xs text-muted-foreground">اقلام</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold">{pharmacy.unique_products}</div>
                                <div className="text-xs text-muted-foreground">محصول</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : selectedPharmacyData ? (
              // Detailed pharmacy analysis
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-primary" />
                      {selectedPharmacyData.pharmacy_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedPharmacyData.total_orders}</div>
                        <div className="text-sm text-muted-foreground">کل سفارشات</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedPharmacyData.total_items}</div>
                        <div className="text-sm text-muted-foreground">کل اقلام</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedPharmacyData.unique_products}</div>
                        <div className="text-sm text-muted-foreground">محصولات منحصر به فرد</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{formatDate(selectedPharmacyData.last_order)}</div>
                        <div className="text-sm text-muted-foreground">آخرین سفارش</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Top products */}
                  <Card>
                    <CardHeader>
                      <CardTitle>محصولات پرسفارش</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{}} className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={selectedPharmacyData.products.slice(0, 6)}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="quantity"
                              label={(entry) => entry.name}
                            >
                              {selectedPharmacyData.products.slice(0, 6).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Top companies */}
                  <Card>
                    <CardHeader>
                      <CardTitle>شرکت‌های برتر</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedPharmacyData.companies.slice(0, 5).map((company, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{company.name}</div>
                              <div className="text-sm text-muted-foreground">{company.product_count} محصول</div>
                            </div>
                            <Badge variant="outline">{company.total_quantity} عدد</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Products list */}
                <Card>
                  <CardHeader>
                    <CardTitle>فهرست محصولات سفارش داده شده</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedPharmacyData.products.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {product.company} • {product.category}
                            </div>
                          </div>
                          <Badge>{product.quantity} عدد</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
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
              </div>
              <Button onClick={() => exportToCSV('company')} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                دانلود گزارش شرکت‌ها
              </Button>
            </div>

            {selectedCompany === 'all' ? (
              // Overview of all companies
              <div className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">کل شرکت‌ها</CardTitle>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{companyAnalytics.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">کل سفارشات</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
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
                      <div className="text-2xl font-bold">
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
                      <div className="text-2xl font-bold">
                        {companyAnalytics.length > 0 ? 
                          Math.round(companyAnalytics.reduce((sum, c) => sum + c.unique_products, 0) / companyAnalytics.length) 
                          : 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Company performance chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>عملکرد شرکت‌ها - مقدار کل سفارشات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{}} className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={companyAnalytics.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="company_name" 
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="total_quantity" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* List of companies */}
                <div className="grid gap-4">
                  {companyAnalytics.map((company, index) => (
                    <Card key={index} className="hover:shadow-elegant transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h3 className="font-medium flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-primary" />
                              {company.company_name}
                            </h3>
                          </div>
                          <div className="text-left space-y-1">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="font-bold">{company.total_orders}</div>
                                <div className="text-xs text-muted-foreground">سفارش</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold">{company.total_quantity}</div>
                                <div className="text-xs text-muted-foreground">مقدار</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold">{company.unique_products}</div>
                                <div className="text-xs text-muted-foreground">محصول</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : selectedCompanyData ? (
              // Detailed company analysis
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      {selectedCompanyData.company_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedCompanyData.total_orders}</div>
                        <div className="text-sm text-muted-foreground">کل سفارشات</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedCompanyData.total_quantity}</div>
                        <div className="text-sm text-muted-foreground">کل مقدار</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedCompanyData.unique_products}</div>
                        <div className="text-sm text-muted-foreground">محصولات منحصر به فرد</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{selectedCompanyData.pharmacies.length}</div>
                        <div className="text-sm text-muted-foreground">داروخانه مشتری</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Top products */}
                  <Card>
                    <CardHeader>
                      <CardTitle>محصولات پرفروش</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedCompanyData.products.slice(0, 5).map((product, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.pharmacy_count} داروخانه</div>
                            </div>
                            <Badge variant="outline">{product.quantity} عدد</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top pharmacies */}
                  <Card>
                    <CardHeader>
                      <CardTitle>داروخانه‌های برتر</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedCompanyData.pharmacies.slice(0, 5).map((pharmacy, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{pharmacy.name}</div>
                              <div className="text-sm text-muted-foreground">{pharmacy.orders} سفارش</div>
                            </div>
                            <Badge variant="outline">{pharmacy.quantity} عدد</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Products list */}
                <Card>
                  <CardHeader>
                    <CardTitle>فهرست کامل محصولات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedCompanyData.products.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              سفارش از {product.pharmacy_count} داروخانه
                            </div>
                          </div>
                          <Badge>{product.quantity} عدد</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminReports;