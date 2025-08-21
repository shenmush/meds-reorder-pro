import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Package, ShoppingCart, TrendingUp, Search, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Building2, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import AdminMobileFilters from './AdminMobileFilters';

interface Order {
  id: string;
  status: string;
  total_items: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  pharmacies: {
    name: string;
    user_id: string;
  };
}

interface OrderWithItems extends Order {
  order_items: Array<{
    id: string;
    quantity: number;
    drug_id: string;
    drugs: {
      name: string;
      generic_name?: string;
      category?: string;
      unit: string;
      company?: string;
    } | null;
  }>;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderWithItems[]>([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [dateFilter, statusFilter, searchTerm, orders]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacies!orders_pharmacy_id_fkey(name, user_id),
          order_items(
            id,
            quantity,
            drug_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch drug details separately from the three tables
      const ordersWithDrugDetails = await Promise.all((data || []).map(async (order) => {
        const itemsWithDrugs = await Promise.all(order.order_items.map(async (item) => {
          // Try to find the drug in chemical_drugs first
          let drugData = null;
          
          try {
            const { data: chemicalData } = await supabase
              .from('chemical_drugs')
              .select('full_brand_name, generic_code, action, license_owner_company_name')
              .eq('id', item.drug_id)
              .maybeSingle();
            
            if (chemicalData) {
              drugData = {
                name: chemicalData.full_brand_name,
                generic_name: chemicalData.generic_code,
                category: chemicalData.action,
                company: chemicalData.license_owner_company_name,
                unit: 'عدد'
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
                .eq('id', item.drug_id)
                .maybeSingle();
              
              if (medicalData) {
                drugData = {
                  name: medicalData.title,
                  generic_name: null,
                  category: medicalData.action,
                  company: medicalData.license_owner_company_name,
                  unit: 'عدد'
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
                .select('full_en_brand_name, atc_code, action, license_owner_name')
                .eq('id', item.drug_id)
                .maybeSingle();
              
              if (naturalData) {
                drugData = {
                  name: naturalData.full_en_brand_name,
                  generic_name: naturalData.atc_code,
                  category: naturalData.action,
                  company: naturalData.license_owner_name,
                  unit: 'عدد'
                };
              }
            } catch (err) {
              // Drug not found in any table
            }
          }

          return {
            ...item,
            drugs: drugData
          };
        }));

        return {
          ...order,
          order_items: itemsWithDrugs
        };
      }));

      setOrders(ordersWithDrugDetails);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "خطا",
        description: "خطا در دریافت لیست سفارشات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Date filter
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

      filtered = filtered.filter(order => 
        new Date(order.created_at) >= startDate
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.pharmacies.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
            : order
        )
      );

      toast({
        title: "موفقیت",
        description: "وضعیت سفارش با موفقیت تغییر کرد",
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "خطا",
        description: "خطا در تغییر وضعیت سفارش",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'processing': return <Package className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'cancelled': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
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
        <h2 className={`font-bold gradient-text ${isMobile ? 'text-xl' : 'text-2xl'}`}>مدیریت سفارشات</h2>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <Badge variant="secondary" className="text-sm">
            {filteredOrders.length} سفارش
          </Badge>
        </div>
      </div>

      {/* Filters */}
      {isMobile ? (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجو در سفارشات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 rounded-xl border-border/60 bg-card/50 focus:bg-card focus:border-primary/50"
            />
          </div>
          
          <div className="flex items-center justify-between gap-3">
            <AdminMobileFilters
              searchTerm={searchTerm}
              dateFilter={dateFilter}
              statusFilter={statusFilter}
              onSearchChange={setSearchTerm}
              onDateFilterChange={setDateFilter}
              onStatusFilterChange={setStatusFilter}
              onClearFilters={() => {
                setSearchTerm('');
                setDateFilter('all');
                setStatusFilter('all');
              }}
            />
            
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{filteredOrders.reduce((sum, order) => sum + order.total_items, 0)} محصول</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجو در سفارشات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="فیلتر زمانی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه</SelectItem>
              <SelectItem value="today">امروز</SelectItem>
              <SelectItem value="week">هفته گذشته</SelectItem>
              <SelectItem value="month">ماه گذشته</SelectItem>
              <SelectItem value="3months">سه ماه گذشته</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="pending">در انتظار</SelectItem>
              <SelectItem value="processing">در حال پردازش</SelectItem>
              <SelectItem value="completed">تکمیل شده</SelectItem>
              <SelectItem value="cancelled">لغو شده</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            مجموع: {filteredOrders.reduce((sum, order) => sum + order.total_items, 0)} محصول
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-elegant transition-all duration-300 border-border/60 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
            {isMobile ? (
              // Mobile Card Layout
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Order Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{order.pharmacies.name}</span>
                    </div>
                    <Badge className={`${getStatusBadgeColor(order.status)} flex items-center gap-1 text-xs`}>
                      {getStatusIcon(order.status)}
                      {order.status === 'pending' && 'در انتظار'}
                      {order.status === 'processing' && 'پردازش'}
                      {order.status === 'completed' && 'تکمیل'}
                      {order.status === 'cancelled' && 'لغو'}
                    </Badge>
                  </div>

                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted/20 p-2 rounded-lg">
                      <div className="text-xs text-muted-foreground">تاریخ سفارش</div>
                      <div className="font-medium text-xs mt-1">{formatDate(order.created_at)}</div>
                    </div>
                    <div className="bg-muted/20 p-2 rounded-lg">
                      <div className="text-xs text-muted-foreground">تعداد محصولات</div>
                      <div className="font-medium text-xs mt-1">{order.total_items} عدد</div>
                    </div>
                  </div>

                  {/* Status Change */}
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">تغییر وضعیت:</div>
                    <Select 
                      value={order.status} 
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-full h-8 text-xs rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">در انتظار</SelectItem>
                        <SelectItem value="processing">در حال پردازش</SelectItem>
                        <SelectItem value="completed">تکمیل شده</SelectItem>
                        <SelectItem value="cancelled">لغو شده</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Expand Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleOrderExpansion(order.id)}
                    className="w-full gap-2 rounded-xl border-border/60 hover:border-primary/30"
                  >
                    {expandedOrder === order.id ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        بستن جزئیات
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        مشاهده جزئیات
                      </>
                    )}
                  </Button>

                  {/* Expanded Content */}
                  {expandedOrder === order.id && (
                    <div className="space-y-3 pt-3 border-t border-border/60">
                      {order.notes && (
                        <div className="p-3 bg-muted/20 rounded-lg">
                          <span className="text-xs font-medium">یادداشت:</span>
                          <p className="text-xs mt-1">{order.notes}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          محصولات سفارش:
                        </h4>
                        <div className="space-y-2">
                          {order.order_items.map((item) => (
                            <Card key={item.id} className="border border-border/30 rounded-lg bg-background/50">
                              <CardContent className="p-3">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium text-xs">
                                      {item.drugs?.name || `شناسه: ${item.drug_id.slice(0, 8)}...`}
                                    </p>
                                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                                      {item.quantity} {item.drugs?.unit || 'عدد'}
                                    </Badge>
                                  </div>
                                  {item.drugs?.company && (
                                    <p className="text-xs text-muted-foreground">شرکت: {item.drugs.company}</p>
                                  )}
                                  {item.drugs?.generic_name && (
                                    <p className="text-xs text-muted-foreground">نام عمومی: {item.drugs.generic_name}</p>
                                  )}
                                  {item.drugs?.category && (
                                    <p className="text-xs text-muted-foreground">دسته‌بندی: {item.drugs.category}</p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            ) : (
              // Desktop Layout (unchanged)
              <>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => toggleOrderExpansion(order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        {order.pharmacies.name}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatDate(order.created_at)}</span>
                        <span>{order.total_items} محصول</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusBadgeColor(order.status)} flex items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        {order.status === 'pending' && 'در انتظار'}
                        {order.status === 'processing' && 'در حال پردازش'}
                        {order.status === 'completed' && 'تکمیل شده'}
                        {order.status === 'cancelled' && 'لغو شده'}
                      </Badge>
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">در انتظار</SelectItem>
                          <SelectItem value="processing">در حال پردازش</SelectItem>
                          <SelectItem value="completed">تکمیل شده</SelectItem>
                          <SelectItem value="cancelled">لغو شده</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>

                {expandedOrder === order.id && (
                  <CardContent className="border-t">
                    <div className="space-y-4">
                      {order.notes && (
                        <div className="p-3 bg-muted rounded-lg">
                          <span className="text-sm font-medium">یادداشت:</span>
                          <p className="text-sm mt-1">{order.notes}</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <h4 className="font-medium">محصولات سفارش:</h4>
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-4 bg-background border rounded-lg">
                            <div className="space-y-1">
                              <p className="font-medium text-base">
                                {item.drugs?.name || `محصول شناسه: ${item.drug_id.slice(0, 8)}...`}
                              </p>
                              {item.drugs?.company && (
                                <p className="text-sm text-muted-foreground">شرکت: {item.drugs.company}</p>
                              )}
                              {item.drugs?.generic_name && (
                                <p className="text-sm text-muted-foreground">نام عمومی: {item.drugs.generic_name}</p>
                              )}
                              {item.drugs?.category && (
                                <p className="text-sm text-muted-foreground">دسته‌بندی: {item.drugs.category}</p>
                              )}
                            </div>
                            <div className="text-left">
                              <Badge variant="outline" className="text-base px-3 py-1">
                                {item.quantity} {item.drugs?.unit || 'عدد'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </>
            )}
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            سفارشی یافت نشد
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            فیلترهای مختلفی امتحان کنید
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;