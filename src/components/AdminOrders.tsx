import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Package, ShoppingCart, TrendingUp, Search, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    };
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
            drug_id,
            drugs(
              name,
              generic_name,
              category,
              unit
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">مدیریت سفارشات</h2>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <Badge variant="secondary" className="text-sm">
            {filteredOrders.length} سفارش
          </Badge>
        </div>
      </div>

      {/* Filters */}
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

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-elegant transition-all duration-300">
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
                          <p className="font-medium text-base">{item.drugs.name}</p>
                          {item.drugs.generic_name && (
                            <p className="text-sm text-muted-foreground">نام عمومی: {item.drugs.generic_name}</p>
                          )}
                          {item.drugs.category && (
                            <p className="text-sm text-muted-foreground">دسته‌بندی: {item.drugs.category}</p>
                          )}
                        </div>
                        <div className="text-left">
                          <Badge variant="outline" className="text-base px-3 py-1">
                            {item.quantity} {item.drugs.unit}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
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