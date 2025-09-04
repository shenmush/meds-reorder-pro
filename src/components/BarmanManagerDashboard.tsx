import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, Edit, Eye, RotateCcw, LogOut, Pill, ShoppingCart, UserIcon, BarChart3, Calculator, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ThemeToggle } from '@/components/ui/theme-toggle';
import AdminPharmacies from './AdminPharmacies';
import AdminOrders from './AdminOrders';
import AdminReports from './AdminReports';
import AdminAddDrug from './AdminAddDrug';
import MobileBottomNav from './MobileBottomNav';
import MobileHeader from './MobileHeader';

interface OrderItem {
  id: string;
  quantity: number;
  drug_id: string;
  drug_name?: string;
  drug_type?: string;
  unit_price?: number;
  total_price?: number;
}

interface Order {
  id: string;
  workflow_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  total_items: number;
  invoice_amount?: number;
  pharmacies: {
    name: string;
  };
  items?: OrderItem[];
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
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

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
        .in('workflow_status', ['approved_bs', 'approved'])
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

  const fetchOrderItems = async (orderId: string) => {
    try {
      console.log('Fetching order items for order:', orderId);
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          drug_id
        `)
        .eq('order_id', orderId);

      if (error) {
        console.error('Error fetching order items:', error);
        throw error;
      }

      console.log('Order items data:', data);

      if (!data || data.length === 0) {
        console.log('No order items found');
        return [];
      }

      // Fetch drug details for each item with complete information
      const itemsWithDrugs = await Promise.all((data || []).map(async (item) => {
        console.log('Processing item:', item);
        // Try to find the drug in each table with complete details
        const [chemical, medical, natural] = await Promise.all([
          supabase.from('chemical_drugs').select('full_brand_name, license_owner_company_name, package_count, irc, gtin, erx_code').eq('id', item.drug_id).maybeSingle(),
          supabase.from('medical_supplies').select('title, license_owner_company_name, package_count, irc, gtin, erx_code').eq('id', item.drug_id).maybeSingle(),
          supabase.from('natural_products').select('full_en_brand_name, license_owner_name, package_count, irc, gtin, erx_code').eq('id', item.drug_id).maybeSingle()
        ]);

        console.log('Drug lookup results:', { chemical: chemical.data, medical: medical.data, natural: natural.data });

        let drugName = 'نامشخص';
        let drugType = 'نامشخص';
        let companyName = 'نامشخص';
        let packageCount = null;
        let irc = null;
        let gtin = null;
        let erxCode = null;

        if (chemical.data) {
          drugName = chemical.data.full_brand_name;
          drugType = 'دارو';
          companyName = chemical.data.license_owner_company_name || 'نامشخص';
          packageCount = chemical.data.package_count;
          irc = chemical.data.irc;
          gtin = chemical.data.gtin;
          erxCode = chemical.data.erx_code;
        } else if (medical.data) {
          drugName = medical.data.title;
          drugType = 'تجهیزات پزشکی';
          companyName = medical.data.license_owner_company_name || 'نامشخص';
          packageCount = medical.data.package_count;
          irc = medical.data.irc;
          gtin = medical.data.gtin;
          erxCode = medical.data.erx_code;
        } else if (natural.data) {
          drugName = natural.data.full_en_brand_name;
          drugType = 'محصولات طبیعی';
          companyName = natural.data.license_owner_name || 'نامشخص';
          packageCount = natural.data.package_count;
          irc = natural.data.irc;
          gtin = natural.data.gtin;
          erxCode = natural.data.erx_code;
        }

        // Check if pricing exists
        const { data: pricingData } = await supabase
          .from('order_item_pricing')
          .select('unit_price, total_price')
          .eq('order_id', orderId)
          .eq('drug_id', item.drug_id)
          .maybeSingle();

        console.log('Pricing data for item:', item.drug_id, pricingData);

        return {
          ...item,
          drug_name: drugName,
          drug_type: drugType,
          unit_price: pricingData?.unit_price || 0,
          total_price: pricingData?.total_price || 0
        };
      }));

      console.log('Final items with drugs:', itemsWithDrugs);
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

  const openPricingDialog = async (order: Order) => {
    setSelectedOrder(order);
    if (!order.items) {
      const items = await fetchOrderItems(order.id);
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.id === order.id ? { ...o, items } : o
        )
      );
    }
    setPricingDialogOpen(true);
  };

  const savePricing = async () => {
    if (!selectedOrder || !selectedOrder.items) return;

    try {
      const totalAmount = selectedOrder.items.reduce((sum, item) => sum + (item.total_price || 0), 0);

      // Save or update pricing for each item
      const pricingPromises = selectedOrder.items.map(item => {
        if ((item.unit_price || 0) > 0) {
          return supabase
            .from('order_item_pricing')
            .upsert({
              order_id: selectedOrder.id,
              drug_id: item.drug_id,
              unit_price: item.unit_price || 0,
              total_price: item.total_price || 0
            });
        }
        return Promise.resolve();
      });

      await Promise.all(pricingPromises);

      // Update order with total amount
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          invoice_amount: totalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id);

      if (orderError) throw orderError;

      toast.success('قیمت‌گذاری با موفقیت ذخیره شد');
      setPricingDialogOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Error saving pricing:', error);
      toast.error('خطا در ذخیره قیمت‌گذاری');
    }
  };

  const updateItemPrice = (itemId: string, unitPrice: number, quantity: number) => {
    if (!selectedOrder) return;
    
    const totalPrice = unitPrice * quantity;
    
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === selectedOrder.id 
          ? {
              ...order,
              items: order.items?.map(item => 
                item.id === itemId 
                  ? { ...item, unit_price: unitPrice, total_price: totalPrice }
                  : item
              )
            }
          : order
      )
    );

    setSelectedOrder(prev => prev ? {
      ...prev,
      items: prev.items?.map(item => 
        item.id === itemId 
          ? { ...item, unit_price: unitPrice, total_price: totalPrice }
          : item
      )
    } : null);
  };

  const issueInvoice = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          workflow_status: 'invoice_issued',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Record approval action
      const { error: approvalError } = await supabase
        .from('order_approvals')
        .insert({
          order_id: orderId,
          user_id: user.id,
          from_status: 'approved_bs',
          to_status: 'invoice_issued',
          notes: 'فاکتور صادر شد'
        });

      if (approvalError) throw approvalError;

      toast.success('فاکتور با موفقیت صادر شد');
      fetchOrders();
    } catch (error) {
      console.error('Error issuing invoice:', error);
      toast.error('خطا در صدور فاکتور');
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleOrderExpansion(order.id)}
                    >
                      {expandedOrders.has(order.id) ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          بستن
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          جزئیات
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => openPricingDialog(order)}
                    >
                      <Calculator className="h-4 w-4 mr-1" />
                      قیمت‌گذاری
                    </Button>
                    {order.invoice_amount && order.invoice_amount > 0 && (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => issueInvoice(order.id)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        صدور فاکتور
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Expanded Order Details */}
                {expandedOrders.has(order.id) && order.items && (
                  <div className="mt-4 pt-4 border-t border-border/60">
                    <h4 className="font-medium mb-3">اقلام سفارش:</h4>
                    <div className="space-y-3">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="bg-muted/50 p-3 rounded-lg space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium text-foreground">{item.drug_name}</div>
                              <div className="text-sm text-muted-foreground">نوع: {item.drug_type}</div>
                              <div className="text-sm text-muted-foreground">شرکت: {item.company_name}</div>
                              {item.package_count && (
                                <div className="text-sm text-muted-foreground">تعداد در بسته: {item.package_count}</div>
                              )}
                            </div>
                            <div className="text-left">
                              <div className="font-medium">تعداد: {item.quantity}</div>
                              {item.unit_price > 0 && (
                                <>
                                  <div className="text-sm">قیمت واحد: {item.unit_price?.toLocaleString()} تومان</div>
                                  <div className="text-sm font-medium">جمع: {item.total_price?.toLocaleString()} تومان</div>
                                </>
                              )}
                            </div>
                          </div>
                          {(item.irc || item.gtin || item.erx_code) && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t border-border">
                              {item.irc && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">IRC:</span> {item.irc}
                                </div>
                              )}
                              {item.gtin && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">GTIN:</span> {item.gtin}
                                </div>
                              )}
                              {item.erx_code && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">ERX Code:</span> {item.erx_code}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {order.invoice_amount && order.invoice_amount > 0 && (
                        <div className="pt-2 mt-4 border-t border-border/60">
                          <p className="text-lg font-bold text-left">
                            مجموع کل: {order.invoice_amount.toLocaleString()} تومان
                          </p>
                        </div>
                      )}
                    </div>
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

      {/* Pricing Dialog */}
      <Dialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>قیمت‌گذاری سفارش</DialogTitle>
            <DialogDescription>
              سفارش #{selectedOrder?.id.slice(0, 8)} - {selectedOrder?.pharmacies?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder?.items && (
            <div className="space-y-4">
              {selectedOrder.items.map((item: any) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{item.drug_name}</h4>
                      <p className="text-sm text-muted-foreground">نوع: {item.drug_type}</p>
                      <p className="text-sm text-muted-foreground">شرکت: {item.company_name}</p>
                      <p className="text-sm">تعداد: {item.quantity}</p>
                      {item.package_count && (
                        <p className="text-sm text-muted-foreground">تعداد در بسته: {item.package_count}</p>
                      )}
                    </div>
                    <div className="text-left space-y-2">
                      <div>
                        <Label htmlFor={`price-${item.id}`}>قیمت واحد (تومان)</Label>
                        <Input
                          id={`price-${item.id}`}
                          type="number"
                          min="0"
                          value={item.unit_price || ''}
                          onChange={(e) => updateItemPrice(item.id, Number(e.target.value), item.quantity)}
                          placeholder="0"
                          className="w-40"
                        />
                      </div>
                      {(item.unit_price || 0) > 0 && (
                        <div className="text-sm">
                          <strong>جمع: {(item.total_price || 0).toLocaleString()} تومان</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="text-left">
                  <p className="text-lg font-bold">
                    مجموع کل: {selectedOrder.items.reduce((sum, item) => sum + (item.total_price || 0), 0).toLocaleString()} تومان
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPricingDialogOpen(false)}>
              انصراف
            </Button>
            <Button onClick={savePricing}>
              ذخیره قیمت‌گذاری
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BarmanManagerDashboard;