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
  Image,
  Eye,
  Download,
  Filter,
  Search,
  Building2
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
  payment_method?: string;
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
  const [expandedHistoryOrders, setExpandedHistoryOrders] = useState<Set<string>>(new Set());
  const [expandedPharmacies, setExpandedPharmacies] = useState<Set<string>>(new Set());
  const [expandedPharmacyOrders, setExpandedPharmacyOrders] = useState<Set<string>>(new Set());
  const [selectedDrug, setSelectedDrug] = useState<string>('');
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [availableDrugs, setAvailableDrugs] = useState<any[]>([]);
  const [pharmacyOrders, setPharmacyOrders] = useState<{[key: string]: any[]}>({});
  const [reportStats, setReportStats] = useState({
    totalOrders: 0,
    totalInvoiceAmount: 0,
    totalPaidAmount: 0,
    ordersByPharmacy: [] as any[],
    ordersByDrug: [] as any[],
    priceHistory: [] as any[]
  });
  const [stats, setStats] = useState({
    pendingPayments: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalProcessed: 0
  });
  const [orderApprovals, setOrderApprovals] = useState<{[key: string]: any[]}>({});
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

  const fetchReportStats = async () => {
    try {
      // Fetch basic order data without complex joins
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          invoice_amount,
          workflow_status,
          pharmacy_id,
          created_at,
          updated_at
        `)
        .in('workflow_status', ['payment_verified', 'completed']);

      if (ordersError) throw ordersError;

      // Fetch pharmacies data separately
      const { data: pharmaciesData, error: pharmaciesError } = await supabase
        .from('pharmacies')
        .select('id, name');

      if (pharmaciesError) throw pharmaciesError;

      // Fetch order items data
      const orderIds = ordersData?.map(o => o.id) || [];
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (orderItemsError) throw orderItemsError;

      // Fetch pricing data
      const { data: pricingData, error: pricingError } = await supabase
        .from('order_item_pricing')
        .select('*')
        .in('order_id', orderIds);

      if (pricingError) throw pricingError;

      // Get unique drug IDs and fetch drug details from all three tables
      const drugIds = [...new Set(orderItemsData?.map(item => item.drug_id) || [])];
      
      const [chemicalResult, medicalResult, naturalResult] = await Promise.all([
        supabase
          .from('chemical_drugs')
          .select('id, full_brand_name')
          .in('id', drugIds),
        supabase
          .from('medical_supplies')
          .select('id, title')
          .in('id', drugIds),
        supabase
          .from('natural_products')
          .select('id, full_en_brand_name')
          .in('id', drugIds)
      ]);

      const drugs = chemicalResult.data || [];
      const medical = medicalResult.data || [];
      const natural = naturalResult.data || [];

      // Calculate stats
      const totalOrders = ordersData?.length || 0;
      const totalInvoiceAmount = ordersData?.reduce((sum, order) => sum + (order.invoice_amount || 0), 0) || 0;
      const totalPaidAmount = ordersData?.filter(o => o.workflow_status === 'payment_verified' || o.workflow_status === 'completed')
        .reduce((sum, order) => sum + (order.invoice_amount || 0), 0) || 0;

      // Group by pharmacy
      const pharmacyGroups = ordersData?.reduce((acc: any, order) => {
        const pharmacy = pharmaciesData?.find(p => p.id === order.pharmacy_id);
        const pharmacyName = pharmacy?.name || 'نامشخص';
        
        if (!acc[pharmacyName]) {
          acc[pharmacyName] = { name: pharmacyName, count: 0, totalAmount: 0 };
        }
        acc[pharmacyName].count++;
        acc[pharmacyName].totalAmount += order.invoice_amount || 0;
        return acc;
      }, {});

      // Group by drug with price history
      const drugGroups: any = {};
      const priceHistory: any[] = [];

      ordersData?.forEach(order => {
        const orderItems = orderItemsData?.filter(item => item.order_id === order.id) || [];
        
        orderItems.forEach((item: any) => {
          // Find drug name from appropriate table
          let drugName = 'نامشخص';
          const chemical = drugs.find(d => d.id === item.drug_id);
          const medicalItem = medical.find(d => d.id === item.drug_id);
          const naturalItem = natural.find(d => d.id === item.drug_id);
          
          if (chemical) {
            drugName = chemical.full_brand_name;
          } else if (medicalItem) {
            drugName = medicalItem.title;
          } else if (naturalItem) {
            drugName = naturalItem.full_en_brand_name;
          }
          
          if (!drugGroups[drugName]) {
            drugGroups[drugName] = { name: drugName, count: 0, totalQuantity: 0, totalAmount: 0 };
          }
          
          const pricing = pricingData?.find(p => p.order_id === order.id && p.drug_id === item.drug_id);
          if (pricing) {
            drugGroups[drugName].count++;
            drugGroups[drugName].totalQuantity += item.quantity;
            drugGroups[drugName].totalAmount += pricing.total_price || 0;
            
            // Add to price history
            priceHistory.push({
              drugName,
              unitPrice: pricing.unit_price,
              totalPrice: pricing.total_price,
              quantity: item.quantity,
              date: pricing.created_at,
              orderId: order.id
            });
          }
        });
      });

      // Create available drugs list for search
      const drugsList = [
        ...drugs.map(d => ({ id: d.id, name: d.full_brand_name, type: 'chemical' })),
        ...medical.map(d => ({ id: d.id, name: d.title, type: 'medical' })),
        ...natural.map(d => ({ id: d.id, name: d.full_en_brand_name, type: 'natural' }))
      ];

      setAvailableDrugs(drugsList);
      setReportStats({
        totalOrders,
        totalInvoiceAmount,
        totalPaidAmount,
        ordersByPharmacy: Object.values(pharmacyGroups || {}),
        ordersByDrug: Object.values(drugGroups),
        priceHistory: priceHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      });

    } catch (error) {
      console.error('Error fetching report stats:', error);
      toast({
        title: "خطا",
        description: "خطا در بارگذاری گزارشات",
        variant: "destructive",
      });
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

      // Get drug details from all three drug tables
      const drugIds = items?.map(item => item.drug_id) || [];
      const [chemicalResult, medicalResult, naturalResult] = await Promise.all([
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
          .in('id', drugIds)
      ]);

      const drugs = chemicalResult.data || [];
      const medical = medicalResult.data || [];
      const natural = naturalResult.data || [];

      // Get pricing information
      const { data: pricing, error: pricingError } = await supabase
        .from('order_item_pricing')
        .select('*')
        .eq('order_id', orderId);

      if (pricingError) {
        console.error('Error fetching pricing:', pricingError);
      }

      const enhancedItems = (items || []).map((item: any) => {
        let drugInfo = {
          drug_name: 'نامشخص',
          drug_type: 'نامشخص',
          company_name: 'نامشخص',
          package_count: null,
          irc: null,
          gtin: null,
          erx_code: null
        };

        // Check chemical drugs
        const chemical = drugs.find(d => d.id === item.drug_id);
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
        } else {
          // Check medical supplies
          const medicalItem = medical.find(d => d.id === item.drug_id);
          if (medicalItem) {
            drugInfo = {
              drug_name: medicalItem.title,
              drug_type: 'تجهیزات پزشکی',
              company_name: medicalItem.license_owner_company_name || 'نامشخص',
              package_count: medicalItem.package_count,
              irc: medicalItem.irc,
              gtin: medicalItem.gtin,
              erx_code: medicalItem.erx_code
            };
          } else {
            // Check natural products
            const naturalItem = natural.find(d => d.id === item.drug_id);
            if (naturalItem) {
              drugInfo = {
                drug_name: naturalItem.full_en_brand_name,
                drug_type: 'محصولات طبیعی',
                company_name: naturalItem.license_owner_name || 'نامشخص',
                package_count: naturalItem.package_count,
                irc: naturalItem.irc,
                gtin: naturalItem.gtin,
                erx_code: naturalItem.erx_code
              };
            }
          }
        }

        const priceInfo = pricing?.find(p => p.drug_id === item.drug_id);
        return {
          id: item.id,
          drug_id: item.drug_id,
          drug_name: drugInfo.drug_name,
          drug_brand: drugInfo.irc || 'کد IRC',
          drug_type: drugInfo.drug_type,
          company_name: drugInfo.company_name,
          package_count: drugInfo.package_count,
          irc: drugInfo.irc,
          gtin: drugInfo.gtin,
          erx_code: drugInfo.erx_code,
          quantity: item.quantity,
          unit_price: priceInfo?.unit_price || 0,
          total_price: priceInfo?.total_price || 0
        };
      });

      // Update both orders and historyOrders state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, order_items: enhancedItems }
            : order
        )
      );

      setHistoryOrders(prevOrders => 
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

  const fetchOrderApprovals = async (orderId: string) => {
    try {
      // 1) Fetch approvals for this order
      const { data: approvals, error } = await supabase
        .from('order_approvals')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Current user
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id;

      // 2) Fetch display names for involved users
      const userIds = Array.from(new Set((approvals || []).map(a => a.user_id).filter(Boolean)));
      let profilesMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', userIds);
        if (profilesData) {
          profilesMap = profilesData.reduce((acc: any, p: any) => {
            acc[p.user_id] = p.display_name || '';
            return acc;
          }, {} as Record<string, string>);
        }
      }

      // 3) Filter approvals: show current user's comments and pharmacy accountant comments inferred by status
      const filteredApprovals = (approvals || []).filter(approval => {
        return (
          approval.user_id === currentUserId ||
          approval.to_status === 'payment_uploaded'
        );
      });

      const approvalsWithNames = filteredApprovals.map(a => ({
        ...a,
        user_display_name: profilesMap[a.user_id] || ''
      }));

      setOrderApprovals(prev => ({
        ...prev,
        [orderId]: approvalsWithNames
      }));
    } catch (error) {
      console.error('Error fetching order approvals:', error);
    }
  };

  const fetchPharmacyOrders = async (pharmacyName: string) => {
    if (pharmacyOrders[pharmacyName]) return;

    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          id,
          invoice_amount,
          workflow_status,
          created_at,
          total_items,
          pharmacies!inner(name)
        `)
        .eq('pharmacies.name', pharmacyName)
        .in('workflow_status', ['payment_verified', 'completed'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPharmacyOrders(prev => ({
        ...prev,
        [pharmacyName]: ordersData || []
      }));
    } catch (error) {
      console.error('Error fetching pharmacy orders:', error);
    }
  };

  const togglePharmacyExpansion = (pharmacyName: string) => {
    const newExpanded = new Set(expandedPharmacies);
    
    if (newExpanded.has(pharmacyName)) {
      newExpanded.delete(pharmacyName);
    } else {
      newExpanded.add(pharmacyName);
      fetchPharmacyOrders(pharmacyName);
    }
    
    setExpandedPharmacies(newExpanded);
  };

  const togglePharmacyOrderExpansion = async (orderId: string) => {
    const newExpanded = new Set(expandedPharmacyOrders);
    
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
      await fetchOrderItems(orderId);
    }
    
    setExpandedPharmacyOrders(newExpanded);
  };

  const getFilteredDrugs = () => {
    if (!drugSearchQuery) return availableDrugs;
    return availableDrugs.filter(drug => 
      drug.name.toLowerCase().includes(drugSearchQuery.toLowerCase())
    );
  };

  const getFilteredPriceHistory = () => {
    if (!selectedDrug) return [];
    const selectedDrugName = availableDrugs.find(d => d.id === selectedDrug)?.name;
    return reportStats.priceHistory.filter(item => item.drugName === selectedDrugName);
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
      
      // Fetch order approvals
      fetchOrderApprovals(orderId);
    }
    
    setExpandedOrders(newExpanded);
  };

  const toggleHistoryOrderExpansion = async (orderId: string) => {
    const newExpanded = new Set(expandedHistoryOrders);
    
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
      
      // Fetch order items if not already loaded
      const order = historyOrders.find(o => o.id === orderId);
      if (order && (!order.order_items || order.order_items.length === 0)) {
        await fetchOrderItems(orderId);
      }
      
      // Fetch order approvals
      await fetchOrderApprovals(orderId);
    }
    
    setExpandedHistoryOrders(newExpanded);
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
      'payment_uploaded': { label: 'رسید آپلود شده', variant: 'outline' },
      'payment_verified': { label: 'پرداخت تایید شده', variant: 'default' },
      'payment_rejected': { label: 'پرداخت رد شده', variant: 'destructive' },
      'invoice_issued': { label: 'فاکتور صادر شده', variant: 'secondary' },
      'completed': { label: 'تکمیل شده', variant: 'default' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'history' && historyOrders.length === 0) {
      fetchHistoryOrders();
    }
    if (tab === 'reports') {
      fetchReportStats();
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
                                {order.payment_method && (
                                  <span className="flex items-center gap-1 font-medium text-green-600">
                                    <CreditCard className="w-4 h-4" />
                                    {order.payment_method}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Payment Proof Display */}
                          {order.payment_proof_url && (
                            <div className="mb-4 p-3 border rounded-lg bg-muted/30">
                              <h4 className="font-medium mb-2">رسید پرداخت:</h4>
                              <img 
                                src={order.payment_proof_url} 
                                alt="رسید پرداخت"
                                className="max-w-full max-h-64 object-contain rounded-md border mb-2"
                              />
                              <a 
                                href={order.payment_proof_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                              >
                                <Download className="w-4 h-4" />
                                دانلود رسید اصلی
                              </a>
                            </div>
                          )}

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

                            {/* Approve Payment */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
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

                           {/* Order Items Expansion */}
                          {expandedOrders.has(order.id) && order.order_items && order.order_items.length > 0 && (
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-3">اقلام سفارش ({order.order_items.length} قلم):</h4>
                              <div className="space-y-3">
                                {order.order_items.map((item) => (
                                  <div key={item.id} className="border rounded-lg p-4 bg-muted/30">
                                    <div className="space-y-3">
                                      <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                          <h5 className="font-semibold text-primary">{item.drug_name}</h5>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Badge variant="secondary">{item.drug_type}</Badge>
                                            {item.irc && <span>IRC: {item.irc}</span>}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-bold text-lg">{item.quantity} عدد</p>
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                        <div className="space-y-1">
                                          <span className="font-medium text-muted-foreground">شرکت:</span>
                                          <p>{item.company_name || 'نامشخص'}</p>
                                        </div>
                                        {item.package_count && (
                                          <div className="space-y-1">
                                            <span className="font-medium text-muted-foreground">تعداد در بسته:</span>
                                            <p>{item.package_count}</p>
                                          </div>
                                        )}
                                        {item.gtin && (
                                          <div className="space-y-1">
                                            <span className="font-medium text-muted-foreground">GTIN:</span>
                                            <p className="font-mono text-xs">{item.gtin}</p>
                                          </div>
                                        )}
                                        {item.erx_code && (
                                          <div className="space-y-1">
                                            <span className="font-medium text-muted-foreground">کد ERX:</span>
                                            <p className="font-mono text-xs">{item.erx_code}</p>
                                          </div>
                                        )}
                                      </div>

                                      {(item.unit_price && item.unit_price > 0) && (
                                        <div className="border-t pt-3">
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                            <div className="space-y-1">
                                              <span className="font-medium text-muted-foreground">قیمت واحد:</span>
                                              <p className="font-bold text-blue-600">{formatCurrency(item.unit_price)} تومان</p>
                                            </div>
                                            <div className="space-y-1">
                                              <span className="font-medium text-muted-foreground">قیمت کل:</span>
                                              <p className="font-bold text-green-600">{formatCurrency(item.total_price)} تومان</p>
                                            </div>
                                            {item.unit_price && item.total_price && item.quantity > 0 && (
                                              <div className="space-y-1">
                                                <span className="font-medium text-muted-foreground">تخفیف:</span>
                                                <p className="font-medium text-orange-600">
                                                  {((item.unit_price * item.quantity - item.total_price) / (item.unit_price * item.quantity) * 100).toFixed(1)}%
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Order Approval Notes */}
                          {expandedOrders.has(order.id) && orderApprovals[order.id] && orderApprovals[order.id].length > 0 && (
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                یادداشت‌های بررسی:
                              </h4>
                              <div className="space-y-2">
                                {orderApprovals[order.id].map((approval, index) => (
                                  <div key={approval.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                      <div className="text-amber-600">
                                        <FileText className="w-4 h-4 mt-0.5" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-sm">
                                          <span className="font-medium text-amber-800">
                                            {approval.user_display_name || 'کاربر'}
                                          </span>
                                          <span className="text-amber-600 mr-2">
                                            ({approval.from_status} → {approval.to_status})
                                          </span>
                                        </div>
                                        <p className="text-amber-700 mt-1">{approval.notes}</p>
                                        <div className="text-xs text-amber-600 mt-1">
                                          {new Date(approval.created_at).toLocaleDateString('fa-IR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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
                  مشاهده پرداخت‌های تایید شده و رد شده با جزئیات کامل
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
                      <Card key={order.id} className="hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-4">
                                <h3 className="font-semibold">سفارش #{order.id.slice(0, 8)}</h3>
                                {getStatusBadge(order.workflow_status)}
                              </div>
                               <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <UserIcon className="w-4 h-4" />
                                  {order.pharmacy.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(order.updated_at).toLocaleDateString('fa-IR')}
                                </span>
                                {order.invoice_amount && (
                                  <span className="flex items-center gap-1 font-medium text-primary">
                                    <DollarSign className="w-4 h-4" />
                                    {formatCurrency(order.invoice_amount)} تومان
                                  </span>
                                )}
                                {order.payment_method && (
                                  <span className="flex items-center gap-1 font-medium text-green-600">
                                    <CreditCard className="w-4 h-4" />
                                    {order.payment_method}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleHistoryOrderExpansion(order.id)}
                              className="gap-1"
                            >
                              {expandedHistoryOrders.has(order.id) ? (
                                <>
                                  <ChevronUp className="h-4 w-4" />
                                  بستن
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4" />
                                  مشاهده جزئیات
                                </>
                              )}
                            </Button>
                          </div>

                          {/* Order Details */}
                          {expandedHistoryOrders.has(order.id) && (
                            <div className="border-t pt-4 space-y-4">
                              {/* Order Items */}
                              {order.order_items && order.order_items.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-3">اقلام سفارش ({order.order_items.length} قلم):</h4>
                                  <div className="space-y-3">
                                    {order.order_items.map((item) => (
                                      <div key={item.id} className="border rounded-lg p-4 bg-muted/30">
                                        <div className="space-y-3">
                                          <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                              <h5 className="font-semibold text-primary">{item.drug_name}</h5>
                                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Badge variant="secondary">{item.drug_type}</Badge>
                                                {item.irc && <span>IRC: {item.irc}</span>}
                                              </div>
                                            </div>
                                            <div className="text-right">
                                              <p className="font-bold text-lg">{item.quantity} عدد</p>
                                            </div>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                            <div className="space-y-1">
                                              <span className="font-medium text-muted-foreground">شرکت:</span>
                                              <p>{item.company_name || 'نامشخص'}</p>
                                            </div>
                                            {item.package_count && (
                                              <div className="space-y-1">
                                                <span className="font-medium text-muted-foreground">تعداد در بسته:</span>
                                                <p>{item.package_count}</p>
                                              </div>
                                            )}
                                            {item.gtin && (
                                              <div className="space-y-1">
                                                <span className="font-medium text-muted-foreground">GTIN:</span>
                                                <p className="font-mono text-xs">{item.gtin}</p>
                                              </div>
                                            )}
                                            {item.erx_code && (
                                              <div className="space-y-1">
                                                <span className="font-medium text-muted-foreground">کد ERX:</span>
                                                <p className="font-mono text-xs">{item.erx_code}</p>
                                              </div>
                                            )}
                                          </div>

                                          {(item.unit_price && item.unit_price > 0) && (
                                            <div className="border-t pt-3">
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                                <div className="space-y-1">
                                                  <span className="font-medium text-muted-foreground">قیمت واحد:</span>
                                                  <p className="font-bold text-blue-600">{formatCurrency(item.unit_price)} تومان</p>
                                                </div>
                                                <div className="space-y-1">
                                                  <span className="font-medium text-muted-foreground">قیمت کل:</span>
                                                  <p className="font-bold text-green-600">{formatCurrency(item.total_price)} تومان</p>
                                                </div>
                                                {item.unit_price && item.total_price && item.quantity > 0 && (
                                                  <div className="space-y-1">
                                                    <span className="font-medium text-muted-foreground">تخفیف:</span>
                                                    <p className="font-medium text-orange-600">
                                                      {((item.unit_price * item.quantity - item.total_price) / (item.unit_price * item.quantity) * 100).toFixed(1)}%
                                                    </p>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Payment Proof */}
                              {order.payment_proof_url && (
                                <div>
                                  <h4 className="font-medium mb-3">رسید پرداخت:</h4>
                                  <div className="border rounded-lg p-3 bg-muted/30">
                                    <img 
                                      src={order.payment_proof_url} 
                                      alt="رسید پرداخت"
                                      className="max-w-full max-h-64 object-contain rounded-md border mb-2"
                                    />
                                    <a 
                                      href={order.payment_proof_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-primary hover:underline flex items-center gap-1"
                                    >
                                      <Download className="w-4 h-4" />
                                      دانلود رسید اصلی
                                    </a>
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {order.notes && (
                                <div>
                                  <h4 className="font-medium mb-2">یادداشت:</h4>
                                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                                    {order.notes}
                                  </p>
                                </div>
                              )}

                              {/* Order Approval Notes */}
                              {orderApprovals[order.id] && orderApprovals[order.id].length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    یادداشت‌های بررسی:
                                  </h4>
                                  <div className="space-y-2">
                                    {orderApprovals[order.id].map((approval, index) => (
                                      <div key={approval.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                        <div className="flex items-start gap-2">
                                          <div className="text-amber-600">
                                            <FileText className="w-4 h-4 mt-0.5" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="text-sm">
                                              <span className="font-medium text-amber-800">
                                                {approval.user_display_name || 'کاربر'}
                                              </span>
                                              <span className="text-amber-600 mr-2">
                                                ({approval.from_status} → {approval.to_status})
                                              </span>
                                            </div>
                                            <p className="text-amber-700 mt-1">{approval.notes}</p>
                                            <div className="text-xs text-amber-600 mt-1">
                                              {new Date(approval.created_at).toLocaleDateString('fa-IR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">کل سفارشات</p>
                      <p className="text-2xl font-bold text-blue-600">{reportStats.totalOrders}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-500/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">مجموع فاکتورها</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(reportStats.totalInvoiceAmount)}
                      </p>
                    </div>
                    <Receipt className="w-8 h-8 text-green-500/60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">مجموع پرداخت‌ها</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {formatCurrency(reportStats.totalPaidAmount)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-500/60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Orders by Pharmacy */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  فاکتورهای صادر شده به تفکیک داروخانه
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reportStats.ordersByPharmacy.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">داده‌ای برای نمایش وجود ندارد</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reportStats.ordersByPharmacy.map((pharmacy: any, index) => (
                      <div key={index}>
                        <div 
                          className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                          onClick={() => togglePharmacyExpansion(pharmacy.name)}
                        >
                          <div className="flex items-center gap-2">
                            {expandedPharmacies.has(pharmacy.name) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                            <div>
                              <h4 className="font-medium">{pharmacy.name}</h4>
                              <p className="text-sm text-muted-foreground">{pharmacy.count} سفارش</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">{formatCurrency(pharmacy.totalAmount)} تومان</p>
                          </div>
                        </div>

                        {/* Expanded pharmacy orders */}
                        {expandedPharmacies.has(pharmacy.name) && (
                          <div className="ml-6 mt-2 space-y-2 border-l-2 border-muted pl-4">
                            {pharmacyOrders[pharmacy.name]?.map((order: any) => (
                              <div key={order.id}>
                                <div 
                                  className="p-3 border rounded-md bg-muted/20 cursor-pointer hover:bg-muted/30"
                                  onClick={() => togglePharmacyOrderExpansion(order.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {expandedPharmacyOrders.has(order.id) ? (
                                        <ChevronUp className="w-3 h-3" />
                                      ) : (
                                        <ChevronDown className="w-3 h-3" />
                                      )}
                                      <div>
                                        <p className="text-sm font-medium">سفارش #{order.id.slice(0, 8)}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {order.total_items} قلم • {new Date(order.created_at).toLocaleDateString('fa-IR')}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm font-medium text-primary">
                                      {formatCurrency(order.invoice_amount || 0)} تومان
                                    </p>
                                  </div>
                                </div>

                                {/* Order details */}
                                {expandedPharmacyOrders.has(order.id) && (
                                  <div className="ml-4 mt-2 p-3 border rounded-md bg-background">
                                    {orders.find(o => o.id === order.id)?.order_items?.length > 0 || 
                                     historyOrders.find(o => o.id === order.id)?.order_items?.length > 0 ? (
                                      <div className="space-y-2">
                                        <h5 className="font-medium text-sm">جزئیات سفارش:</h5>
                                        {(orders.find(o => o.id === order.id)?.order_items || 
                                          historyOrders.find(o => o.id === order.id)?.order_items || []).map((item: any, idx: number) => (
                                          <div key={idx} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                            <div>
                                              <p className="text-sm font-medium">{item.drug_name}</p>
                                              <p className="text-xs text-muted-foreground">{item.drug_type}</p>
                                            </div>
                                            <div className="text-right text-sm">
                                              <p>تعداد: {item.quantity}</p>
                                              {item.unit_price > 0 && (
                                                <p>قیمت: {formatCurrency(item.unit_price)} تومان</p>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">در حال بارگذاری جزئیات...</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Orders by Drug */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  فاکتورهای صادر شده به تفکیک دارو
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reportStats.ordersByDrug.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">داده‌ای برای نمایش وجود ندارد</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {reportStats.ordersByDrug.map((drug: any, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium text-sm">{drug.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {drug.count} فاکتور • {drug.totalQuantity} عدد
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary text-sm">
                            {formatCurrency(drug.totalAmount)} تومان
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 w-5" />
                  تاریخچه قیمت داروها
                </CardTitle>
                <CardDescription>
                  بررسی تغییرات قیمت داروها در فاکتورهای مختلف
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Drug Search and Selection */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">جستجوی دارو:</label>
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="نام دارو را وارد کنید..."
                          value={drugSearchQuery}
                          onChange={(e) => setDrugSearchQuery(e.target.value)}
                          className="w-full pr-10 pl-3 py-2 border rounded-md text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">انتخاب دارو:</label>
                      <select
                        value={selectedDrug}
                        onChange={(e) => setSelectedDrug(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      >
                        <option value="">همه داروها</option>
                        {getFilteredDrugs().map((drug) => (
                          <option key={drug.id} value={drug.id}>
                            {drug.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Price History Display */}
                {getFilteredPriceHistory().length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {selectedDrug ? 'برای این دارو تاریخچه قیمتی وجود ندارد' : 'لطفاً دارویی را انتخاب کنید'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {getFilteredPriceHistory().map((item: any, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{item.drugName}</h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.date).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-muted-foreground">قیمت واحد:</span>
                            <p className="font-bold text-primary">{formatCurrency(item.unitPrice)} تومان</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-muted-foreground">سفارش:</span>
                            <p className="text-sm font-medium">#{item.orderId.slice(0, 8)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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