import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Package, Pill, TrendingUp, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface DrugOrderSummary {
  drug_id: string;
  drug_name: string;
  drug_category?: string;
  drug_company?: string;
  total_quantity: number;
  total_orders: number;
  pharmacies: Array<{
    pharmacy_name: string;
    quantity: number;
    order_count: number;
  }>;
}

interface DrugOrdersProps {
  dateFilter: string;
  statusFilter: string;
}

const AdminDrugOrders: React.FC<DrugOrdersProps> = ({ dateFilter, statusFilter }) => {
  const [drugOrders, setDrugOrders] = useState<DrugOrderSummary[]>([]);
  const [filteredDrugOrders, setFilteredDrugOrders] = useState<DrugOrderSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedDrug, setExpandedDrug] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchDrugOrders();
  }, [dateFilter, statusFilter]);

  useEffect(() => {
    applySearchFilter();
  }, [searchTerm, drugOrders]);

  const fetchDrugOrders = async () => {
    try {
      setLoading(true);
      
      // Build date filter condition
      let dateCondition = '';
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateFilter) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case '3months':
            startDate.setMonth(now.getMonth() - 3);
            break;
        }
        dateCondition = `and orders.created_at >= '${startDate.toISOString()}'`;
      }

      // Build status filter condition
      let statusCondition = '';
      if (statusFilter !== 'all') {
        statusCondition = `and orders.status = '${statusFilter}'`;
      }

      // Fetch orders with items
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          pharmacies!orders_pharmacy_id_fkey(name),
          order_items(
            drug_id,
            quantity
          )
        `)
        .gte('created_at', dateFilter === 'today' ? new Date().toISOString().split('T')[0] : '1970-01-01')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter orders based on date and status
      let filteredOrders = orders || [];
      
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateFilter) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case '3months':
            startDate.setMonth(now.getMonth() - 3);
            break;
        }
        
        filteredOrders = filteredOrders.filter(order => 
          new Date(order.created_at) >= startDate
        );
      }

      if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
      }

      // Group by drug_id and aggregate data
      const drugMap = new Map<string, DrugOrderSummary>();

      for (const order of filteredOrders) {
        for (const item of order.order_items) {
          const key = item.drug_id;
          
          if (!drugMap.has(key)) {
            drugMap.set(key, {
              drug_id: item.drug_id,
              drug_name: '',
              drug_category: '',
              drug_company: '',
              total_quantity: 0,
              total_orders: 0,
              pharmacies: []
            });
          }

          const drugSummary = drugMap.get(key)!;
          drugSummary.total_quantity += item.quantity;

          // Find existing pharmacy or add new one
          const existingPharmacy = drugSummary.pharmacies.find(
            p => p.pharmacy_name === order.pharmacies.name
          );

          if (existingPharmacy) {
            existingPharmacy.quantity += item.quantity;
            existingPharmacy.order_count += 1;
          } else {
            drugSummary.pharmacies.push({
              pharmacy_name: order.pharmacies.name,
              quantity: item.quantity,
              order_count: 1
            });
          }
        }
      }

      // Fetch drug details from all three tables
      const drugSummaries = await Promise.all(
        Array.from(drugMap.values()).map(async (summary) => {
          let drugData = null;

          // Try chemical_drugs first
          try {
            const { data: chemicalData } = await supabase
              .from('chemical_drugs')
              .select('full_brand_name, action, license_owner_company_name')
              .eq('id', summary.drug_id)
              .maybeSingle();
            
            if (chemicalData) {
              drugData = {
                name: chemicalData.full_brand_name,
                category: chemicalData.action,
                company: chemicalData.license_owner_company_name
              };
            }
          } catch (err) {
            // Continue to next table
          }

          if (!drugData) {
            // Try medical_supplies
            try {
              const { data: medicalData } = await supabase
                .from('medical_supplies')
                .select('title, action, license_owner_company_name')
                .eq('id', summary.drug_id)
                .maybeSingle();
              
              if (medicalData) {
                drugData = {
                  name: medicalData.title,
                  category: medicalData.action,
                  company: medicalData.license_owner_company_name
                };
              }
            } catch (err) {
              // Continue to next table
            }
          }

          if (!drugData) {
            // Try natural_products
            try {
              const { data: naturalData } = await supabase
                .from('natural_products')
                .select('full_en_brand_name, action, license_owner_name')
                .eq('id', summary.drug_id)
                .maybeSingle();
              
              if (naturalData) {
                drugData = {
                  name: naturalData.full_en_brand_name,
                  category: naturalData.action,
                  company: naturalData.license_owner_name
                };
              }
            } catch (err) {
              // Drug not found
            }
          }

          return {
            ...summary,
            drug_name: drugData?.name || 'دارو نامشخص',
            drug_category: drugData?.category || '',
            drug_company: drugData?.company || '',
            total_orders: summary.pharmacies.reduce((sum, p) => sum + p.order_count, 0)
          };
        })
      );

      // Sort by total quantity
      drugSummaries.sort((a, b) => b.total_quantity - a.total_quantity);

      setDrugOrders(drugSummaries);
    } catch (error) {
      console.error('Error fetching drug orders:', error);
      toast({
        title: "خطا",
        description: "خطا در دریافت گزارش سفارشات بر اساس دارو",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applySearchFilter = () => {
    if (searchTerm) {
      const filtered = drugOrders.filter(drug =>
        drug.drug_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.drug_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.drug_company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDrugOrders(filtered);
    } else {
      setFilteredDrugOrders(drugOrders);
    }
  };

  const toggleDrugExpansion = (drugId: string) => {
    setExpandedDrug(expandedDrug === drugId ? null : drugId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between ${isMobile ? 'flex-col gap-3' : ''}`}>
        <h3 className={`font-bold gradient-text ${isMobile ? 'text-lg' : 'text-xl'}`}>گزارش سفارشات بر اساس دارو</h3>
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-primary" />
          <Badge variant="secondary" className="text-sm">
            {filteredDrugOrders.length} دارو
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="جستجو در داروها..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10 rounded-xl border-border/60 bg-card/50 focus:bg-card focus:border-primary/50"
        />
      </div>

      {/* Drug Orders List */}
      <div className="space-y-4">
        {filteredDrugOrders.map((drug) => (
          <Card key={drug.drug_id} className="hover:shadow-elegant transition-all duration-300 border-border/60 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Drug Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Pill className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-semibold text-base">{drug.drug_name}</h4>
                      {drug.drug_category && (
                        <p className="text-sm text-muted-foreground">{drug.drug_category}</p>
                      )}
                      {drug.drug_company && (
                        <p className="text-xs text-muted-foreground">شرکت: {drug.drug_company}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-primary">{drug.total_quantity.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">عدد سفارش</div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-muted/20 p-3 rounded-lg text-center">
                    <div className="text-lg font-semibold">{drug.total_quantity.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">کل مقدار</div>
                  </div>
                  <div className="bg-muted/20 p-3 rounded-lg text-center">
                    <div className="text-lg font-semibold">{drug.total_orders}</div>
                    <div className="text-xs text-muted-foreground">تعداد سفارش</div>
                  </div>
                  <div className="bg-muted/20 p-3 rounded-lg text-center">
                    <div className="text-lg font-semibold">{drug.pharmacies.length}</div>
                    <div className="text-xs text-muted-foreground">داروخانه</div>
                  </div>
                </div>

                {/* Expand Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleDrugExpansion(drug.drug_id)}
                  className="w-full gap-2 rounded-xl border-border/60 hover:border-primary/30"
                >
                  {expandedDrug === drug.drug_id ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      بستن جزئیات داروخانه‌ها
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      مشاهده جزئیات داروخانه‌ها
                    </>
                  )}
                </Button>

                {/* Expanded Content - Pharmacy Details */}
                {expandedDrug === drug.drug_id && (
                  <div className="space-y-3 pt-3 border-t border-border/60">
                    <h5 className="font-medium text-sm flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      تفکیک بر اساس داروخانه:
                    </h5>
                    <div className="space-y-2">
                      {drug.pharmacies
                        .sort((a, b) => b.quantity - a.quantity)
                        .map((pharmacy, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">{pharmacy.pharmacy_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {pharmacy.order_count} سفارش
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-primary">{pharmacy.quantity.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">عدد</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDrugOrders.length === 0 && (
          <Card className="text-center p-8 border-border/60 rounded-2xl bg-card/50">
            <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هیچ سفارشی یافت نشد</h3>
            <p className="text-muted-foreground">با فیلترهای انتخاب شده سفارشی برای نمایش وجود ندارد</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDrugOrders;