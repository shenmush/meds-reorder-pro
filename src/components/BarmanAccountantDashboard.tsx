import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Receipt, CheckCircle, Clock, AlertCircle, X, CreditCard, History, BarChart3, TrendingUp, Activity, DollarSign, Calendar, User as UserIcon, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobileHeader from '@/components/MobileHeader';

interface OrderItem {
  id: string;
  drug_id: string;
  quantity: number;
  drug_name?: string;
  drug_brand?: string;
  unit_price?: number;
  total_price?: number;
}

interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  workflow_status: string;
  total_items: number;
  notes?: string;
  payment_proof_url?: string;
  payment_date?: string;
  invoice_amount?: number;
  payment_rejection_reason?: string;
  pricing_notes?: string;
  pharmacy: {
    name: string;
  };
  order_items?: OrderItem[];
  expanded?: boolean;
}

interface BarmanAccountantDashboardProps {
  user: User;
  onAuthChange: (user: User | null) => void;
}

const BarmanAccountantDashboard: React.FC<BarmanAccountantDashboardProps> = ({ user, onAuthChange }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [activeTab, setActiveTab] = useState('payments');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [loadingOrderItems, setLoadingOrderItems] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    pendingPayments: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalProcessed: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacies!inner(name)
        `)
        .eq('workflow_status', 'payment_uploaded')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        
        // Check if it's an authentication error
        if (error.code === 'PGRST301' || error.message?.includes('refresh_token_not_found') || error.message?.includes('Invalid Refresh Token')) {
          toast({
            title: "خطای احراز هویت",
            description: "لطفاً خارج شده و مجدداً وارد شوید",
            variant: "destructive",
          });
          // Auto logout to force re-authentication
          setTimeout(() => {
            handleSignOut();
          }, 2000);
          return;
        }
        
        throw error;
      }

      console.log('Fetched orders:', data);
      const ordersWithPharmacy = (data || []).map(order => ({
        ...order,
        pharmacy: { name: order.pharmacies.name },
        order_items: [],
        expanded: false
      }));
      setOrders(ordersWithPharmacy);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "خطا",
        description: "خطا در دریافت سفارشات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryOrders = async () => {
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacies!inner(name)
        `)
        .in('workflow_status', ['payment_verified', 'payment_rejected'])
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      const ordersWithPharmacy = (data || []).map(order => ({
        ...order,
        pharmacy: { name: order.pharmacies.name }
      }));
      setHistoryOrders(ordersWithPharmacy);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: "خطا",
        description: "خطا در بارگذاری تاریخچه",
        variant: "destructive",
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [pendingResponse, approvedResponse, rejectedResponse, totalResponse] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact' }).eq('workflow_status', 'payment_uploaded'),
        supabase.from('orders').select('id', { count: 'exact' }).eq('workflow_status', 'payment_verified').gte('updated_at', today),
        supabase.from('orders').select('id', { count: 'exact' }).eq('workflow_status', 'payment_rejected').gte('updated_at', today),
        supabase.from('orders').select('id', { count: 'exact' }).in('workflow_status', ['payment_verified', 'payment_rejected'])
      ]);

      setStats({
        pendingPayments: pendingResponse.count || 0,
        approvedToday: approvedResponse.count || 0,
        rejectedToday: rejectedResponse.count || 0,
        totalProcessed: totalResponse.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    setLoadingOrderItems(prev => new Set([...prev, orderId]));
    try {
      console.log('Fetching order items for order:', orderId);
      
      // First get order items
      const { data: orderItemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          drug_id,
          quantity
        `)
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        throw itemsError;
      }

      console.log('Fetched order items:', orderItemsData);

      if (!orderItemsData || orderItemsData.length === 0) {
        console.log('No order items found');
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, order_items: [], expanded: true }
              : order
          )
        );
        setExpandedOrders(prev => new Set([...prev, orderId]));
        return;
      }

      // Get drug information and pricing for each item
      const itemsWithDetails = await Promise.all(
        orderItemsData.map(async (item) => {
          // Get drug details
          const { data: drugData } = await supabase
            .from('chemical_drugs')
            .select('full_brand_name, irc')
            .eq('id', item.drug_id)
            .single();

          // Get pricing information
          const { data: pricingData } = await supabase
            .from('order_item_pricing')
            .select('unit_price, total_price, notes')
            .eq('order_id', orderId)
            .eq('drug_id', item.drug_id)
            .maybeSingle();

          return {
            id: item.id,
            drug_id: item.drug_id,
            quantity: item.quantity,
            drug_name: drugData?.full_brand_name || 'نامشخص',
            drug_brand: drugData?.irc || 'نامشخص',
            unit_price: pricingData?.unit_price || 0,
            total_price: pricingData?.total_price || 0
          };
        })
      );

      console.log('Items with details:', itemsWithDetails);

      // Update the specific order with items
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, order_items: itemsWithDetails, expanded: true }
            : order
        )
      );

      setExpandedOrders(prev => new Set([...prev, orderId]));

    } catch (error) {
      console.error('Error fetching order items:', error);
      toast({
        title: "خطا",
        description: "خطا در دریافت جزئیات سفارش",
        variant: "destructive",
      });
    } finally {
      setLoadingOrderItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const isExpanded = expandedOrders.has(orderId);
    
    if (isExpanded) {
      setExpandedOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, expanded: false }
            : order
        )
      );
    } else {
      fetchOrderItems(orderId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const handleApprovePayment = async (orderId: string) => {
    if (!reviewNotes.trim()) {
      toast({
        title: "خطا",
        description: "لطفا توضیحات تایید را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    setProcessingOrderId(orderId);
    try {
      // Update order status to send to manager
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          workflow_status: 'payment_verified'
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Create approval record
      await supabase
        .from('order_approvals')
        .insert({
          order_id: orderId,
          user_id: user.id,
          from_status: 'payment_uploaded',
          to_status: 'payment_verified',
          notes: reviewNotes
        });

      toast({
        title: "موفق",
        description: "پرداخت تایید شد و به مدیر بارمان ارسال گردید",
      });

      setReviewNotes('');
      setSelectedOrder(null);
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        title: "خطا",
        description: "خطا در تایید پرداخت",
        variant: "destructive",
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRequestRevision = async (orderId: string) => {
    if (!reviewNotes.trim()) {
      toast({
        title: "خطا",
        description: "لطفا دلیل درخواست اصلاح را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    setProcessingOrderId(orderId);
    try {
      // Return to accountant for revision
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          workflow_status: 'invoice_issued',
          payment_rejection_reason: `درخواست اصلاح: ${reviewNotes}`,
          payment_proof_url: null // Clear the uploaded proof
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Create approval record
      await supabase
        .from('order_approvals')
        .insert({
          order_id: orderId,
          user_id: user.id,
          from_status: 'payment_uploaded',
          to_status: 'invoice_issued',
          notes: `درخواست اصلاح پرداخت: ${reviewNotes}`
        });

      toast({
        title: "موفق",
        description: "درخواست اصلاح پرداخت به حسابدار داروخانه ارسال شد",
      });

      setReviewNotes('');
      setSelectedOrder(null);
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast({
        title: "خطا",
        description: "خطا در درخواست اصلاح",
        variant: "destructive",
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectPayment = async (orderId: string) => {
    if (!reviewNotes.trim()) {
      toast({
        title: "خطا",
        description: "لطفا دلیل رد پرداخت را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    setProcessingOrderId(orderId);
    try {
      // Update order status to payment_rejected
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          workflow_status: 'payment_rejected',
          payment_rejection_reason: reviewNotes
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Create approval record
      await supabase
        .from('order_approvals')
        .insert({
          order_id: orderId,
          user_id: user.id,
          from_status: 'payment_uploaded',
          to_status: 'payment_rejected',
          notes: `Payment rejected: ${reviewNotes}`
        });

      toast({
        title: "موفق",
        description: "پرداخت رد شد و به داروخانه برگردانده شد",
      });

      setReviewNotes('');
      setSelectedOrder(null);
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "خطا",
        description: "خطا در رد پرداخت",
        variant: "destructive",
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onAuthChange(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'payment_uploaded':
        return <Badge variant="secondary" className="gap-1"><AlertCircle size={12} />نیازمند بررسی</Badge>;
      case 'payment_verified':
        return <Badge variant="default" className="gap-1"><CheckCircle size={12} />تایید شده</Badge>;
      case 'payment_rejected':
        return <Badge variant="destructive" className="gap-1"><X size={12} />رد شده</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'history' && historyOrders.length === 0) {
      fetchHistoryOrders();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Mobile Header */}
      <div className="block md:hidden">
        <MobileHeader 
          user={user}
          pharmacy={null}
          userRole="barman_accountant"
          onSignOut={handleSignOut}
        />
      </div>

      {/* Desktop Header */}
      <header className="hidden md:block border-b border-border/60 bg-card/90 backdrop-blur-lg shadow-soft">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
                <CreditCard className="h-7 w-7 text-primary" />
                <div className="absolute -bottom-1 -right-1 p-1 bg-secondary rounded-full">
                  <BarChart3 className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gradient">پنل حسابدار بارمان</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                variant="outline" 
                onClick={handleSignOut} 
                className="gap-2 px-6 py-2.5 rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-300"
              >
                <LogOut className="h-4 w-4" />
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="hidden md:grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">پرداخت‌ها</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">تاریخچه</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">گزارشات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-primary animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">در انتظار</p>
                      <p className="text-2xl font-bold text-primary">{stats.pendingPayments}</p>
                    </div>
                    <Activity className="w-8 h-8 text-primary/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">تأیید امروز</p>
                      <p className="text-2xl font-bold text-green-600">{stats.approvedToday}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500 animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">رد امروز</p>
                      <p className="text-2xl font-bold text-red-600">{stats.rejectedToday}</p>
                    </div>
                    <X className="w-8 h-8 text-red-500/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500 animate-fade-in">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">کل پردازش</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalProcessed}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Payments */}
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  پرداخت‌های در انتظار بررسی
                </CardTitle>
                <CardDescription>
                  بررسی و تأیید پرداخت‌های آپلود شده
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">پرداختی برای بررسی وجود ندارد</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-all duration-200 hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <h3 className="font-semibold text-foreground">
                                سفارش #{order.id.slice(0, 8)}
                              </h3>
                              {getStatusBadge(order.workflow_status)}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleOrderExpansion(order.id)}
                                disabled={loadingOrderItems.has(order.id)}
                                className="gap-1"
                              >
                                {loadingOrderItems.has(order.id) ? (
                                  <>
                                    <Clock size={16} className="animate-spin" />
                                    بارگذاری...
                                  </>
                                ) : expandedOrders.has(order.id) ? (
                                  <>
                                    <ChevronUp size={16} />
                                    مخفی کردن جزئیات
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown size={16} />
                                    نمایش جزئیات
                                  </>
                                )}
                              </Button>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <UserIcon className="w-4 h-4" />
                                {order.pharmacy.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.created_at).toLocaleDateString('fa-IR')}
                              </span>
                              {order.invoice_amount && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {formatCurrency(order.invoice_amount)} تومان
                                </span>
                              )}
                            </div>
                            {order.payment_date && (
                              <p className="text-sm text-muted-foreground">
                                تاریخ پرداخت: {new Date(order.payment_date).toLocaleDateString('fa-IR')}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Order Items Details */}
                        {expandedOrders.has(order.id) && order.order_items && order.order_items.length > 0 && (
                          <div className="mb-4 p-4 bg-muted/30 rounded-lg">
                            <h4 className="font-medium mb-3">جزئیات سفارش</h4>
                            <div className="space-y-2">
                              {order.order_items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center p-2 bg-background rounded border">
                                  <div>
                                    <span className="font-medium">{item.drug_name}</span>
                                    <span className="text-sm text-muted-foreground ml-2">({item.drug_brand})</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm">تعداد: {item.quantity}</div>
                                    <div className="text-sm">قیمت واحد: {formatCurrency(item.unit_price || 0)} تومان</div>
                                    <div className="font-medium">کل: {formatCurrency(item.total_price || 0)} تومان</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Total */}
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">جمع کل سفارش:</span>
                                <span className="font-bold text-lg">
                                  {formatCurrency(order.invoice_amount || 0)} تومان
                                </span>
                              </div>
                            </div>

                            {/* Pricing Notes */}
                            {order.pricing_notes && (
                              <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                                <strong>یادداشت قیمت‌گذاری:</strong> {order.pricing_notes}
                              </div>
                            )}
                          </div>
                        )}

                        {order.payment_proof_url && (
                          <div className="space-y-3">
                            {/* Receipt Image */}
                            <div className="bg-muted/50 rounded-lg p-4">
                              <h5 className="font-medium mb-2">رسید پرداخت:</h5>
                              <img 
                                src={order.payment_proof_url} 
                                alt="رسید پرداخت"
                                className="max-w-full h-auto max-h-96 rounded-lg border border-border shadow-sm mx-auto block"
                              />
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="default" 
                                    size="sm" 
                                    className="gap-1"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <CheckCircle size={16} />
                                    تایید پرداخت
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>تایید پرداخت</DialogTitle>
                                    <DialogDescription>
                                      پرداخت این سفارش تایید و به مدیر بارمان ارسال خواهد شد
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="approve-notes">توضیحات تایید (اجباری)</Label>
                                      <Textarea
                                        id="approve-notes"
                                        placeholder="توضیحات خود را در مورد تایید پرداخت وارد کنید..."
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        className="mt-2"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button 
                                      onClick={() => handleApprovePayment(order.id)}
                                      disabled={processingOrderId === order.id || !reviewNotes.trim()}
                                    >
                                      {processingOrderId === order.id ? "در حال پردازش..." : "تایید پرداخت"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    className="gap-1"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <X size={16} />
                                    رد پرداخت
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>رد پرداخت</DialogTitle>
                                    <DialogDescription>
                                      این سفارش رد شده و بسته خواهد شد
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="reject-notes">دلیل رد (اجباری)</Label>
                                      <Textarea
                                        id="reject-notes"
                                        placeholder="دلیل رد پرداخت را وارد کنید..."
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        className="mt-2"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button 
                                      variant="destructive"
                                      onClick={() => handleRejectPayment(order.id)}
                                      disabled={processingOrderId === order.id || !reviewNotes.trim()}
                                    >
                                      {processingOrderId === order.id ? "در حال پردازش..." : "رد پرداخت"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="gap-1"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <AlertCircle size={16} />
                                    درخواست اصلاح
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>درخواست اصلاح پرداخت</DialogTitle>
                                    <DialogDescription>
                                      سفارش به حسابدار داروخانه برگردانده خواهد شد تا پرداخت اصلاح شود
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="revision-notes">دلیل درخواست اصلاح (اجباری)</Label>
                                      <Textarea
                                        id="revision-notes"
                                        placeholder="دلیل درخواست اصلاح پرداخت را وارد کنید..."
                                        value={reviewNotes}
                                        onChange={(e) => setReviewNotes(e.target.value)}
                                        className="mt-2"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button 
                                      variant="outline"
                                      onClick={() => handleRequestRevision(order.id)}
                                      disabled={processingOrderId === order.id || !reviewNotes.trim()}
                                    >
                                      {processingOrderId === order.id ? "در حال پردازش..." : "درخواست اصلاح"}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        )}
                        
                        {!order.payment_proof_url && (
                          <div className="text-center py-4 text-muted-foreground">
                            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>رسید پرداخت آپلود نشده</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  تاریخچه پرداخت‌ها
                </CardTitle>
                <CardDescription>
                  تاریخچه پرداخت‌های تایید شده و رد شده
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">در حال بارگذاری...</p>
                  </div>
                ) : historyOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">تاریخچه‌ای موجود نیست</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historyOrders.map((order) => (
                      <div key={order.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-4">
                            <h3 className="font-semibold">سفارش #{order.id.slice(0, 8)}</h3>
                            {getStatusBadge(order.workflow_status)}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(order.updated_at).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{order.pharmacy.name}</span>
                          {order.invoice_amount && (
                            <span>{formatCurrency(order.invoice_amount)} تومان</span>
                          )}
                        </div>
                        {order.payment_rejection_reason && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <strong>دلیل:</strong> {order.payment_rejection_reason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    آمار کلی
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>کل پرداخت‌های پردازش شده:</span>
                      <span className="font-bold">{stats.totalProcessed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>تایید شده امروز:</span>
                      <span className="font-bold text-green-600">{stats.approvedToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>رد شده امروز:</span>
                      <span className="font-bold text-red-600">{stats.rejectedToday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>در انتظار بررسی:</span>
                      <span className="font-bold text-primary">{stats.pendingPayments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    عملکرد
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>میانگین پردازش روزانه:</span>
                      <span className="font-bold">
                        {stats.totalProcessed > 0 ? Math.round(stats.totalProcessed / 30) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>نرخ تایید:</span>
                      <span className="font-bold text-green-600">
                        {stats.totalProcessed > 0 
                          ? `${Math.round((stats.approvedToday / (stats.approvedToday + stats.rejectedToday || 1)) * 100)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="block md:hidden">
        <MobileBottomNav 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole="barman_accountant"
        />
      </div>
    </div>
  );
};

export default BarmanAccountantDashboard;