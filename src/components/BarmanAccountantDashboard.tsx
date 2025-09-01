import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Eye, Receipt, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  created_at: string;
  status: string;
  workflow_status: string;
  total_items: number;
  notes?: string;
  payment_proof_url?: string;
  payment_date?: string;
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
  const [loading, setLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacies!inner(name, user_id)
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
      // Update order status back to invoice_issued
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          workflow_status: 'invoice_issued',
          payment_proof_url: null,
          payment_date: null
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
          notes: `Payment rejected: ${reviewNotes}`
        });

      toast({
        title: "موفق",
        description: "پرداخت رد شد و به داروخانه برگردانده شد",
      });

      setReviewNotes('');
      setSelectedOrder(null);
      fetchOrders();
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
      default:
        return <Badge variant="outline">{status}</Badge>;
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
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">پنل حسابدار بارمان</h1>
              <p className="text-muted-foreground">بررسی و تایید پرداخت‌ها</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              خروج
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نیازمند بررسی</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter(o => o.workflow_status === 'payment_uploaded').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تایید شده</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter(o => o.workflow_status === 'payment_verified').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کل سفارشات</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>پرداخت‌های نیازمند بررسی</CardTitle>
            <CardDescription>
              بررسی رسیدهای پرداخت آپلود شده توسط داروخانه‌ها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">هیچ پرداختی برای بررسی وجود ندارد</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">سفارش #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          داروخانه: {order.pharmacy.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          تاریخ: {new Date(order.created_at).toLocaleDateString('fa-IR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          تعداد اقلام: {order.total_items}
                        </p>
                        {order.payment_date && (
                          <p className="text-sm text-muted-foreground">
                            تاریخ پرداخت: {new Date(order.payment_date).toLocaleDateString('fa-IR')}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(order.workflow_status)}
                    </div>

                    {order.payment_proof_url && (
                      <div className="mt-4 flex gap-2">
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
                              >
                                {processingOrderId === order.id ? (
                                  <Clock size={16} className="animate-spin ml-1" />
                                ) : null}
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BarmanAccountantDashboard;