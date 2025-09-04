import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShoppingCart, History, Eye, CheckCircle, XCircle, Edit, Calendar as CalendarIcon, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface OrderItem {
  id: string;
  quantity: number;
  drug_id: string;
  drug_name: string;
  drug_type: string;
}

interface Order {
  id: string;
  workflow_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  total_items: number;
  items?: OrderItem[];
  pharmacy?: {
    name: string;
  };
}

interface OrdersManagementProps {
  pharmacyId: string;
  onOrderAction?: (orderId: string, action: 'approve' | 'reject' | 'revision') => Promise<void>;
  showActions?: boolean;
}

const OrdersManagement: React.FC<OrdersManagementProps> = ({ 
  pharmacyId, 
  onOrderAction,
  showActions = false 
}) => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchOrders();
  }, [pharmacyId]);

  useEffect(() => {
    applyFilters();
  }, [allOrders, searchTerm, statusFilter, dateFrom, dateTo]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch active orders (not completed and not rejected)
      const { data: activeData, error: activeError } = await supabase
        .from('orders')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .not('workflow_status', 'in', '(completed,rejected)')
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;

      // Fetch all orders for history
      const { data: allData, error: allError } = await supabase
        .from('orders')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .order('created_at', { ascending: false });

      if (allError) throw allError;

      setActiveOrders(activeData || []);
      setAllOrders(allData || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('خطا در بارگذاری سفارشات');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allOrders];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.notes && order.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.workflow_status === statusFilter);
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(order => 
        new Date(order.created_at) >= dateFrom
      );
    }

    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => 
        new Date(order.created_at) <= endDate
      );
    }

    setFilteredOrders(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          drug_id
        `)
        .eq('order_id', orderId);

      if (error) throw error;

      const itemsWithDrugs = await Promise.all((data || []).map(async (item) => {
        const [chemical, medical, natural] = await Promise.all([
          supabase.from('chemical_drugs').select('full_brand_name').eq('id', item.drug_id).single(),
          supabase.from('medical_supplies').select('title').eq('id', item.drug_id).single(),
          supabase.from('natural_products').select('full_en_brand_name').eq('id', item.drug_id).single()
        ]);

        let drugName = 'نامشخص';
        let drugType = 'نامشخص';

        if (chemical.data) {
          drugName = chemical.data.full_brand_name;
          drugType = 'دارو';
        } else if (medical.data) {
          drugName = medical.data.title;
          drugType = 'تجهیزات پزشکی';
        } else if (natural.data) {
          drugName = natural.data.full_en_brand_name;
          drugType = 'محصولات طبیعی';
        }

        return {
          ...item,
          drug_name: drugName,
          drug_type: drugType
        };
      }));

      return itemsWithDrugs;
    } catch (error) {
      console.error('Error fetching order items:', error);
      return [];
    }
  };

  const toggleOrderExpansion = async (orderId: string, ordersList: Order[], setOrdersList: React.Dispatch<React.SetStateAction<Order[]>>) => {
    const newExpanded = new Set(expandedOrders);
    
    if (expandedOrders.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
      
      const order = ordersList.find(o => o.id === orderId);
      if (order && !order.items) {
        const items = await fetchOrderItems(orderId);
        setOrdersList(prevOrders => 
          prevOrders.map(o => 
            o.id === orderId ? { ...o, items } : o
          )
        );
      }
    }
    
    setExpandedOrders(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'در انتظار بررسی', variant: 'secondary' as const },
      'needs_revision_pm': { label: 'نیاز به ویرایش مدیر', variant: 'destructive' as const },
      'needs_revision_ps': { label: 'نیاز به ویرایش کارمند', variant: 'destructive' as const },
      'approved_pm': { label: 'تایید مدیر', variant: 'default' as const },
      'approved_bs': { label: 'تایید نهایی', variant: 'default' as const },
      'completed': { label: 'تکمیل شده', variant: 'outline' as const },
      'rejected': { label: 'رد شده', variant: 'destructive' as const },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  // Function to determine if user can act on order based on workflow status
  const canUserActOnOrder = (workflowStatus: string) => {
    // Only show actions for pending orders or orders that need revision
    const actionableStatuses = ['pending', 'needs_revision_pm', 'needs_revision_ps'];
    return actionableStatuses.includes(workflowStatus);
  };

  const renderOrderCard = (order: Order, ordersList: Order[], setOrdersList: React.Dispatch<React.SetStateAction<Order[]>>) => {
    // Determine if actions should be shown based on order status and user actions
    const shouldShowActions = showActions && canUserActOnOrder(order.workflow_status);
    
    return (
      <Card key={order.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">سفارش #{order.id.slice(0, 8)}</CardTitle>
            <CardDescription>
              تاریخ ثبت: {formatDate(order.created_at)}
            </CardDescription>
          </div>
          {getStatusBadge(order.workflow_status)}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm">تعداد اقلام: {order.total_items}</p>
              {order.notes && (
                <p className="text-sm text-muted-foreground">یادداشت: {order.notes}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toggleOrderExpansion(order.id, ordersList, setOrdersList)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {expandedOrders.has(order.id) ? 'بستن' : 'مشاهده'}
              </Button>
              {shouldShowActions && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onOrderAction?.(order.id, 'approve')}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    تایید
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onOrderAction?.(order.id, 'revision')}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    ویرایش
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => onOrderAction?.(order.id, 'reject')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    رد
                  </Button>
                </>
              )}
            </div>
          </div>
        
        {expandedOrders.has(order.id) && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="font-medium mb-3">جزئیات سفارش:</h4>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{item.drug_name}</p>
                      <p className="text-sm text-muted-foreground">{item.drug_type}</p>
                    </div>
                    <Badge variant="outline">تعداد: {item.quantity}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">در حال بارگذاری سفارشات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            مدیریت سفارشات
          </CardTitle>
          <CardDescription>
            مشاهده و مدیریت سفارشات داروخانه
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                سفارشات فعال
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                تاریخچه سفارشات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                سفارشات در انتظار تعیین تکلیف
              </div>
              
              {activeOrders.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">هیچ سفارش فعالی وجود ندارد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOrders.map((order) => renderOrderCard(order, activeOrders, setActiveOrders))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Filter className="h-4 w-4" />
                    فیلترها
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">جستجو</label>
                      <div className="relative">
                        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="جستجو در سفارشات..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pr-10"
                        />
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">وضعیت</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب وضعیت" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                          <SelectItem value="pending">در انتظار بررسی</SelectItem>
                          <SelectItem value="approved_pm">تایید مدیر</SelectItem>
                          <SelectItem value="approved_bs">تایید نهایی</SelectItem>
                          <SelectItem value="completed">تکمیل شده</SelectItem>
                          <SelectItem value="rejected">رد شده</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date From */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">از تاریخ</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateFrom && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFrom ? format(dateFrom, "yyyy/MM/dd") : "انتخاب تاریخ"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dateFrom}
                            onSelect={setDateFrom}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Date To */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">تا تاریخ</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateTo && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateTo ? format(dateTo, "yyyy/MM/dd") : "انتخاب تاریخ"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={dateTo}
                            onSelect={setDateTo}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {filteredOrders.length} سفارش یافت شد
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      پاک کردن فیلترها
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all" || dateFrom || dateTo 
                      ? 'هیچ سفارشی با این فیلترها یافت نشد'
                      : 'هیچ سفارشی ثبت نشده است'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => renderOrderCard(order, filteredOrders, setFilteredOrders))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersManagement;