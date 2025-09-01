import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, Edit, Eye, RotateCcw, LogOut, Pill, ShoppingCart, UserIcon, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from '@/components/ui/theme-toggle';
import AdminPharmacies from './AdminPharmacies';
import AdminOrders from './AdminOrders';
import AdminReports from './AdminReports';
import AdminAddDrug from './AdminAddDrug';
import MobileBottomNav from './MobileBottomNav';
import MobileHeader from './MobileHeader';

interface Order {
  id: string;
  workflow_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  total_items: number;
  pharmacies: {
    name: string;
  };
}

interface BarmanManagerDashboardProps {
  user: User;
  onAuthChange: (user: User | null) => void;
}

const BarmanManagerDashboard: React.FC<BarmanManagerDashboardProps> = ({ user, onAuthChange }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'revision_bs' | 'revision_pm' | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'pharmacies' | 'reports' | 'upload'>('orders');

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onAuthChange(null);
      toast.success('با موفقیت از سیستم خارج شدید');
    } catch (error: any) {
      toast.error('خطا در خروج از سیستم');
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacies (
            name
          )
        `)
        .eq('workflow_status', 'approved_bs')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('خطا در بارگذاری سفارشات');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (orderId: string, action: 'approve' | 'reject' | 'revision_bs' | 'revision_pm') => {
    try {
      const statusMap = {
        approve: 'approved',
        reject: 'rejected',
        revision_bs: 'needs_revision_bs',
        revision_pm: 'needs_revision_pm'
      };

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          workflow_status: statusMap[action],
          notes: actionNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Record approval action
      const { error: approvalError } = await supabase
        .from('order_approvals')
        .insert({
          order_id: orderId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          from_status: selectedOrder?.workflow_status || 'approved_bs',
          to_status: statusMap[action],
          notes: actionNotes || null
        });

      if (approvalError) throw approvalError;

      toast.success('وضعیت سفارش با موفقیت به‌روزرسانی شد');
      setIsDialogOpen(false);
      setActionNotes("");
      setSelectedOrder(null);
      setPendingAction(null);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('خطا در به‌روزرسانی سفارش');
    }
  };

  const openActionDialog = (order: Order, action: 'approve' | 'reject' | 'revision_bs' | 'revision_pm') => {
    setSelectedOrder(order);
    setPendingAction(action);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    return <Badge variant="secondary">آماده تایید نهایی</Badge>;
  };

  const getActionLabel = () => {
    switch (pendingAction) {
      case 'approve': return 'تایید نهایی سفارش';
      case 'reject': return 'رد سفارش';
      case 'revision_bs': return 'ارجاع به کارمند بارمان';
      case 'revision_pm': return 'ارجاع به مدیر داروخانه';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Pill className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const OrdersTab = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">هیچ سفارشی برای تایید نهایی وجود ندارد</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">سفارش #{order.id.slice(0, 8)}</CardTitle>
                  <CardDescription>
                    داروخانه: {order.pharmacies?.name} | تاریخ: {new Date(order.created_at).toLocaleDateString('fa-IR')}
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
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      مشاهده
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => openActionDialog(order, 'approve')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      تایید نهایی
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openActionDialog(order, 'revision_bs')}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      ارجاع به کارمند
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openActionDialog(order, 'revision_pm')}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      ارجاع به داروخانه
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => openActionDialog(order, 'reject')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      رد
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Mobile Header */}
      <div className="mobile-only">
        <MobileHeader 
          user={user}
          pharmacy={null}
          userRole="barman_manager"
          onSignOut={handleSignOut}
        />
      </div>

      {/* Desktop Header */}
      <header className="desktop-only border-b border-border/60 bg-card/90 backdrop-blur-lg shadow-soft">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
                <Pill className="h-7 w-7 text-primary" />
                <div className="absolute -bottom-1 -right-1 p-1 bg-secondary rounded-full">
                  <ShoppingCart className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gradient">پنل مدیریت بارمان</h1>
                <p className="text-sm text-muted-foreground mt-1">مدیر: {user.email}</p>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 pb-20 md:pb-8">
        {/* Desktop Navigation */}
        <div className="desktop-only mb-8">
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-2 border border-border/60 shadow-soft">
            <div className="flex flex-wrap gap-1">
              <Button
                variant={activeTab === 'orders' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('orders')}
                className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === 'orders' 
                    ? 'btn-primary shadow-medium' 
                    : 'hover:bg-muted/60'
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">سفارشات</span>
              </Button>
              <Button
                variant={activeTab === 'pharmacies' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('pharmacies')}
                className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === 'pharmacies' 
                    ? 'btn-primary shadow-medium' 
                    : 'hover:bg-muted/60'
                }`}
              >
                <UserIcon className="h-5 w-5" />
                <span className="font-medium">داروخانه‌ها</span>
              </Button>
              <Button
                variant={activeTab === 'reports' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('reports')}
                className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === 'reports' 
                    ? 'btn-primary shadow-medium' 
                    : 'hover:bg-muted/60'
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="font-medium">گزارشات</span>
              </Button>
              <Button
                variant={activeTab === 'upload' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('upload')}
                className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === 'upload' 
                    ? 'btn-primary shadow-medium' 
                    : 'hover:bg-muted/60'
                }`}
              >
                <Pill className="h-5 w-5" />
                <span className="font-medium">افزودن دارو</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in-50 duration-500 mobile-scroll">
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'pharmacies' && <AdminPharmacies />}
          {activeTab === 'reports' && <AdminReports />}
          {activeTab === 'upload' && <AdminAddDrug />}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userRole="barman_manager"
      />

      {/* Order Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionLabel()}</DialogTitle>
            <DialogDescription>
              سفارش #{selectedOrder?.id.slice(0, 8)} - {selectedOrder?.pharmacies?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="یادداشت (اختیاری)"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              انصراف
            </Button>
            <Button onClick={() => selectedOrder && pendingAction && handleOrderAction(selectedOrder.id, pendingAction)}>
              تایید
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BarmanManagerDashboard;