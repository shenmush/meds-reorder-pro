import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, Edit, Eye, LogOut, Pill, ShoppingCart, UserIcon, Building2, Users } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from '@/components/ui/theme-toggle';
import PharmacyDetails from './PharmacyDetails';
import OrdersManagement from './OrdersManagement';
import DrugList from './DrugList';
import MobileBottomNav from './MobileBottomNav';
import MobileHeader from './MobileHeader';

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
}

interface Pharmacy {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  license_number?: string;
}

interface PharmacyManagerDashboardProps {
  user: User;
  onAuthChange: (user: User | null) => void;
}

const PharmacyManagerDashboard: React.FC<PharmacyManagerDashboardProps> = ({ user, onAuthChange }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'revision' | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'pharmacy' | 'drugs'>('orders');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initializeDashboard = async () => {
      await fetchPharmacyProfile();
      await fetchOrders();
      setLoading(false);
    };
    
    initializeDashboard();
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

  const fetchPharmacyProfile = async () => {
    try {
      // Get user's pharmacy through user_roles table
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          pharmacy_id,
          pharmacies(*)
        `)
        .eq('user_id', user.id)
        .eq('role', 'pharmacy_manager')
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
        return;
      }
      
      // Set pharmacy data if user has a pharmacy role
      if (userRole?.pharmacies) {
        console.log('Pharmacy found:', userRole.pharmacies);
        setPharmacy(userRole.pharmacies as any);
      } else {
        console.log('No pharmacy found for user');
        setPharmacy(null);
      }
    } catch (error: any) {
      console.error('Error fetching pharmacy profile:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .in('workflow_status', ['pending', 'needs_revision_pm', 'approved_bs', 'needs_revision_pm_pricing', 'needs_revision_pa'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('خطا در بارگذاری سفارشات');
    }
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

      // Fetch drug details for each item
      const itemsWithDrugs = await Promise.all((data || []).map(async (item) => {
        // Try to find the drug in each table
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

  const toggleOrderExpansion = async (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    
    if (expandedOrders.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
      
      // Fetch order items if not already loaded
      const order = orders.find(o => o.id === orderId);
      if (order && !order.items) {
        const items = await fetchOrderItems(orderId);
        setOrders(prevOrders => 
          prevOrders.map(o => 
            o.id === orderId ? { ...o, items } : o
          )
        );
      }
    }
    
    setExpandedOrders(newExpanded);
  };

  const handleOrderAction = async (orderId: string, action: 'approve' | 'reject' | 'revision' | 'issue_invoice') => {
    try {
      let newStatus = '';
      
      if (selectedOrder?.workflow_status === 'approved_bs') {
        // Pricing phase actions
        const statusMap = {
          approve: 'invoice_issued',
          reject: 'rejected', 
          revision: 'needs_revision_bs'
        };
        newStatus = statusMap[action as keyof typeof statusMap];
      } else if (selectedOrder?.workflow_status === 'needs_revision_pa') {
        // Payment revision response
        const statusMap = {
          approve: 'invoice_issued',
          reject: 'rejected',
          revision: 'needs_revision_bs'
        };
        newStatus = statusMap[action as keyof typeof statusMap];
      } else {
        // Initial review phase actions
        const statusMap = {
          approve: 'approved_pm',
          reject: 'rejected',
          revision: 'needs_revision_ps'
        };
        newStatus = statusMap[action as keyof typeof statusMap];
      }

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          workflow_status: newStatus,
          notes: actionNotes || null,
          pricing_notes: selectedOrder?.workflow_status === 'approved_bs' ? actionNotes || null : undefined,
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
          from_status: selectedOrder?.workflow_status || 'pending',
          to_status: newStatus,
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

  const openActionDialog = (order: Order, action: 'approve' | 'reject' | 'revision') => {
    setSelectedOrder(order);
    setPendingAction(action);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'در انتظار بررسی', variant: 'secondary' as const },
      'needs_revision_pm': { label: 'نیاز به ویرایش مدیر', variant: 'destructive' as const },
      'approved_bs': { label: 'در انتظار قیمت‌گذاری', variant: 'default' as const },
      'needs_revision_pm_pricing': { label: 'نیاز به ویرایش قیمت‌گذاری', variant: 'destructive' as const },
      'needs_revision_pa': { label: 'نیاز به ویرایش حسابداری', variant: 'destructive' as const },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getActionLabel = () => {
    if (selectedOrder?.workflow_status === 'approved_bs' || selectedOrder?.workflow_status === 'needs_revision_pa') {
      switch (pendingAction) {
        case 'approve': return 'صدور فاکتور';
        case 'reject': return 'رد سفارش';
        case 'revision': return 'درخواست ویرایش از بارمان';
        default: return '';
      }
    } else {
      switch (pendingAction) {
        case 'approve': return 'تایید سفارش';
        case 'reject': return 'رد سفارش';
        case 'revision': return 'درخواست ویرایش';
        default: return '';
      }
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
              <p className="text-muted-foreground">هیچ سفارشی برای بررسی وجود ندارد</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">سفارش #{order.id.slice(0, 8)}</CardTitle>
                  <CardDescription>
                    تاریخ ثبت: {new Date(order.created_at).toLocaleDateString('fa-IR')}
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
                      onClick={() => toggleOrderExpansion(order.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {expandedOrders.has(order.id) ? 'بستن' : 'مشاهده'}
                    </Button>
                    
                    {(order.workflow_status === 'pending' || order.workflow_status === 'needs_revision_pm') && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openActionDialog(order, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          تایید
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openActionDialog(order, 'revision')}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          ویرایش
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => openActionDialog(order, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          رد
                        </Button>
                      </>
                    )}
                    
                    {(order.workflow_status === 'approved_bs' || order.workflow_status === 'needs_revision_pa') && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openActionDialog(order, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          صدور فاکتور
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openActionDialog(order, 'revision')}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          ویرایش
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => openActionDialog(order, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          رد
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Order Items Details */}
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
          pharmacy={pharmacy}
          userRole="pharmacy_manager"
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
                <h1 className="text-2xl font-bold text-gradient">پنل مدیر داروخانه</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {pharmacy?.name || user.email}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 pb-20 md:pb-8">
        {!pharmacy ? (
          <PharmacyDetails 
            user={user} 
            pharmacy={null} 
            onPharmacyUpdate={setPharmacy}
            userRole="pharmacy_manager"
          />
        ) : (
          <>
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
                    variant={activeTab === 'pharmacy' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('pharmacy')}
                    className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === 'pharmacy' 
                        ? 'btn-primary shadow-medium' 
                        : 'hover:bg-muted/60'
                    }`}
                  >
                    <Building2 className="h-5 w-5" />
                    <span className="font-medium">داروخانه</span>
                  </Button>
                  <Button
                    variant={activeTab === 'drugs' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('drugs')}
                    className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === 'drugs' 
                        ? 'btn-primary shadow-medium' 
                        : 'hover:bg-muted/60'
                    }`}
                  >
                    <Pill className="h-5 w-5" />
                    <span className="font-medium">فهرست داروها</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in-50 duration-500 mobile-scroll">
              {activeTab === 'orders' && (
                <OrdersManagement 
                  pharmacyId={pharmacy.id}
                  onOrderAction={handleOrderAction}
                  showActions={true}
                />
              )}
              {activeTab === 'pharmacy' && (
                <PharmacyDetails 
                  user={user} 
                  pharmacy={pharmacy} 
                  onPharmacyUpdate={setPharmacy}
                  userRole="pharmacy_manager"
                />
              )}
              {activeTab === 'drugs' && <DrugList />}
            </div>
          </>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userRole="pharmacy_manager"
      />

      {/* Order Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionLabel()}</DialogTitle>
            <DialogDescription>
              سفارش #{selectedOrder?.id.slice(0, 8)}
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

export default PharmacyManagerDashboard;