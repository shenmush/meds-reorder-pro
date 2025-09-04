import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, Edit, Eye, RotateCcw, LogOut, Pill, ShoppingCart, UserIcon, BarChart3, Calculator, FileText, ChevronDown, ChevronUp, History, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  company_name?: string;
  package_count?: number;
  irc?: string;
  gtin?: string;
  erx_code?: string;
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
  const [finalApprovalOrders, setFinalApprovalOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'revision_bs' | 'revision_pm' | null>(null);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAllOrders();
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

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch orders ready for final approval (approved by barman accountant)
      const { data: finalData, error: finalError } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacies (
            name
          )
        `)
        .eq('workflow_status', 'approved_bs')
        .order('created_at', { ascending: false });

      if (finalError) throw finalError;

      // Fetch all active/incomplete orders
      const { data: activeData, error: activeError } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacies (
            name
          )
        `)
        .in('workflow_status', ['pending', 'needs_revision_pm', 'needs_revision_bs', 'approved', 'approved_bs'])
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;

      // Fetch order history (all orders)
      const { data: historyData, error: historyError } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacies (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      setFinalApprovalOrders(finalData || []);
      setActiveOrders(activeData || []);
      setHistoryOrders(historyData || []);
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
      
      // Get all drug IDs from order items first
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (orderItemsError) {
        console.error('Error fetching order items:', orderItemsError);
        throw orderItemsError;
      }

      if (!orderItems || orderItems.length === 0) {
        console.log('No order items found');
        return [];
      }

      const drugIds = orderItems.map(item => item.drug_id);
      
      // Fetch all drugs and pricing data in parallel with single queries
      const [chemicalDrugs, medicalSupplies, naturalProducts, pricingData] = await Promise.all([
        supabase
          .from('chemical_drugs')
          .select('id, full_brand_name, license_owner_company_name, package_count, irc, gtin, erx_code')
          .in('id', drugIds),
        supabase
          .from('medical_supplies')
          .select('id, title, license_owner_company_name, package_count, irc, gtin, erx_code')
          .in('id', drugIds),
        supabase
          .from('natural_products')
          .select('id, full_en_brand_name, license_owner_name, package_count, irc, gtin, erx_code')
          .in('id', drugIds),
        supabase
          .from('order_item_pricing')
          .select('drug_id, unit_price, total_price')
          .eq('order_id', orderId)
      ]);

      // Create lookup maps for fast access
      const chemicalMap = new Map(chemicalDrugs.data?.map(d => [d.id, d]) || []);
      const medicalMap = new Map(medicalSupplies.data?.map(d => [d.id, d]) || []);
      const naturalMap = new Map(naturalProducts.data?.map(d => [d.id, d]) || []);
      const pricingMap = new Map(pricingData.data?.map(p => [p.drug_id, p]) || []);

      // Combine all data efficiently
      const itemsWithDrugs = orderItems.map(item => {
        const chemical = chemicalMap.get(item.drug_id);
        const medical = medicalMap.get(item.drug_id);
        const natural = naturalMap.get(item.drug_id);
        const pricing = pricingMap.get(item.drug_id);

        let drugInfo = {
          drug_name: 'نامشخص',
          drug_type: 'نامشخص',
          company_name: 'نامشخص',
          package_count: null,
          irc: null,
          gtin: null,
          erx_code: null
        };

        if (chemical) {
          drugInfo = {
            drug_name: chemical.full_brand_name,
            drug_type: 'دارو',
            company_name: chemical.license_owner_company_name || 'نامشخص',
            package_count: chemical.package_count,
            irc: chemical.irc,
            gtin: chemical.gtin,
            erx_code: chemical.erx_code
          };
        } else if (medical) {
          drugInfo = {
            drug_name: medical.title,
            drug_type: 'تجهیزات پزشکی',
            company_name: medical.license_owner_company_name || 'نامشخص',
            package_count: medical.package_count,
            irc: medical.irc,
            gtin: medical.gtin,
            erx_code: medical.erx_code
          };
        } else if (natural) {
          drugInfo = {
            drug_name: natural.full_en_brand_name,
            drug_type: 'محصولات طبیعی',
            company_name: natural.license_owner_name || 'نامشخص',
            package_count: natural.package_count,
            irc: natural.irc,
            gtin: natural.gtin,
            erx_code: natural.erx_code
          };
        }

        return {
          ...item,
          ...drugInfo,
          unit_price: pricing?.unit_price || 0,
          total_price: pricing?.total_price || 0
        };
      });

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
      const allOrders = [...finalApprovalOrders, ...activeOrders, ...historyOrders];
      const order = allOrders.find(o => o.id === orderId);
      if (order && !order.items) {
        const items = await fetchOrderItems(orderId);
        
        // Update the appropriate order list
        if (finalApprovalOrders.find(o => o.id === orderId)) {
          setFinalApprovalOrders(prevOrders => 
            prevOrders.map(o => 
              o.id === orderId ? { ...o, items } : o
            )
          );
        }
        if (activeOrders.find(o => o.id === orderId)) {
          setActiveOrders(prevOrders => 
            prevOrders.map(o => 
              o.id === orderId ? { ...o, items } : o
            )
          );
        }
        if (historyOrders.find(o => o.id === orderId)) {
          setHistoryOrders(prevOrders => 
            prevOrders.map(o => 
              o.id === orderId ? { ...o, items } : o
            )
          );
        }
      }
    }
    
    setExpandedOrders(newExpanded);
  };

  const openPricingDialog = async (order: Order) => {
    setSelectedOrder(order);
    if (!order.items) {
      const items = await fetchOrderItems(order.id);
      
      // Update the appropriate order list
      if (finalApprovalOrders.find(o => o.id === order.id)) {
        setFinalApprovalOrders(prevOrders => 
          prevOrders.map(o => 
            o.id === order.id ? { ...o, items } : o
          )
        );
      }
      if (activeOrders.find(o => o.id === order.id)) {
        setActiveOrders(prevOrders => 
          prevOrders.map(o => 
            o.id === order.id ? { ...o, items } : o
          )
        );
      }
      if (historyOrders.find(o => o.id === order.id)) {
        setHistoryOrders(prevOrders => 
          prevOrders.map(o => 
            o.id === order.id ? { ...o, items } : o
          )
        );
      }
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
      fetchAllOrders();
    } catch (error) {
      console.error('Error saving pricing:', error);
      toast.error('خطا در ذخیره قیمت‌گذاری');
    }
  };

  const updateItemPrice = (itemId: string, unitPrice: number, quantity: number) => {
    if (!selectedOrder) return;
    
    const totalPrice = unitPrice * quantity;
    
    // Update the appropriate order list
    if (finalApprovalOrders.find(o => o.id === selectedOrder.id)) {
      setFinalApprovalOrders(prevOrders => 
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
    }
    if (activeOrders.find(o => o.id === selectedOrder.id)) {
      setActiveOrders(prevOrders => 
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
    }
    if (historyOrders.find(o => o.id === selectedOrder.id)) {
      setHistoryOrders(prevOrders => 
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
    }

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
      fetchAllOrders();
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
      fetchAllOrders();
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
    const statusMap: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline" } } = {
      'pending': { label: 'در انتظار', variant: 'outline' },
      'needs_revision_pm': { label: 'نیاز به اصلاح - مدیر داروخانه', variant: 'destructive' },
      'needs_revision_bs': { label: 'نیاز به اصلاح - کارمند بارمان', variant: 'destructive' },
      'approved': { label: 'تایید مدیر داروخانه', variant: 'secondary' },
      'approved_bs': { label: 'آماده تایید نهایی', variant: 'default' },
      'invoice_issued': { label: 'فاکتور صادر شده', variant: 'secondary' },
      'rejected': { label: 'رد شده', variant: 'destructive' }
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
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

  const renderOrderCard = (order: Order, showActions: boolean = true) => (
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
            {order.invoice_amount && (
              <p className="text-sm font-medium">مبلغ فاکتور: {order.invoice_amount.toLocaleString('fa-IR')} تومان</p>
            )}
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
            {showActions && (
              <>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => openPricingDialog(order)}
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  قیمت‌گذاری
                </Button>
                {order.workflow_status === 'approved_bs' && order.invoice_amount && order.invoice_amount > 0 && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => issueInvoice(order.id)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    صدور فاکتور
                  </Button>
                )}
                {order.workflow_status === 'approved_bs' && (
                  <>
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
                      onClick={() => openActionDialog(order, 'revision_pm')}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      ارجاع به مدیر داروخانه
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
              </>
            )}
          </div>
        </div>
        
        {expandedOrders.has(order.id) && order.items && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium mb-3">جزئیات اقلام سفارش:</h4>
            <div className="space-y-3">
              {order.items.map((item) => (
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
                    {item.unit_price && item.unit_price > 0 && (
                      <>
                        <div>
                          <span className="font-medium">قیمت واحد:</span> {item.unit_price.toLocaleString('fa-IR')} تومان
                        </div>
                        <div>
                          <span className="font-medium">قیمت کل:</span> {(item.total_price || 0).toLocaleString('fa-IR')} تومان
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const FinalApprovalTab = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        {finalApprovalOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">هیچ سفارشی برای تایید نهایی وجود ندارد</p>
            </CardContent>
          </Card>
        ) : (
          finalApprovalOrders.map((order) => renderOrderCard(order, true))
        )}
      </div>
    </div>
  );

  const ActiveOrdersTab = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        {activeOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">هیچ سفارش فعالی وجود ندارد</p>
            </CardContent>
          </Card>
        ) : (
          activeOrders.map((order) => renderOrderCard(order, false))
        )}
      </div>
    </div>
  );

  const HistoryTab = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        {historyOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">هیچ سفارشی در تاریخچه وجود ندارد</p>
            </CardContent>
          </Card>
        ) : (
          historyOrders.map((order) => renderOrderCard(order, false))
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
        {/* Order Management Tabs */}
        <Tabs defaultValue="final-approval" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="final-approval" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              تایید نهایی
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2">
              <Clock className="h-4 w-4" />
              سفارشات فعال
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              تاریخچه
            </TabsTrigger>
          </TabsList>

          <TabsContent value="final-approval" className="mt-6">
            <FinalApprovalTab />
          </TabsContent>

          <TabsContent value="active" className="mt-6">
            <ActiveOrdersTab />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <HistoryTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab="orders"
        onTabChange={() => {}}
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