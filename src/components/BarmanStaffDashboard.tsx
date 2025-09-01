import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Edit, Eye, LogOut, Package, Truck, BarChart3, History, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from '@/components/ui/theme-toggle';
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
  pharmacy_name: string;
  items?: OrderItem[];
}

interface BarmanStaffDashboardProps {
  user: User;
  onAuthChange: (user: User | null) => void;
}

const BarmanStaffDashboard: React.FC<BarmanStaffDashboardProps> = ({ user, onAuthChange }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [processedOrders, setProcessedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'revision' | null>(null);
  const [activeTab, setActiveTab] = useState<'review' | 'history' | 'reports'>('review');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchOrders(),
        fetchProcessedOrders()
      ]);
      setLoading(false);
    };
    
    fetchData();
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
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacies(name)
        `)
        .in('workflow_status', ['approved_pm', 'needs_revision_bs', 'needs_revision_pm_pricing'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data?.map(order => ({
        ...order,
        pharmacy_name: order.pharmacies?.name || 'نامشخص'
      })) || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('خطا در بارگذاری سفارشات');
    }
  };

  const fetchProcessedOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacies(name)
        `)
        .in('workflow_status', ['approved_bs', 'rejected', 'invoice_issued', 'payment_uploaded', 'payment_verified', 'completed'])
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setProcessedOrders(data?.map(order => ({
        ...order,
        pharmacy_name: order.pharmacies?.name || 'نامشخص'
      })) || []);
    } catch (error) {
      console.error('Error fetching processed orders:', error);
      toast.error('خطا در بارگذاری تاریخچه سفارشات');
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
      const order = orders.find(o => o.id === orderId) || processedOrders.find(o => o.id === orderId);
      if (order && !order.items) {
        const items = await fetchOrderItems(orderId);
        
        // Update the appropriate state
        if (orders.find(o => o.id === orderId)) {
          setOrders(prevOrders => 
            prevOrders.map(o => 
              o.id === orderId ? { ...o, items } : o
            )
          );
        } else {
          setProcessedOrders(prevOrders => 
            prevOrders.map(o => 
              o.id === orderId ? { ...o, items } : o
            )
          );
        }
      }
    }
    
    setExpandedOrders(newExpanded);
  };

  const handleOrderAction = async (orderId: string, action: 'approve' | 'reject' | 'revision') => {
    try {
      let newStatus = '';
      
      if (selectedOrder?.workflow_status === 'needs_revision_pm_pricing') {
        // Coming back from pricing revision
        const statusMap = {
          approve: 'approved_bs',
          reject: 'rejected',
          revision: 'needs_revision_pm'
        };
        newStatus = statusMap[action];
      } else {
        // Normal flow from approved_pm or needs_revision_bs
        const statusMap = {
          approve: 'approved_bs',
          reject: 'rejected',
          revision: 'needs_revision_pm'
        };
        newStatus = statusMap[action];
      }

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          workflow_status: newStatus,
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
          user_id: user.id,
          from_status: selectedOrder?.workflow_status || 'approved_pm',
          to_status: newStatus,
          notes: actionNotes || null
        });

      if (approvalError) throw approvalError;

      toast.success('وضعیت سفارش با موفقیت به‌روزرسانی شد');
      setIsDialogOpen(false);
      setActionNotes("");
      setSelectedOrder(null);
      setPendingAction(null);
      
      // Refresh both lists
      fetchOrders();
      fetchProcessedOrders();
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
      'approved_pm': { label: 'تایید شده مدیر', variant: 'secondary' as const, icon: CheckCircle },
      'needs_revision_bs': { label: 'نیاز به ویرایش بارمان', variant: 'destructive' as const, icon: AlertTriangle },
      'needs_revision_pm_pricing': { label: 'ویرایش قیمت‌گذاری', variant: 'destructive' as const, icon: Edit },
      'approved_bs': { label: 'تایید شده بارمان', variant: 'default' as const, icon: CheckCircle },
      'rejected': { label: 'رد شده', variant: 'destructive' as const, icon: XCircle },
      'invoice_issued': { label: 'فاکتور صادر شده', variant: 'secondary' as const, icon: Package },
      'payment_uploaded': { label: 'رسید آپلود شده', variant: 'default' as const, icon: CheckCircle },
      'payment_verified': { label: 'پرداخت تایید شده', variant: 'default' as const, icon: CheckCircle },
      'completed': { label: 'تکمیل شده', variant: 'default' as const, icon: CheckCircle },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: Package 
    };
    
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
  };

  const getActionLabel = () => {
    switch (pendingAction) {
      case 'approve': return 'تایید سفارش';
      case 'reject': return 'رد سفارش';
      case 'revision': return 'درخواست ویرایش';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const ReviewTab = () => {
    const pendingReview = orders.filter(o => o.workflow_status === 'approved_pm').length;
    const needsRevision = orders.filter(o => o.workflow_status === 'needs_revision_bs' || o.workflow_status === 'needs_revision_pm_pricing').length;

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardContent className="flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{pendingReview}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">در انتظار بررسی</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
            <CardContent className="flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-500/20">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{needsRevision}</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">نیاز به ویرایش</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
            <CardContent className="flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <Truck className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{orders.length}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">کل سفارشات</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              سفارشات نیازمند بررسی
            </CardTitle>
            <CardDescription>
              سفارشات تایید شده توسط مدیر داروخانه که نیاز به بررسی بارمان دارند
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">هیچ سفارشی برای بررسی وجود ندارد</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">سفارش #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          داروخانه: {order.pharmacy_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          تاریخ ثبت: {new Date(order.created_at).toLocaleDateString('fa-IR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          تعداد اقلام: {order.total_items}
                        </p>
                        {order.notes && (
                          <p className="text-sm text-muted-foreground">یادداشت: {order.notes}</p>
                        )}
                      </div>
                      {getStatusBadge(order.workflow_status)}
                    </div>

                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        {expandedOrders.has(order.id) ? 'بستن جزئیات' : 'مشاهده جزئیات'}
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openActionDialog(order, 'approve')}
                          className="gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          تایید
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openActionDialog(order, 'revision')}
                          className="gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          ویرایش
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => openActionDialog(order, 'reject')}
                          className="gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          رد
                        </Button>
                      </div>
                    </div>

                    {/* Order Items Details */}
                    {expandedOrders.has(order.id) && (
                      <div className="mt-4 pt-4 border-t border-border animate-fade-in">
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
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const HistoryTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            تاریخچه سفارشات پردازش شده
          </CardTitle>
          <CardDescription>
            سفارشاتی که توسط کارمند بارمان پردازش شده‌اند
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {processedOrders.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">هیچ سفارش پردازش شده‌ای وجود ندارد</p>
              </div>
            ) : (
              processedOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">سفارش #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-muted-foreground">
                        داروخانه: {order.pharmacy_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        آخرین به‌روزرسانی: {new Date(order.updated_at).toLocaleDateString('fa-IR')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        تعداد اقلام: {order.total_items}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(order.workflow_status)}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        جزئیات
                      </Button>
                    </div>
                  </div>

                  {/* Order Items Details */}
                  {expandedOrders.has(order.id) && (
                    <div className="mt-4 pt-4 border-t border-border animate-fade-in">
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
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ReportsTab = () => {
    const totalProcessed = processedOrders.length;
    const approved = processedOrders.filter(o => o.workflow_status === 'approved_bs' || 
                                              o.workflow_status === 'invoice_issued' || 
                                              o.workflow_status === 'payment_uploaded' ||
                                              o.workflow_status === 'payment_verified' ||
                                              o.workflow_status === 'completed').length;
    const rejected = processedOrders.filter(o => o.workflow_status === 'rejected').length;
    const pending = orders.length;

    return (
      <div className="space-y-6">
        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{pending}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">در انتظار بررسی</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{approved}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">تایید شده</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-500/20">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{rejected}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">رد شده</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/20">
                  <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{totalProcessed}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">کل پردازش شده</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              آمار عملکرد
            </CardTitle>
            <CardDescription>
              گزارش عملکرد کارمند بارمان
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-bold text-primary">
                    {totalProcessed > 0 ? Math.round((approved / totalProcessed) * 100) : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">نرخ تایید</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-bold text-primary">
                    {totalProcessed > 0 ? Math.round((rejected / totalProcessed) * 100) : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">نرخ رد</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-bold text-primary">{totalProcessed + pending}</p>
                  <p className="text-sm text-muted-foreground">کل سفارشات</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-bold text-primary">
                    {totalProcessed > 0 ? Math.round(totalProcessed / 30) : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">میانگین روزانه</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Mobile Header */}
      <div className="block md:hidden">
        <MobileHeader 
          user={user}
          pharmacy={null}
          userRole="barman_staff"
          onSignOut={handleSignOut}
        />
      </div>

      {/* Desktop Header */}
      <header className="desktop-only border-b border-border/60 bg-card/90 backdrop-blur-lg shadow-soft">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
                <Truck className="h-7 w-7 text-primary" />
                <div className="absolute -bottom-1 -right-1 p-1 bg-secondary rounded-full">
                  <Package className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gradient">پنل کارمند بارمان</h1>
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

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 pb-20 md:pb-8">
        {/* Desktop Navigation */}
        <div className="desktop-only mb-8">
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-2 border border-border/60 shadow-soft">
            <div className="flex flex-wrap gap-1">
              <Button
                variant={activeTab === 'review' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('review')}
                className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === 'review' 
                    ? 'btn-primary shadow-medium' 
                    : 'hover:bg-muted/60'
                }`}
              >
                <Truck className="h-5 w-5" />
                <span className="font-medium">بررسی سفارشات</span>
              </Button>
              <Button
                variant={activeTab === 'history' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('history')}
                className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === 'history' 
                    ? 'btn-primary shadow-medium' 
                    : 'hover:bg-muted/60'
                }`}
              >
                <History className="h-5 w-5" />
                <span className="font-medium">تاریخچه</span>
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
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in-50 duration-500 mobile-scroll">
          {activeTab === 'review' && <ReviewTab />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'reports' && <ReportsTab />}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userRole="barman_staff"
      />

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{getActionLabel()}</DialogTitle>
            <DialogDescription>
              آیا مطمئن هستید که می‌خواهید این عملیات را انجام دهید؟
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="یادداشت (اختیاری)"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              انصراف
            </Button>
            <Button 
              onClick={() => selectedOrder && handleOrderAction(selectedOrder.id, pendingAction!)}
              variant={pendingAction === 'reject' ? 'destructive' : 'default'}
              className="gap-2"
            >
              {pendingAction === 'approve' && <CheckCircle className="h-4 w-4" />}
              {pendingAction === 'reject' && <XCircle className="h-4 w-4" />}
              {pendingAction === 'revision' && <Edit className="h-4 w-4" />}
              {getActionLabel()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BarmanStaffDashboard;