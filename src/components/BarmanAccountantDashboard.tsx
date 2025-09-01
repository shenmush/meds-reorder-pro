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
import { Eye, Receipt, CheckCircle, Clock, AlertCircle, X, CreditCard, History, BarChart3, TrendingUp, Activity, DollarSign, Calendar, User as UserIcon, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import MobileBottomNav from '@/components/MobileBottomNav';

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
  pharmacy: {
    name: string;
  };
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
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacies!inner(name)
        `)
        .eq('workflow_status', 'payment_uploaded')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const ordersWithPharmacy = (data || []).map(order => ({
        ...order,
        pharmacy: { name: order.pharmacies.name }
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

  const handleApprovePayment = async (orderId: string) => {
    setProcessingOrderId(orderId);
    try {
      // Update order status
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
          notes: reviewNotes || 'Payment verified by barman accountant'
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
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">پنل حسابدار بارمان</h1>
              <p className="text-sm text-muted-foreground">مدیریت پرداخت‌ها و مالی</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button onClick={handleSignOut} variant="outline" size="sm" className="hidden md:flex">
              <LogOut className="w-4 h-4 ml-2" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
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
                                  {order.invoice_amount.toLocaleString()} تومان
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

                        {order.payment_proof_url && (
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="gap-1">
                                  <Eye size={16} />
                                  مشاهده رسید
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>رسید پرداخت سفارش #{order.id.slice(0, 8)}</DialogTitle>
                                  <DialogDescription>
                                    داروخانه: {order.pharmacy.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4">
                                  <img 
                                    src={order.payment_proof_url} 
                                    alt="Payment proof" 
                                    className="max-w-full h-auto rounded-lg border"
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>

                            {order.workflow_status === 'payment_uploaded' && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="default" 
                                    size="sm" 
                                    disabled={processingOrderId === order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className="gap-1"
                                  >
                                    {processingOrderId === order.id ? (
                                      <Clock size={16} className="animate-spin" />
                                    ) : (
                                      <CheckCircle size={16} />
                                    )}
                                    بررسی پرداخت
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>بررسی پرداخت</DialogTitle>
                                    <DialogDescription>
                                      آیا رسید پرداخت معتبر است؟
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="mt-4">
                                    <Label htmlFor="review-notes">یادداشت (اختیاری)</Label>
                                    <Textarea
                                      id="review-notes"
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      placeholder="یادداشت‌های مربوط به بررسی..."
                                      className="mt-2"
                                    />
                                  </div>
                                  <DialogFooter className="gap-2">
                                    <Button
                                      variant="destructive"
                                      onClick={() => selectedOrder && handleRejectPayment(selectedOrder.id)}
                                      disabled={processingOrderId === selectedOrder?.id}
                                      className="gap-1"
                                    >
                                      <X size={16} />
                                      رد پرداخت
                                    </Button>
                                    <Button
                                      onClick={() => selectedOrder && handleApprovePayment(selectedOrder.id)}
                                      disabled={processingOrderId === selectedOrder?.id}
                                      className="gap-1"
                                    >
                                      <CheckCircle size={16} />
                                      تایید پرداخت
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  تاریخچه پرداخت‌ها
                </CardTitle>
                <CardDescription>
                  پرداخت‌های پردازش شده
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">در حال بارگذاری...</p>
                  </div>
                ) : historyOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">تاریخچه‌ای وجود ندارد</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historyOrders.map((order) => (
                      <div key={order.id} className="border border-border rounded-lg p-4 opacity-75 hover:opacity-100 transition-opacity">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-4">
                              <h3 className="font-medium text-foreground">
                                سفارش #{order.id.slice(0, 8)}
                              </h3>
                              {getStatusBadge(order.workflow_status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{order.pharmacy.name}</span>
                              <span>{new Date(order.updated_at).toLocaleDateString('fa-IR')}</span>
                              {order.invoice_amount && (
                                <span>{order.invoice_amount.toLocaleString()} تومان</span>
                              )}
                            </div>
                            {order.payment_rejection_reason && (
                              <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
                                دلیل رد: {order.payment_rejection_reason}
                              </p>
                            )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    آمار کلی
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">کل پرداخت‌های پردازش شده</span>
                    <span className="font-bold text-green-600">{stats.totalProcessed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">در انتظار بررسی</span>
                    <span className="font-bold text-orange-600">{stats.pendingPayments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">نرخ تأیید</span>
                    <span className="font-bold text-primary">
                      {stats.totalProcessed > 0 
                        ? `${Math.round((stats.totalProcessed / (stats.totalProcessed + stats.pendingPayments)) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    عملکرد امروز
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">تأیید شده امروز</span>
                    <span className="font-bold text-green-600">{stats.approvedToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">رد شده امروز</span>
                    <span className="font-bold text-red-600">{stats.rejectedToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">کل پردازش امروز</span>
                    <span className="font-bold text-primary">{stats.approvedToday + stats.rejectedToday}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Mobile Navigation */}
      <MobileBottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        userRole="barman_accountant"
      />
    </div>
  );
};

export default BarmanAccountantDashboard;