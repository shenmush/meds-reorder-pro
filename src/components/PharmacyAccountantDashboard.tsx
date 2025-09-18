import React, { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Receipt, CheckCircle, Clock, AlertCircle, XCircle, Edit, FileText, Building2, LogOut, Calculator, BarChart3, History, Eye, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import { ThemeToggle } from '@/components/ui/theme-toggle';
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
  offer_percentage?: number;
  company_name?: string;
  package_count?: number;
  irc?: string;
  gtin?: string;
  erx_code?: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  workflow_status: string;
  total_items: number;
  notes?: string;
  payment_method?: string | null;
  payment_proof_url?: string;
  payment_date?: string;
  payment_rejection_reason?: string;
  invoice_amount?: number;
  items?: OrderItem[];
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
  const [paymentHistory, setPaymentHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'payments' | 'history' | 'reports'>('payments');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [uploadedImages, setUploadedImages] = useState<Map<string, string>>(new Map());
  const [uploadedFiles, setUploadedFiles] = useState<Map<string, File>>(new Map());
  const [confirmationNotes, setConfirmationNotes] = useState<Record<string, string>>({});
  const confirmationNotesRef = useRef<Record<string, string>>({});
  const [orderApprovals, setOrderApprovals] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchOrders(),
        fetchPaymentHistory(),
        fetchOrderApprovals()
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
      // Get user's pharmacy first
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('pharmacy_id')
        .eq('user_id', user.id)
        .eq('role', 'pharmacy_accountant')
        .maybeSingle();

      if (roleError) throw roleError;
      if (!userRole) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          payment_method,
          pharmacies!inner(
            id,
            name
          )
        `)
        .in('workflow_status', ['invoice_issued', 'payment_rejected'])
        .eq('pharmacies.id', userRole.pharmacy_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data?.map(order => ({
        ...order,
        pharmacy: { name: order.pharmacies?.name || 'نامشخص' }
      })) || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('خطا در بارگذاری سفارشات');
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      // Get user's pharmacy first
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('pharmacy_id')
        .eq('user_id', user.id)
        .eq('role', 'pharmacy_accountant')
        .maybeSingle();

      if (roleError) throw roleError;
      if (!userRole) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          payment_method,
          pharmacies!inner(
            id,
            name
          )
        `)
        .in('workflow_status', ['payment_uploaded', 'payment_verified', 'completed'])
        .eq('pharmacies.id', userRole.pharmacy_id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPaymentHistory(data?.map(order => ({
        ...order,
        pharmacy: { name: order.pharmacies?.name || 'نامشخص' }
      })) || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast.error('خطا در بارگذاری تاریخچه پرداخت‌ها');
    }
  };

  const fetchOrderApprovals = async () => {
    try {
      // Get user's pharmacy first
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('pharmacy_id')
        .eq('user_id', user.id)
        .eq('role', 'pharmacy_accountant')
        .maybeSingle();

      if (roleError) throw roleError;
      if (!userRole) return;

      // Get all orders for this pharmacy
      const { data: pharmacyOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('pharmacy_id', userRole.pharmacy_id);

      if (ordersError) throw ordersError;
      if (!pharmacyOrders || pharmacyOrders.length === 0) return;

      const orderIds = pharmacyOrders.map(o => o.id);

      // Fetch approvals for these orders
      const { data: approvals, error: approvalsError } = await supabase
        .from('order_approvals')
        .select('*')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false });

      if (approvalsError) throw approvalsError;

      // Group approvals by order_id
      const groupedApprovals: Record<string, any[]> = {};
      approvals?.forEach(approval => {
        if (!groupedApprovals[approval.order_id]) {
          groupedApprovals[approval.order_id] = [];
        }
        groupedApprovals[approval.order_id].push(approval);
      });

      setOrderApprovals(groupedApprovals);
    } catch (error) {
      console.error('Error fetching order approvals:', error);
    }
  };

  // Get the latest approval note for an order
  const getLatestApprovalNote = (orderId: string) => {
    const approvals = orderApprovals[orderId];
    if (!approvals || approvals.length === 0) return null;
    
    // Find the most recent approval with notes
    const latestWithNotes = approvals.find(approval => approval.notes && approval.notes.trim() !== '');
    return latestWithNotes;
  };

  const handleFileUpload = async (orderId: string, file: File) => {
    try {
      setUploadingOrderId(orderId);

      // Create preview URL for the uploaded file (no actual upload yet)
      const previewUrl = URL.createObjectURL(file);
      const newUploadedImages = new Map(uploadedImages);
      newUploadedImages.set(orderId, previewUrl);
      setUploadedImages(newUploadedImages);

      // Store the file for later upload
      const newUploadedFiles = new Map(uploadedFiles);
      newUploadedFiles.set(orderId, file);
      setUploadedFiles(newUploadedFiles);

      toast.success('فایل انتخاب شد - برای تایید نهایی دکمه "تایید پرداخت" را بزنید');
    } catch (error) {
      console.error('Error selecting file:', error);
      toast.error('خطا در انتخاب فایل');
    } finally {
      setUploadingOrderId(null);
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    try {
      const notes = (confirmationNotesRef.current[orderId] ?? confirmationNotes[orderId]) || 'رسید پرداخت توسط حسابدار داروخانه تایید شد';
      
      // Check if there's a file to upload
      const file = uploadedFiles.get(orderId);
      const order = orders.find(o => o.id === orderId);
      let publicUrl = order?.payment_proof_url || '';
      
      if (file) {
        // Upload file to Supabase Storage with user folder structure
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${orderId}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-proofs')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl: url } } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(fileName);
          
        publicUrl = url;

        // Clean up preview and file
        const previewUrl = uploadedImages.get(orderId);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        const newUploadedImages = new Map(uploadedImages);
        newUploadedImages.delete(orderId);
        setUploadedImages(newUploadedImages);
        
        const newUploadedFiles = new Map(uploadedFiles);
        newUploadedFiles.delete(orderId);
        setUploadedFiles(newUploadedFiles);
      }
      
      // Ensure we have a payment proof before allowing confirmation
      if (!publicUrl) {
        toast.error('لطفا ابتدا رسید پرداخت را آپلود کنید');
        return;
      }
      
      // Update order status and payment proof URL
      const updateData: any = {
        workflow_status: 'payment_uploaded',
        payment_proof_url: publicUrl,
        payment_date: new Date().toISOString()
      };
      
      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Create approval record
      const { error: approvalError } = await supabase
        .from('order_approvals')
        .insert({
          order_id: orderId,
          user_id: user.id,
          from_status: 'invoice_issued',
          to_status: 'payment_uploaded',
          notes: notes
        });

      if (approvalError) throw approvalError;

      // Clear the confirmation note
      const newConfirmationNotes = { ...confirmationNotes };
      delete newConfirmationNotes[orderId];
      setConfirmationNotes(newConfirmationNotes);
      delete confirmationNotesRef.current[orderId];

      toast.success('رسید پرداخت ثبت شد و به حسابدار بارمان ارسال شد');
      fetchOrders();
      fetchPaymentHistory();
      fetchOrderApprovals();
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('خطا در تایید پرداخت');
    }
  };

  const handleDeletePaymentProof = async (orderId: string) => {
    try {
      // Get the current order to find the payment proof URL
      const order = orders.find(o => o.id === orderId);
      if (!order?.payment_proof_url) return;

      // Extract file path from the URL
      const url = order.payment_proof_url;
      const fileName = url.split('/').pop();
      if (!fileName) return;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('payment-proofs')
        .remove([`${user.id}/${fileName}`]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue even if storage delete fails - the file might already be gone
      }

      // Update order to remove payment proof URL
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_proof_url: null,
          payment_date: null
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Remove from uploaded images preview
      const newUploadedImages = new Map(uploadedImages);
      newUploadedImages.delete(orderId);
      setUploadedImages(newUploadedImages);

      toast.success('رسید پرداخت حذف شد');
      fetchOrders();
    } catch (error) {
      console.error('Error deleting payment proof:', error);
      toast.error('خطا در حذف رسید پرداخت');
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

      toast.success('سفارش با موفقیت رد شد');
      fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('خطا در رد سفارش');
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

      toast.success('درخواست ویرایش ارسال شد');
      fetchOrders();
    } catch (error) {
      console.error('Error requesting revision:', error);
      toast.error('خطا در درخواست ویرایش');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'invoice_issued': { label: 'فاکتور صادر شده', variant: 'secondary' as const, icon: FileText },
      'payment_uploaded': { label: 'رسید آپلود شده - نیاز به تایید', variant: 'default' as const, icon: Upload },
      'payment_rejected': { label: 'پرداخت رد شده', variant: 'destructive' as const, icon: XCircle },
      'payment_verified': { label: 'پرداخت تایید شده', variant: 'default' as const, icon: CheckCircle },
      'completed': { label: 'تکمیل شده', variant: 'default' as const, icon: CheckCircle },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'secondary' as const, 
      icon: FileText 
    };
    
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon size={12} />
        {config.label}
      </Badge>
    );
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
          .select('drug_id, unit_price, total_price, offer_percentage, notes')
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
          total_price: pricing?.total_price || 0,
          offer_percentage: pricing?.offer_percentage || 0
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
      const order = orders.find(o => o.id === orderId) || paymentHistory.find(o => o.id === orderId);
      if (order && !order.items) {
        const items = await fetchOrderItems(orderId);
        
        // Update the appropriate order list
        if (orders.find(o => o.id === orderId)) {
          setOrders(prevOrders => 
            prevOrders.map(o => 
              o.id === orderId ? { ...o, items } : o
            )
          );
        }
        if (paymentHistory.find(o => o.id === orderId)) {
          setPaymentHistory(prevOrders => 
            prevOrders.map(o => 
              o.id === orderId ? { ...o, items } : o
            )
          );
        }
      }
    }
    
    setExpandedOrders(newExpanded);
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'نامشخص';
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Calculator className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const PaymentsTab = () => {
    const pendingPayment = orders.filter(o => o.workflow_status === 'invoice_issued' || o.workflow_status === 'payment_rejected').length;
    const uploadedReceipts = orders.filter(o => o.workflow_status === 'payment_uploaded').length;

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardContent className="flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{pendingPayment}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">در انتظار پرداخت</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800">
            <CardContent className="flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <Upload className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{uploadedReceipts}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">رسید آپلود شده</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800">
            <CardContent className="flex items-center p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/20">
                  <Receipt className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{orders.length}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">کل سفارشات</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              سفارشات نیازمند پرداخت
            </CardTitle>
            <CardDescription>
              فاکتورهای صادر شده که نیاز به پرداخت دارند
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">هیچ فاکتوری برای پرداخت وجود ندارد</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">سفارش #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-muted-foreground">
                          تاریخ ثبت: {new Date(order.created_at).toLocaleDateString('fa-IR')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          تعداد اقلام: {order.total_items}
                        </p>
                        {order.invoice_amount && (
                          <p className="text-sm font-medium text-primary">
                            مبلغ فاکتور: {formatCurrency(order.invoice_amount)}
                          </p>
                        )}
                        {order.payment_method && (
                          <p className="text-sm text-muted-foreground">
                            <strong>روش پرداخت:</strong> {order.payment_method}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {getStatusBadge(order.workflow_status)}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="gap-1"
                        >
                          {expandedOrders.has(order.id) ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              بستن جزئیات
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4" />
                              مشاهده جزئیات فاکتور
                            </>
                          )}
                        </Button>
                      </div>
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

                    
                    {/* Invoice Details */}
                    {expandedOrders.has(order.id) && order.items && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium mb-3">جزئیات فاکتور:</h4>
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
                                    {item.offer_percentage && item.offer_percentage > 0 && (
                                      <>
                                        <div>
                                          <span className="font-medium">آفر:</span> {item.offer_percentage}%
                                        </div>
                                        <div className="text-orange-600">
                                          <span className="font-medium">مقدار آفر:</span> {Math.round(((item.total_price || 0) * item.offer_percentage) / 100).toLocaleString('fa-IR')} تومان
                                        </div>
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                          {order.invoice_amount && order.invoice_amount > 0 && (
                            <div className="pt-3 mt-4 border-t border-border/60">
                              <p className="text-lg font-bold text-left">
                                مجموع کل فاکتور: {order.invoice_amount.toLocaleString('fa-IR')} تومان
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Payment Actions */}
                    {(order.workflow_status === 'invoice_issued' || order.workflow_status === 'payment_rejected') && (uploadedImages.get(order.id) || order.payment_proof_url) && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/50 rounded-lg">
                        <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-3">
                          {uploadedImages.get(order.id) ? 'رسید انتخاب شده - برای تایید نهایی دکمه زیر را بزنید' : 'رسید پرداخت آپلود شده - آماده تایید'}
                        </p>
                        
                        {/* Image Preview */}
                        {(uploadedImages.get(order.id) || order.payment_proof_url) && (
                          <div className="mb-4 p-3 border border-green-200 dark:border-green-800 rounded-lg bg-white dark:bg-background">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium">پیش‌نمایش رسید پرداخت:</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePaymentProof(order.id)}
                                className="gap-1 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                حذف
                              </Button>
                            </div>
                            <img 
                              src={uploadedImages.get(order.id) || order.payment_proof_url} 
                              alt="رسید پرداخت"
                              className="max-w-full max-h-96 object-contain rounded-md border"
                            />
                          </div>
                        )}
                        
                        {/* Latest Approval Note */}
                        {(() => {
                          const latestApproval = getLatestApprovalNote(order.id);
                          if (latestApproval) {
                            return (
                              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800">
                                <div className="flex items-start gap-2 mb-2">
                                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                      یادداشت از {latestApproval.from_status === 'payment_uploaded' ? 'حسابدار بارمان' : 'سیستم'}
                                    </p>
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                      {new Date(latestApproval.created_at).toLocaleDateString('fa-IR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-amber-800 dark:text-amber-200 bg-white dark:bg-amber-950/30 p-2 rounded border">
                                  {latestApproval.notes}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        })()}
                        
                        {/* Confirmation Notes */}
                        <div className="mb-3">
                          <Label htmlFor={`notes-${order.id}`} className="text-sm font-medium">
                            یادداشت تایید (اختیاری)
                          </Label>
                          <Textarea
                            id={`notes-${order.id}`}
                            placeholder="یادداشت یا توضیحات مربوط به تایید پرداخت..."
                            defaultValue={confirmationNotes[order.id] || ''}
                            onChange={(e) => {
                              confirmationNotesRef.current[order.id] = e.target.value;
                            }}
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        
                        <Button
                          onClick={() => handleConfirmPayment(order.id)}
                          className="w-full gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          تایید پرداخت و ارسال به حسابدار بارمان
                        </Button>
                      </div>
                    )}

                    {((order.workflow_status === 'invoice_issued' || order.workflow_status === 'payment_rejected') && !(uploadedImages.get(order.id) || order.payment_proof_url)) && (
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
                          
                          {/* Image Preview */}
                          {uploadedImages.get(order.id) && (
                            <div className="mt-3 p-3 border rounded-lg bg-muted/30">
                              <p className="text-sm font-medium mb-2">پیش‌نمایش تصویر آپلود شده:</p>
                              <img 
                                src={uploadedImages.get(order.id)} 
                                alt="پیش‌نمایش رسید پرداخت"
                                className="max-w-full max-h-64 object-contain rounded-md border"
                              />
                            </div>
                          )}
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

                    {order.payment_proof_url && order.workflow_status !== 'payment_uploaded' && (
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
    );
  };

  const HistoryTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            تاریخچه پرداخت‌ها
          </CardTitle>
          <CardDescription>
            تاریخچه تمام پرداخت‌های انجام شده
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">هیچ پرداختی ثبت نشده است</p>
              </div>
            ) : (
              paymentHistory.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">سفارش #{order.id.slice(0, 8)}</h3>
                      <p className="text-sm text-muted-foreground">
                        تاریخ پرداخت: {order.payment_date ? new Date(order.payment_date).toLocaleDateString('fa-IR') : '-'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        تعداد اقلام: {order.total_items}
                      </p>
                      {order.invoice_amount && (
                        <p className="text-sm font-medium text-primary">
                          مبلغ: {formatCurrency(order.invoice_amount)}
                        </p>
                      )}
                      {order.payment_method && (
                        <p className="text-sm text-muted-foreground">
                          <strong>روش پرداخت:</strong> {order.payment_method}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {getStatusBadge(order.workflow_status)}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="gap-1"
                      >
                        {expandedOrders.has(order.id) ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            بستن جزئیات
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            مشاهده جزئیات فاکتور
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Invoice Details */}
                  {expandedOrders.has(order.id) && order.items && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-medium mb-3">جزئیات فاکتور:</h4>
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
                                  {item.offer_percentage && item.offer_percentage > 0 && (
                                    <>
                                      <div>
                                        <span className="font-medium">آفر:</span> {item.offer_percentage}%
                                      </div>
                                      <div className="text-orange-600">
                                        <span className="font-medium">مقدار آفر:</span> {Math.round(((item.total_price || 0) * item.offer_percentage) / 100).toLocaleString('fa-IR')} تومان
                                      </div>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                        {order.invoice_amount && order.invoice_amount > 0 && (
                          <div className="pt-3 mt-4 border-t border-border/60">
                            <p className="text-lg font-bold text-left">
                              مجموع کل فاکتور: {order.invoice_amount.toLocaleString('fa-IR')} تومان
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {order.payment_proof_url && (
                    <div className="mt-4 p-3 border border-green-200 dark:border-green-800 rounded-lg bg-white dark:bg-background">
                      <p className="text-sm font-medium mb-2">رسید پرداخت:</p>
                      <img 
                        src={order.payment_proof_url} 
                        alt="رسید پرداخت"
                        className="max-w-full max-h-96 object-contain rounded-md border mb-2"
                      />
                      <a 
                        href={order.payment_proof_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        باز کردن در تب جدید
                      </a>
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
    const totalPayments = paymentHistory.reduce((sum, order) => sum + (order.invoice_amount || 0), 0);
    const thisMonthPayments = paymentHistory.filter(order => {
      if (!order.payment_date) return false;
      const paymentDate = new Date(order.payment_date);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
    });
    const thisMonthTotal = thisMonthPayments.reduce((sum, order) => sum + (order.invoice_amount || 0), 0);

    return (
      <div className="space-y-6">
        {/* Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-emerald-500/20">
                  <BarChart3 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(totalPayments)}
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">کل پرداخت‌ها</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-500/20">
                  <Calculator className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {formatCurrency(thisMonthTotal)}
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">پرداخت‌های این ماه</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              گزارشات مالی
            </CardTitle>
            <CardDescription>
              آمار و گزارشات مالی داروخانه
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-primary">{paymentHistory.length}</p>
                  <p className="text-sm text-muted-foreground">کل تراکنش‌ها</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-primary">{thisMonthPayments.length}</p>
                  <p className="text-sm text-muted-foreground">تراکنش‌های این ماه</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {paymentHistory.length > 0 ? formatCurrency(totalPayments / paymentHistory.length) : '۰ تومان'}
                  </p>
                  <p className="text-sm text-muted-foreground">میانگین تراکنش</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {orders.filter(o => o.workflow_status === 'invoice_issued').length}
                  </p>
                  <p className="text-sm text-muted-foreground">در انتظار پرداخت</p>
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
      <div className="mobile-only">
        <MobileHeader 
          user={user}
          pharmacy={null}
          userRole="pharmacy_accountant"
          onSignOut={handleSignOut}
        />
      </div>

      {/* Desktop Header */}
      <header className="desktop-only border-b border-border/60 bg-card/90 backdrop-blur-lg shadow-soft">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
                <Calculator className="h-7 w-7 text-primary" />
                <div className="absolute -bottom-1 -right-1 p-1 bg-secondary rounded-full">
                  <Receipt className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gradient">پنل حسابدار داروخانه</h1>
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
                variant={activeTab === 'payments' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('payments')}
                className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === 'payments' 
                    ? 'btn-primary shadow-medium' 
                    : 'hover:bg-muted/60'
                }`}
              >
                <Calculator className="h-5 w-5" />
                <span className="font-medium">پرداخت‌ها</span>
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
          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'history' && <HistoryTab />}
          {activeTab === 'reports' && <ReportsTab />}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userRole="pharmacy_accountant"
      />
    </div>
  );
};

export default PharmacyAccountantDashboard;