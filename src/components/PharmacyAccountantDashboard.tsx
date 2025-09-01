import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Receipt, CheckCircle, Clock, AlertCircle, XCircle, Edit } from 'lucide-react';
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
  payment_rejection_reason?: string;
  pharmacy: {
    name: string;
  };
}

interface PharmacyAccountantDashboardProps {
  user: User;
  onAuthChange: (user: User | null) => void;
}

const PharmacyAccountantDashboard: React.FC<PharmacyAccountantDashboardProps> = ({ user, onAuthChange }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
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
          pharmacies!inner(name)
        `)
        .in('workflow_status', ['invoice_issued', 'payment_rejected'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Filter orders for this user's pharmacy through user_roles
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('pharmacy_id')
        .eq('user_id', user.id)
        .eq('role', 'pharmacy_accountant')
        .single();

      const filteredOrders = (data || []).filter(order => 
        order.pharmacy_id === userRole?.pharmacy_id
      );

      const ordersWithPharmacy = filteredOrders.map(order => ({
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

  const handleFileUpload = async (orderId: string, file: File) => {
    if (!file) return;

    setUploadingOrderId(orderId);
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${orderId}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Update order with payment proof
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_proof_url: publicUrl,
          payment_date: new Date().toISOString(),
          workflow_status: 'payment_uploaded'
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Create approval record
      await supabase
        .from('order_approvals')
        .insert({
          order_id: orderId,
          user_id: user.id,
          from_status: 'invoice_issued',
          to_status: 'payment_uploaded',
          notes: 'Payment proof uploaded by pharmacy accountant'
        });

      toast({
        title: "موفق",
        description: "رسید پرداخت با موفقیت آپلود شد",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      toast({
        title: "خطا",
        description: "خطا در آپلود رسید پرداخت",
        variant: "destructive",
      });
    } finally {
      setUploadingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      // Update order status to rejected
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          workflow_status: 'rejected'
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Create approval record
      const { error: approvalError } = await supabase
        .from('order_approvals')
        .insert({
          order_id: orderId,
          user_id: user.id,
          from_status: 'invoice_issued',
          to_status: 'rejected',
          notes: 'سفارش توسط حسابدار داروخانه رد شد'
        });

      if (approvalError) throw approvalError;

      toast({
        title: "موفق",
        description: "سفارش با موفقیت رد شد",
      });
      fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: "خطا",
        description: "خطا در رد سفارش",
        variant: "destructive",
      });
    }
  };

  const handleRequestRevision = async (orderId: string) => {
    try {
      // Update order status to needs revision
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          workflow_status: 'needs_revision_pa'
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Create approval record
      const { error: approvalError } = await supabase
        .from('order_approvals')
        .insert({
          order_id: orderId,
          user_id: user.id,
          from_status: 'invoice_issued',
          to_status: 'needs_revision_pa',
          notes: 'درخواست ویرایش توسط حسابدار داروخانه'
        });

      if (approvalError) throw approvalError;

      toast({
        title: "موفق",
        description: "درخواست ویرایش ارسال شد",
      });
      fetchOrders();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast({
        title: "خطا",
        description: "خطا در درخواست ویرایش",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onAuthChange(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'invoice_issued':
        return <Badge variant="secondary" className="gap-1"><Receipt size={12} />صدور فاکتور</Badge>;
      case 'payment_uploaded':
        return <Badge variant="default" className="gap-1"><CheckCircle size={12} />رسید آپلود شده</Badge>;
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
              <h1 className="text-2xl font-bold text-foreground">پنل حسابدار داروخانه</h1>
              <p className="text-muted-foreground">مدیریت پرداخت سفارشات</p>
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
              <CardTitle className="text-sm font-medium">سفارشات نیازمند پرداخت</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter(o => o.workflow_status === 'invoice_issued').length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">رسیدهای آپلود شده</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.filter(o => o.workflow_status === 'payment_uploaded').length}</div>
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
            <CardTitle>سفارشات نیازمند پرداخت</CardTitle>
            <CardDescription>
              سفارشاتی که فاکتور آنها صادر شده و نیاز به آپلود رسید پرداخت دارند
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">هیچ سفارشی برای پرداخت وجود ندارد</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold">سفارش #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          تاریخ: {new Date(order.created_at).toLocaleDateString('fa-IR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          تعداد اقلام: {order.total_items}
                        </p>
                      </div>
                      {getStatusBadge(order.workflow_status)}
                    </div>

                    {order.workflow_status === 'payment_rejected' && (
                      <div className="mt-4 p-3 bg-destructive/10 rounded-lg">
                        <p className="text-sm font-medium text-destructive">
                          پرداخت رد شده
                        </p>
                        {order.payment_rejection_reason && (
                          <p className="text-xs text-muted-foreground mt-1">
                            دلیل: {order.payment_rejection_reason}
                          </p>
                        )}
                      </div>
                    )}

                    {order.workflow_status === 'invoice_issued' && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <Label htmlFor={`payment-${order.id}`} className="text-sm font-medium">
                            آپلود رسید پرداخت
                          </Label>
                          <div className="mt-2 flex items-center gap-2">
                            <Input
                              id={`payment-${order.id}`}
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(order.id, file);
                                }
                              }}
                              disabled={uploadingOrderId === order.id}
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={uploadingOrderId === order.id}
                              className="gap-1"
                            >
                              {uploadingOrderId === order.id ? (
                                <Clock size={16} className="animate-spin" />
                              ) : (
                                <Upload size={16} />
                              )}
                              آپلود
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            فرمت‌های مجاز: تصاویر (JPG, PNG) و PDF
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectOrder(order.id)}
                            className="gap-1"
                          >
                            <XCircle size={16} />
                            رد سفارش
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestRevision(order.id)}
                            className="gap-1"
                          >
                            <Edit size={16} />
                            درخواست ویرایش
                          </Button>
                        </div>
                      </div>
                    )}

                    {order.payment_proof_url && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium text-success">
                          ✓ رسید پرداخت آپلود شده
                        </p>
                        <p className="text-xs text-muted-foreground">
                          تاریخ آپلود: {order.payment_date ? new Date(order.payment_date).toLocaleDateString('fa-IR') : '-'}
                        </p>
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

export default PharmacyAccountantDashboard;