import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  X, 
  RotateCcw, 
  Clock, 
  CreditCard, 
  History, 
  BarChart3, 
  Activity, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Calendar, 
  User as UserIcon,
  FileText,
  Receipt,
  Image
} from 'lucide-react';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';

// Order item interface
interface OrderItem {
  id: string;
  drug_id: string;
  drug_name: string;
  drug_brand: string;
  drug_type?: string;
  company_name?: string;
  package_count?: number;
  irc?: string;
  gtin?: string;
  erx_code?: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
}

// Order interface
interface Order {
  id: string;
  pharmacy_id: string;
  workflow_status: string;
  status: string;
  invoice_amount?: number;
  payment_proof_url?: string;
  payment_date?: string;
  notes?: string;
  pricing_notes?: string;
  total_items: number;
  created_at: string;
  updated_at: string;
  pharmacy: {
    name: string;
  };
  order_items: OrderItem[];
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
          pharmacies(name)
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
      const ordersWithPharmacy = (data || []).map((order: any) => ({
        ...order,
        pharmacy: { name: order.pharmacies?.name || 'نامشخص' },
        order_items: [] as OrderItem[],
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
          pharmacies(name)
        `)
        .in('workflow_status', ['payment_verified', 'payment_rejected'])
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      const ordersWithPharmacy = (data || []).map((order: any) => ({
        ...order,
        pharmacy: { name: order.pharmacies?.name || 'نامشخص' },
        order_items: [] as OrderItem[]
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
      // Fetch pending payments count
      const { count: pendingCount } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('workflow_status', 'payment_uploaded');
      
      // Fetch approved today
      const today = new Date().toISOString().split('T')[0];
      const { count: approvedToday } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('workflow_status', 'payment_verified')
        .gte('updated_at', today);
      
      // Fetch rejected today
      const { count: rejectedToday } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('workflow_status', 'payment_rejected')
        .gte('updated_at', today);
      
      // Fetch total processed
      const { count: totalProcessed } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .in('workflow_status', ['payment_verified', 'payment_rejected']);
      
      setStats({
        pendingPayments: pendingCount || 0,
        approvedToday: approvedToday || 0,
        rejectedToday: rejectedToday || 0,
        totalProcessed: totalProcessed || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    try {
      setLoadingOrderItems(prev => new Set([...prev, orderId]));
      
      // Use a direct SQL query since there's no foreign key relationship
      const { data: items, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;

      // Get drug details separately
      const drugIds = items?.map(item => item.drug_id) || [];
      const { data: drugs, error: drugsError } = await supabase
        .from('chemical_drugs')
        .select('id, full_brand_name, irc')
        .in('id', drugIds);

      if (drugsError) throw drugsError;

      // Get pricing information
      const { data: pricing, error: pricingError } = await supabase
        .from('order_item_pricing')
        .select('*')
        .eq('order_id', orderId);

      if (pricingError) {
        console.error('Error fetching pricing:', pricingError);
      }

      const enhancedItems = (items || []).map((item: any) => {
        const drugInfo = drugs?.find(d => d.id === item.drug_id);
        const priceInfo = pricing?.find(p => p.drug_id === item.drug_id);
        return {
          id: item.id,
          drug_id: item.drug_id,
          drug_name: drugInfo?.full_brand_name || 'نام محصول',
          drug_brand: drugInfo?.irc || 'کد IRC',
          quantity: item.quantity,
          unit_price: priceInfo?.unit_price || 0,
          total_price: priceInfo?.total_price || 0
        };
      });

      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, order_items: enhancedItems }
            : order
        )
      );
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
    const newExpanded = new Set(expandedOrders);
    
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
      
      // Fetch order items if not already loaded
      const order = orders.find(o => o.id === orderId);
      if (order && (!order.order_items || order.order_items.length === 0)) {
        fetchOrderItems(orderId);
      }
    }
    
    setExpandedOrders(newExpanded);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fa-IR').format(amount);
  };

  const handleApprovePayment = async (orderId: string) => {
    if (!reviewNotes.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً توضیحات تایید را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingOrderId(orderId);
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          workflow_status: 'payment_verified',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Log approval
      const { error: logError } = await supabase
        .from('order_approvals')
        .insert({
          order_id: orderId,
          user_id: user.id,
          from_status: 'payment_uploaded',
          to_status: 'payment_verified',
          notes: reviewNotes
        });

      if (logError) console.error('Error logging approval:', logError);

      // Update local state
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      setReviewNotes('');
      setSelectedOrder(null);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingPayments: prev.pendingPayments - 1,
        approvedToday: prev.approvedToday + 1,
        totalProcessed: prev.totalProcessed + 1
      }));

      toast({
        title: "موفق",
        description: "پرداخت با موفقیت تایید شد",
      });
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
        description: "لطفاً دلیل درخواست اصلاح را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingOrderId(orderId);
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          workflow_status: 'invoice_issued',
          payment_rejection_reason: reviewNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Log revision request
      const { error: logError } = await supabase
        .from('order_approvals')
        .insert({
          order_id: orderId,
          user_id: user.id,
          from_status: 'payment_uploaded',
          to_status: 'invoice_issued',
          notes: reviewNotes
        });

      if (logError) console.error('Error logging revision:', logError);

      // Update local state
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      setReviewNotes('');
      setSelectedOrder(null);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingPayments: prev.pendingPayments - 1
      }));

      toast({
        title: "موفق",
        description: "درخواست اصلاح ارسال شد",
      });
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast({
        title: "خطا",
        description: "خطا در ارسال درخواست اصلاح",
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
        description: "لطفاً دلیل رد پرداخت را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingOrderId(orderId);
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          workflow_status: 'payment_rejected',
          payment_rejection_reason: reviewNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Log rejection
      const { error: logError } = await supabase
        .from('order_approvals')
        .insert({
          order_id: orderId,
          user_id: user.id,
          from_status: 'payment_uploaded',
          to_status: 'payment_rejected',
          notes: reviewNotes
        });

      if (logError) console.error('Error logging rejection:', logError);

      // Update local state
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      setReviewNotes('');
      setSelectedOrder(null);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingPayments: prev.pendingPayments - 1,
        rejectedToday: prev.rejectedToday + 1,
        totalProcessed: prev.totalProcessed + 1
      }));

      toast({
        title: "موفق",
        description: "پرداخت رد شد",
      });
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      onAuthChange(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline" } } = {
      'payment_uploaded': { label: 'آپلود شده', variant: 'outline' },
      'payment_verified': { label: 'تایید شده', variant: 'default' },
      'payment_rejected': { label: 'رد شده', variant: 'destructive' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Mobile Header */}
      <MobileHeader 
        user={user} 
        onSignOut={handleSignOut}
        pharmacy={{ name: "حسابدار بارمان" }}
        userRole="barman_accountant"
      />

      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between p-6 bg-background/80 backdrop-blur-sm border-b sticky top-0 z-40">
        <div>
          <h1 className="text-2xl font-bold text-foreground">پنل حسابدار بارمان</h1>
          <p className="text-muted-foreground">بررسی و تایید پرداخت‌ها</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">خوش آمدید</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            خروج
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 pb-20 md:pb-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
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
                      <Card key={order.id} className="hover:shadow-md transition-all duration-200 animate-fade-in">
                        <CardContent className="p-4">
                          {/* Order Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-foreground">
                                  سفارش #{order.id.slice(0, 8)}
                                </h3>
                                {getStatusBadge(order.workflow_status)}
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <UserIcon className="w-4 h-4" />
                                  {order.pharmacy.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(order.created_at).toLocaleDateString('fa-IR')}
                                </span>
                                {order.invoice_amount && (
                                  <span className="flex items-center gap-1 font-medium text-primary">
                                    <DollarSign className="w-4 h-4" />
                                    {formatCurrency(order.invoice_amount)} تومان
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                            {/* View Order Details Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleOrderExpansion(order.id)}
                              disabled={loadingOrderItems.has(order.id)}
                              className="gap-2"
                            >
                              {loadingOrderItems.has(order.id) ? (
                                <>
                                  <Clock size={16} className="animate-spin" />
                                  بارگذاری...
                                </>
                              ) : (
                                <>
                                  <FileText size={16} />
                                  جزئیات سفارش
                                </>
                              )}
                            </Button>

                            {/* View Invoice Button */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-2"
                                  onClick={() => {
                                    // Fetch order items if not already loaded
                                    if (!order.order_items || order.order_items.length === 0) {
                                      fetchOrderItems(order.id);
                                    }
                                  }}
                                >
                                  <Receipt size={16} />
                                  فاکتور
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>فاکتور سفارش #{order.id.slice(0, 8)}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="bg-muted/30 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium">شماره سفارش:</span>
                                        <p>#{order.id.slice(0, 8)}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">داروخانه:</span>
                                        <p>{order.pharmacy.name}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">تاریخ سفارش:</span>
                                        <p>{new Date(order.created_at).toLocaleDateString('fa-IR')}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">مبلغ کل:</span>
                                        <p className="font-bold text-primary">{formatCurrency(order.invoice_amount || 0)} تومان</p>
                                      </div>
                                    </div>
                                  </div>
                                  {order.order_items && order.order_items.length > 0 && (
                                    <div className="space-y-2">
                                       <h4 className="font-medium">آیتم‌های سفارش:</h4>
                                       {order.order_items.map((item) => (
                                         <div key={item.id} className="border rounded-lg p-3 bg-muted/30">
                                           <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                             <div>
                                               <span className="font-medium">نام دارو:</span> {item.drug_name}
                                             </div>
                                             <div>
                                               <span className="font-medium">نوع:</span> {item.drug_type}
                                             </div>
                                             <div>
                                               <span className="font-medium">شرکت سازنده:</span> {item.company_name}
                                             </div>
                                             <div>
                                               <span className="font-medium">تعداد:</span> {item.quantity}
                                             </div>
                                             {item.package_count && (
                                               <div>
                                                 <span className="font-medium">تعداد در بسته:</span> {item.package_count}
                                               </div>
                                             )}
                                             {item.irc && (
                                               <div>
                                                 <span className="font-medium">کد IRC:</span> {item.irc}
                                               </div>
                                             )}
                                             {item.gtin && (
                                               <div>
                                                 <span className="font-medium">کد GTIN:</span> {item.gtin}
                                               </div>
                                             )}
                                             {item.erx_code && (
                                               <div>
                                                 <span className="font-medium">کد ERX:</span> {item.erx_code}
                                               </div>
                                             )}
                                           </div>
                                         </div>
                                       ))}
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* View Payment Receipt Button */}
                            {order.payment_proof_url && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="gap-2">
                                    <Image size={16} />
                                    رسید پرداخت
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>رسید پرداخت سفارش #{order.id.slice(0, 8)}</DialogTitle>
                                  </DialogHeader>
                                  <div className="flex justify-center">
                                    <img 
                                      src={order.payment_proof_url} 
                                      alt="رسید پرداخت"
                                      className="max-w-full h-auto max-h-[70vh] rounded-lg border border-border shadow-sm"
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>

                          {/* Expanded Order Details */}
                          {expandedOrders.has(order.id) && order.order_items && order.order_items.length > 0 && (
                            <div className="mb-4 p-4 bg-muted/30 rounded-lg animate-accordion-down">
                               <h4 className="font-medium mb-3">جزئیات اقلام سفارش:</h4>
                               <div className="space-y-3">
                                 {order.order_items.map((item) => (
                                   <div key={item.id} className="border rounded-lg p-3 bg-muted/30">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                       <div>
                                         <span className="font-medium">نام دارو:</span> {item.drug_name}
                                       </div>
                                       <div>
                                         <span className="font-medium">نوع:</span> {item.drug_type}
                                       </div>
                                       <div>
                                         <span className="font-medium">شرکت سازنده:</span> {item.company_name}
                                       </div>
                                       <div>
                                         <span className="font-medium">تعداد:</span> {item.quantity}
                                       </div>
                                       {item.package_count && (
                                         <div>
                                           <span className="font-medium">تعداد در بسته:</span> {item.package_count}
                                         </div>
                                       )}
                                       {item.irc && (
                                         <div>
                                           <span className="font-medium">کد IRC:</span> {item.irc}
                                         </div>
                                       )}
                                       {item.gtin && (
                                         <div>
                                           <span className="font-medium">کد GTIN:</span> {item.gtin}
                                         </div>
                                       )}
                                       {item.erx_code && (
                                         <div>
                                           <span className="font-medium">کد ERX:</span> {item.erx_code}
                                         </div>
                                       )}
                                     </div>
                                   </div>
                                 ))}
                              </div>
                              

                              {order.pricing_notes && (
                                <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                                  <strong>یادداشت قیمت‌گذاری:</strong> {order.pricing_notes}
                                </div>
                              )}
                            </div>
                          )}
                            
                          {/* Review Actions */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-4 border-t">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="default" 
                                  size="sm" 
                                  className="gap-2 bg-green-600 hover:bg-green-700"
                                  disabled={processingOrderId === order.id}
                                >
                                  <CheckCircle size={16} />
                                  تأیید پرداخت
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>تأیید پرداخت</DialogTitle>
                                  <DialogDescription>
                                    آیا از تأیید پرداخت این سفارش اطمینان دارید؟
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Textarea
                                    placeholder="یادداشت تأیید (اختیاری)"
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                  />
                                </div>
                                <DialogFooter>
                                  <Button 
                                    onClick={() => handleApprovePayment(order.id)}
                                    disabled={processingOrderId === order.id}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {processingOrderId === order.id ? "در حال پردازش..." : "تأیید پرداخت"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                                  disabled={processingOrderId === order.id}
                                >
                                  <RotateCcw size={16} />
                                  درخواست اصلاح
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>درخواست اصلاح پرداخت</DialogTitle>
                                  <DialogDescription>
                                    از داروخانه درخواست اصلاح رسید پرداخت کنید
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Textarea
                                    placeholder="دلیل درخواست اصلاح را بنویسید..."
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                  />
                                </div>
                                <DialogFooter>
                                  <Button 
                                    onClick={() => handleRequestRevision(order.id)}
                                    disabled={processingOrderId === order.id || !reviewNotes.trim()}
                                    variant="outline"
                                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                                  >
                                    {processingOrderId === order.id ? "در حال پردازش..." : "ارسال درخواست"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-2 border-red-500 text-red-600 hover:bg-red-50"
                                  disabled={processingOrderId === order.id}
                                >
                                  <X size={16} />
                                  رد پرداخت
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>رد پرداخت</DialogTitle>
                                  <DialogDescription>
                                    آیا از رد پرداخت این سفارش اطمینان دارید؟
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Textarea
                                    placeholder="دلیل رد پرداخت را بنویسید..."
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                  />
                                </div>
                                <DialogFooter>
                                  <Button 
                                    onClick={() => handleRejectPayment(order.id)}
                                    disabled={processingOrderId === order.id || !reviewNotes.trim()}
                                    variant="outline"
                                    className="border-red-500 text-red-600 hover:bg-red-50"
                                  >
                                    {processingOrderId === order.id ? "در حال پردازش..." : "رد پرداخت"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  تاریخچه پرداخت‌ها
                </CardTitle>
                <CardDescription>
                  مشاهده پرداخت‌های تایید شده و رد شده
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Clock className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
                    <span className="text-muted-foreground">در حال بارگذاری...</span>
                  </div>
                ) : historyOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">تاریخچه‌ای وجود ندارد</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historyOrders.map((order) => (
                      <div key={order.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <h3 className="font-semibold">سفارش #{order.id.slice(0, 8)}</h3>
                              {getStatusBadge(order.workflow_status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {order.pharmacy.name} • {new Date(order.updated_at).toLocaleDateString('fa-IR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  گزارشات پرداخت
                </CardTitle>
                <CardDescription>
                  آمار و گزارشات عملکرد پرداخت‌ها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">گزارشات به زودی اضافه خواهد شد</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userRole="barman_accountant"
      />
    </div>
  );
};

export default BarmanAccountantDashboard;