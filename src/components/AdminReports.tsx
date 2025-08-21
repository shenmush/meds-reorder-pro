import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Package, Building2, Calendar, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DrugReport {
  drug_name: string;
  total_quantity: number;
  order_count: number;
  company_name?: string;
  category?: string;
}

interface CompanyReport {
  company_name: string;
  total_orders: number;
  total_quantity: number;
  unique_drugs: number;
}

interface PharmacyReport {
  pharmacy_name: string;
  total_orders: number;
  total_items: number;
  last_order: string;
}

const AdminReports = () => {
  const [drugReports, setDrugReports] = useState<DrugReport[]>([]);
  const [companyReports, setCompanyReports] = useState<CompanyReport[]>([]);
  const [pharmacyReports, setPharmacyReports] = useState<PharmacyReport[]>([]);
  const [dateFilter, setDateFilter] = useState('month');
  const [reportType, setReportType] = useState('drugs');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateReport();
  }, [dateFilter, reportType]);

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

  const generateReport = async () => {
    setLoading(true);
    const { startDate, endDate } = getDateRange();

    try {
      if (reportType === 'drugs') {
        await generateDrugReport(startDate, endDate);
      } else if (reportType === 'companies') {
        await generateCompanyReport(startDate, endDate);
      } else if (reportType === 'pharmacies') {
        await generatePharmacyReport(startDate, endDate);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "خطا",
        description: "خطا در تولید گزارش",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateDrugReport = async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        drug_id,
        orders!inner(created_at)
      `)
      .gte('orders.created_at', startDate)
      .lte('orders.created_at', endDate);

    if (error) throw error;

    // Process drug report data
    const drugMap = new Map<string, DrugReport>();
    
    data?.forEach(item => {
      const drugName = `محصول ${item.drug_id}`;
      const key = drugName;
      
      if (drugMap.has(key)) {
        const existing = drugMap.get(key)!;
        existing.total_quantity += item.quantity;
        existing.order_count += 1;
      } else {
        drugMap.set(key, {
          drug_name: drugName,
          total_quantity: item.quantity,
          order_count: 1,
          company_name: undefined,
          category: undefined
        });
      }
    });

    const sortedDrugs = Array.from(drugMap.values())
      .sort((a, b) => b.total_quantity - a.total_quantity);
    
    setDrugReports(sortedDrugs);
  };

  const generateCompanyReport = async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        quantity,
        drug_id,
        orders!inner(created_at)
      `)
      .gte('orders.created_at', startDate)
      .lte('orders.created_at', endDate);

    if (error) throw error;

    // Process company report data
    const companyMap = new Map<string, CompanyReport>();
    
    data?.forEach(item => {
      const companyName = 'شرکت نامشخص';

      if (companyMap.has(companyName)) {
        const existing = companyMap.get(companyName)!;
        existing.total_quantity += item.quantity;
        existing.total_orders += 1;
      } else {
        companyMap.set(companyName, {
          company_name: companyName,
          total_orders: 1,
          total_quantity: item.quantity,
          unique_drugs: 1
        });
      }
    });

    const sortedCompanies = Array.from(companyMap.values())
      .sort((a, b) => b.total_quantity - a.total_quantity);
    
    setCompanyReports(sortedCompanies);
  };

  const generatePharmacyReport = async (startDate: string, endDate: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        total_items,
        created_at,
        pharmacies!inner(name)
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;

    // Process pharmacy report data
    const pharmacyMap = new Map<string, PharmacyReport>();
    
    data?.forEach(order => {
      const pharmacyName = order.pharmacies.name;
      
      if (pharmacyMap.has(pharmacyName)) {
        const existing = pharmacyMap.get(pharmacyName)!;
        existing.total_orders += 1;
        existing.total_items += order.total_items;
        if (new Date(order.created_at) > new Date(existing.last_order)) {
          existing.last_order = order.created_at;
        }
      } else {
        pharmacyMap.set(pharmacyName, {
          pharmacy_name: pharmacyName,
          total_orders: 1,
          total_items: order.total_items,
          last_order: order.created_at
        });
      }
    });

    const sortedPharmacies = Array.from(pharmacyMap.values())
      .sort((a, b) => b.total_orders - a.total_orders);
    
    setPharmacyReports(sortedPharmacies);
  };

  const exportToCSV = () => {
    let csvContent = "";
    let filename = "";

    if (reportType === 'drugs') {
      csvContent = "Drug Name,Company,Total Quantity,Order Count,Category\n";
      drugReports.forEach(drug => {
        csvContent += `"${drug.drug_name}","${drug.company_name || ''}","${drug.total_quantity}","${drug.order_count}","${drug.category || ''}"\n`;
      });
      filename = `drug_report_${dateFilter}.csv`;
    } else if (reportType === 'companies') {
      csvContent = "Company Name,Total Orders,Total Quantity,Unique Drugs\n";
      companyReports.forEach(company => {
        csvContent += `"${company.company_name}","${company.total_orders}","${company.total_quantity}","${company.unique_drugs}"\n`;
      });
      filename = `company_report_${dateFilter}.csv`;
    } else if (reportType === 'pharmacies') {
      csvContent = "Pharmacy Name,Total Orders,Total Items,Last Order\n";
      pharmacyReports.forEach(pharmacy => {
        csvContent += `"${pharmacy.pharmacy_name}","${pharmacy.total_orders}","${pharmacy.total_items}","${pharmacy.last_order}"\n`;
      });
      filename = `pharmacy_report_${dateFilter}.csv`;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">گزارشات تحلیلی</h2>
        <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          دانلود گزارش
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger>
            <SelectValue placeholder="نوع گزارش" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="drugs">گزارش داروها</SelectItem>
            <SelectItem value="companies">گزارش شرکت‌ها</SelectItem>
            <SelectItem value="pharmacies">گزارش داروخانه‌ها</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger>
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

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {reportType === 'drugs' && `${drugReports.length} دارو`}
            {reportType === 'companies' && `${companyReports.length} شرکت`}
            {reportType === 'pharmacies' && `${pharmacyReports.length} داروخانه`}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {reportType === 'drugs' && (
            <>
              {drugReports.map((drug, index) => (
                <Card key={index} className="hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{drug.drug_name}</h3>
                        {drug.company_name && (
                          <p className="text-sm text-muted-foreground">شرکت: {drug.company_name}</p>
                        )}
                        {drug.category && (
                          <Badge variant="outline" className="text-xs">
                            {drug.category}
                          </Badge>
                        )}
                      </div>
                      <div className="text-left space-y-1">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" />
                          <span className="font-bold">{drug.total_quantity} عدد</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {drug.order_count} سفارش
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {reportType === 'companies' && (
            <>
              {companyReports.map((company, index) => (
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
                            <div className="text-xs text-muted-foreground">محصول</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{company.unique_drugs}</div>
                            <div className="text-xs text-muted-foreground">نوع دارو</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {reportType === 'pharmacies' && (
            <>
              {pharmacyReports.map((pharmacy, index) => (
                <Card key={index} className="hover:shadow-elegant transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
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
                            <div className="text-xs text-muted-foreground">محصول</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}

      {((reportType === 'drugs' && drugReports.length === 0) ||
        (reportType === 'companies' && companyReports.length === 0) ||
        (reportType === 'pharmacies' && pharmacyReports.length === 0)) && !loading && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            اطلاعاتی برای نمایش یافت نشد
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            بازه زمانی دیگری انتخاب کنید
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminReports;