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
  accountant_notes?: string | null;
  created_at: string;
  updated_at: string;
  total_items: number;
  invoice_amount?: number;
  pharmacies: {
    name: string;
  };
  items?: OrderItem[];
}

interface ConsolidatedDrug {
  drug_id: string;
  drug_name: string;
  drug_type: string;
  company_name: string;
  total_quantity: number;
  irc?: string;
  gtin?: string;
  erx_code?: string;
  orders_count: number;
  pharmacies: string[];
  order_item_ids: string[];
  status?: string;
}

interface BarmanOrder {
  id: string;
  drug_id: string;
  drug_name: string;
  drug_type: string;
  company_name: string;
  quantity_ordered: number;
  bonus_percentage: number;
  bonus_quantity: number;
  total_received_quantity: number;
  payment_method?: string;
  notes?: string;
  order_date: string;
  created_by: string;
  irc?: string;
  gtin?: string;
  erx_code?: string;
}

interface BarmanManagerDashboardProps {
  user: User;
  onAuthChange: (user: User | null) => void;
}

const BarmanManagerDashboard: React.FC<BarmanManagerDashboardProps> = ({ user, onAuthChange }) => {
  const [finalApprovalOrders, setFinalApprovalOrders] = useState<Order[]>([]);
  const [invoicePendingOrders, setInvoicePendingOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [consolidatedDrugs, setConsolidatedDrugs] = useState<ConsolidatedDrug[]>([]);
  const [barmanOrders, setBarmanOrders] = useState<BarmanOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<ConsolidatedDrug | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'revision_bs' | 'revision_pm' | null>(null);
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('drugs');
  const [activeReportsSubTab, setActiveReportsSubTab] = useState('history');
  
  // Order form states
  const [quantityOrdered, setQuantityOrdered] = useState<number>(0);
  const [bonusPercentage, setBonusPercentage] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  useEffect(() => {
    fetchAllOrders();
    fetchConsolidatedDrugs();
    fetchBarmanOrders();
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
      
      // Fetch orders ready for final approval (payment verified by accountant)
      const { data: finalData, error: finalError } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacies (
            name
          )
        `)
        .eq('workflow_status', 'payment_verified')
        .order('created_at', { ascending: false });

      if (finalError) throw finalError;

      // Fetch orders awaiting invoice issuance (approved by barman staff)
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('orders')
        .select(`
          *,
          pharmacies (
            name
          )
        `)
        .eq('workflow_status', 'approved_bs')
        .order('created_at', { ascending: false });

      if (invoiceError) throw invoiceError;

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

      // Fetch order approvals to get the correct notes for payment_verified orders
      const { data: approvalsData } = await supabase
        .from('order_approvals')
        .select('order_id, notes, from_status, to_status, created_at')
        .in('to_status', ['payment_verified'])
        .order('created_at', { ascending: false });

      // Map approval notes to orders
      const approvalNotesMap = new Map();
      approvalsData?.forEach(approval => {
        if (approval.to_status === 'payment_verified' && approval.notes) {
          approvalNotesMap.set(approval.order_id, approval.notes);
        }
      });

      // Add approval notes to final orders
      const finalOrdersWithNotes = finalData?.map(order => ({
        ...order,
        accountant_notes: approvalNotesMap.get(order.id) || null
      })) || [];

      setFinalApprovalOrders(finalOrdersWithNotes);
      setInvoicePendingOrders(invoiceData || []);
      setHistoryOrders(historyData || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('خطا در بارگذاری سفارشات');
    } finally {
      setLoading(false);
    }
  };

  const fetchConsolidatedDrugs = async () => {
    try {
      // Get all orders with payment_verified status
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          pharmacies (
            name
          )
        `)
        .eq('workflow_status', 'payment_verified');

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        setConsolidatedDrugs([]);
        return;
      }

      const orderIds = orders.map(order => order.id);

      // Get all order items for these orders
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      if (itemsError) throw itemsError;

      if (!orderItems || orderItems.length === 0) {
        setConsolidatedDrugs([]);
        return;
      }

      const drugIds = orderItems.map(item => item.drug_id);

      // Fetch all drugs data in parallel
      const [chemicalDrugs, medicalSupplies, naturalProducts] = await Promise.all([
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

      // Create lookup maps
      const chemicalMap = new Map(chemicalDrugs.data?.map(d => [d.id, d]) || []);
      const medicalMap = new Map(medicalSupplies.data?.map(d => [d.id, d]) || []);
      const naturalMap = new Map(naturalProducts.data?.map(d => [d.id, d]) || []);
      const ordersMap = new Map(orders.map(o => [o.id, o]));

      // Consolidate drugs
      const drugConsolidation = new Map<string, ConsolidatedDrug>();

      orderItems.forEach(item => {
        const chemical = chemicalMap.get(item.drug_id);
        const medical = medicalMap.get(item.drug_id);
        const natural = naturalMap.get(item.drug_id);
        const orderInfo = ordersMap.get(item.order_id);

        let drugInfo = {
          drug_name: 'نامشخص',
          drug_type: 'نامشخص',
          company_name: 'نامشخص',
          irc: null,
          gtin: null,
          erx_code: null
        };

        if (chemical) {
          drugInfo = {
            drug_name: chemical.full_brand_name,
            drug_type: 'دارو شیمیایی',
            company_name: chemical.license_owner_company_name || 'نامشخص',
            irc: chemical.irc,
            gtin: chemical.gtin,
            erx_code: chemical.erx_code
          };
        } else if (medical) {
          drugInfo = {
            drug_name: medical.title,
            drug_type: 'تجهیزات پزشکی',
            company_name: medical.license_owner_company_name || 'نامشخص',
            irc: medical.irc,
            gtin: medical.gtin,
            erx_code: medical.erx_code
          };
        } else if (natural) {
          drugInfo = {
            drug_name: natural.full_en_brand_name,
            drug_type: 'محصولات طبیعی',
            company_name: natural.license_owner_name || 'نامشخص',
            irc: natural.irc,
            gtin: natural.gtin,
            erx_code: natural.erx_code
          };
        }

        if (drugConsolidation.has(item.drug_id)) {
          const existing = drugConsolidation.get(item.drug_id)!;
          existing.total_quantity += item.quantity;
          existing.orders_count += 1;
          existing.order_item_ids = existing.order_item_ids || [];
          existing.order_item_ids.push(item.id);
          
          // Add pharmacy if not already in the list
          const pharmacyName = orderInfo?.pharmacies?.name || 'نامشخص';
          if (!existing.pharmacies.includes(pharmacyName)) {
            existing.pharmacies.push(pharmacyName);
          }
        } else {
          drugConsolidation.set(item.drug_id, {
            drug_id: item.drug_id,
            drug_name: drugInfo.drug_name,
            drug_type: drugInfo.drug_type,
            company_name: drugInfo.company_name,
            total_quantity: item.quantity,
            irc: drugInfo.irc || undefined,
            gtin: drugInfo.gtin || undefined,
            erx_code: drugInfo.erx_code || undefined,
            orders_count: 1,
            pharmacies: [orderInfo?.pharmacies?.name || 'نامشخص'],
            order_item_ids: [item.id]
          });
        }
      });

      // Fetch status information for drugs
      const { data: drugStatuses } = await supabase
        .from('consolidated_drug_status')
        .select('drug_id, status')
        .in('drug_id', Array.from(drugConsolidation.keys()));

      // Create status map
      const statusMap = new Map(drugStatuses?.map(s => [s.drug_id, s.status]) || []);

      // Add status to consolidated drugs
      const consolidatedWithStatus = Array.from(drugConsolidation.values()).map(drug => ({
        ...drug,
        status: statusMap.get(drug.drug_id) || 'pending'
      }));

      setConsolidatedDrugs(consolidatedWithStatus);
    } catch (error) {
      console.error('Error fetching consolidated drugs:', error);
      toast.error('خطا در بارگذاری داروهای تجمیعی');
    }
  };

  const fetchBarmanOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('barman_orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) throw error;

      setBarmanOrders(data || []);
    } catch (error) {
      console.error('Error fetching barman orders:', error);
      toast.error('خطا در بارگذاری سفارشات بارمان');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedDrug || quantityOrdered <= 0) {
      toast.error('لطفاً اطلاعات سفارش را کامل وارد کنید');
      return;
    }

    try {
      const bonusQty = Math.floor(quantityOrdered * (bonusPercentage / 100));
      const totalReceived = quantityOrdered + bonusQty;

      // Create barman order record
      const { data: orderData, error: orderError } = await supabase
        .from('barman_orders')
        .insert({
          drug_id: selectedDrug.drug_id,
          drug_name: selectedDrug.drug_name,
          drug_type: selectedDrug.drug_type,
          company_name: selectedDrug.company_name,
          quantity_ordered: quantityOrdered,
          bonus_percentage: bonusPercentage,
          bonus_quantity: bonusQty,
          total_received_quantity: totalReceived,
          payment_method: paymentMethod,
          notes: orderNotes,
          created_by: user.id,
          irc: selectedDrug.irc,
          gtin: selectedDrug.gtin,
          erx_code: selectedDrug.erx_code
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Update consolidated drug status to 'ordered' and save order_item_ids
      const { error: statusError } = await supabase
        .from('consolidated_drug_status')
        .upsert({
          drug_id: selectedDrug.drug_id,
          status: 'ordered',
          order_item_ids: selectedDrug.order_item_ids
        });

      if (statusError) throw statusError;

      if (statusError) throw statusError;

      toast.success('سفارش با موفقیت ثبت شد');
      
      // Reset form
      setIsOrderDialogOpen(false);
      setSelectedDrug(null);
      setQuantityOrdered(0);
      setBonusPercentage(0);
      setPaymentMethod('');
      setOrderNotes('');
      
      // Refresh data
      fetchConsolidatedDrugs();
      fetchBarmanOrders();
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('خطا در ثبت سفارش');
    }
  };

  const openOrderDialog = (drug: ConsolidatedDrug) => {
    setSelectedDrug(drug);
    setQuantityOrdered(drug.total_quantity);
    setIsOrderDialogOpen(true);
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
      const allOrders = [...finalApprovalOrders, ...invoicePendingOrders, ...historyOrders];
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
        if (invoicePendingOrders.find(o => o.id === orderId)) {
          setInvoicePendingOrders(prevOrders => 
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
        if (invoicePendingOrders.find(o => o.id === order.id)) {
          setInvoicePendingOrders(prevOrders => 
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
    if (invoicePendingOrders.find(o => o.id === selectedOrder.id)) {
      setInvoicePendingOrders(prevOrders => 
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
      fetchConsolidatedDrugs();
    } catch (error) {
      console.error('Error issuing invoice:', error);
      toast.error('خطا در صدور فاکتور');
    }
  };

  const handleOrderAction = async (orderId: string, action: 'approve' | 'reject' | 'revision_bs' | 'revision_pm') => {
    try {
      let statusMap = {};
      
      // Different status mapping based on current order status
      if (selectedOrder?.workflow_status === 'payment_verified') {
        statusMap = {
          approve: 'completed', // تایید نهایی برای ارسال به تولیدکننده
          reject: 'rejected',
          revision_bs: 'needs_revision_bs',
          revision_pm: 'needs_revision_pm'
        };
      } else {
        statusMap = {
          approve: 'approved_pm',
          reject: 'rejected',
          revision_bs: 'needs_revision_bs',
          revision_pm: 'needs_revision_pm'
        };
      }

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
          from_status: selectedOrder?.workflow_status || 'approved_pm',
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
      fetchConsolidatedDrugs();
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
      'pending': { label: 'در انتظار بررسی', variant: 'secondary' },
      'approved_pm': { label: 'تایید شده توسط مدیر داروخانه', variant: 'default' },
      'approved_bs': { label: 'تایید شده توسط بارمان', variant: 'default' },
      'invoice_issued': { label: 'فاکتور صادر شده', variant: 'secondary' },
      'payment_uploaded': { label: 'رسید آپلود شده', variant: 'default' },
      'payment_verified': { label: 'پرداخت تایید شده', variant: 'default' },
      'completed': { label: 'تکمیل شده', variant: 'default' },
      'rejected': { label: 'رد شده', variant: 'destructive' },
      'needs_revision_ps': { label: 'نیاز به ویرایش کارمند', variant: 'destructive' },
      'needs_revision_pm': { label: 'نیاز به ویرایش مدیر داروخانه', variant: 'destructive' },
      'needs_revision_bs': { label: 'نیاز به ویرایش بارمان', variant: 'destructive' },
      'needs_revision_pa': { label: 'نیاز به ویرایش حسابداری', variant: 'destructive' },
      'payment_rejected': { label: 'پرداخت رد شده', variant: 'destructive' },
      // Legacy status support
      'approved': { label: 'تایید شده', variant: 'default' },
      'payment_completed': { label: 'پرداخت تکمیل شده', variant: 'default' },
      'final_approved': { label: 'تایید نهایی شده', variant: 'default' }
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getActionLabel = () => {
    if (selectedOrder?.workflow_status === 'payment_verified') {
      switch (pendingAction) {
        case 'approve': return 'تایید نهایی و ارسال به تولیدکننده';
        case 'reject': return 'رد سفارش';
        case 'revision_bs': return 'برگشت به حسابدار بارمان برای ویرایش';
        case 'revision_pm': return 'برگشت به مدیر داروخانه برای ویرایش';
        default: return '';
      }
    } else {
      switch (pendingAction) {
        case 'approve': return 'تایید نهایی سفارش';
        case 'reject': return 'رد سفارش';
        case 'revision_bs': return 'ارجاع به کارمند بارمان';
        case 'revision_pm': return 'ارجاع به مدیر داروخانه';
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
            {order.workflow_status === 'payment_verified' && order.accountant_notes ? (
              <p className="text-sm text-muted-foreground">یادداشت حسابدار: {order.accountant_notes}</p>
            ) : order.notes ? (
              <p className="text-sm text-muted-foreground">یادداشت: {order.notes}</p>
            ) : null}
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
                {order.workflow_status === 'approved_bs' && (
                  <>
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openActionDialog(order, 'revision_pm')}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      ارجاع به مدیر داروخانه
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openActionDialog(order, 'revision_bs')}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      ارجاع به کارمند بارمان
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
                {order.workflow_status === 'payment_verified' && (
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
                      onClick={() => openActionDialog(order, 'revision_bs')}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      برگشت به حسابدار بارمان
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

  const InvoicePendingTab = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        {invoicePendingOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">هیچ سفارشی برای صدور فاکتور وجود ندارد</p>
            </CardContent>
          </Card>
        ) : (
          invoicePendingOrders.map((order) => renderOrderCard(order, true))
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

  const ConsolidatedDrugsTab = () => {
    // Filter out drugs that have been ordered
    const availableDrugs = consolidatedDrugs.filter(drug => drug.status !== 'ordered');
    
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {availableDrugs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">هیچ داروی آماده سفارش وجود ندارد</p>
              </CardContent>
            </Card>
          ) : (
            availableDrugs.map((drug) => (
              <Card key={drug.drug_id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-lg">{drug.drug_name}</h3>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                            آماده سفارش
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="px-2 py-1 bg-secondary/20 rounded-md">{drug.drug_type}</span>
                          <span>شرکت: {drug.company_name}</span>
                        </div>
                      </div>
                      <div className="text-left space-y-1">
                        <div className="text-2xl font-bold text-primary">{drug.total_quantity}</div>
                        <div className="text-sm text-muted-foreground">مجموع تعداد</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">تعداد سفارشات:</span>
                          <span>{drug.orders_count}</span>
                        </div>
                        {drug.irc && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">کد IRC:</span>
                            <span className="font-mono">{drug.irc}</span>
                          </div>
                        )}
                        {drug.gtin && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">کد GTIN:</span>
                            <span className="font-mono">{drug.gtin}</span>
                          </div>
                        )}
                        {drug.erx_code && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">کد ERX:</span>
                            <span className="font-mono">{drug.erx_code}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">داروخانه‌های درخواست کننده:</div>
                        <div className="flex flex-wrap gap-1">
                          {drug.pharmacies.map((pharmacy, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-muted/30 rounded-md text-xs"
                            >
                              {pharmacy}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        onClick={() => openOrderDialog(drug)}
                        className="gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        ثبت سفارش
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
  };

  const ReportsTab = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        {barmanOrders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">هیچ سفارش ثبت شده‌ای وجود ندارد</p>
            </CardContent>
          </Card>
        ) : (
          barmanOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="font-medium text-lg">{order.drug_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="px-2 py-1 bg-secondary/20 rounded-md">{order.drug_type}</span>
                        <span>شرکت: {order.company_name}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                          سفارش ثبت شده
                        </span>
                      </div>
                    </div>
                    <div className="text-left space-y-1">
                      <div className="text-2xl font-bold text-primary">{order.total_received_quantity}</div>
                      <div className="text-sm text-muted-foreground">مجموع دریافتی</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">تعداد سفارش:</span>
                        <span>{order.quantity_ordered}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">درصد پاداش:</span>
                        <span>{order.bonus_percentage}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">مقدار پاداش:</span>
                        <span>{order.bonus_quantity}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">روش پرداخت:</span>
                        <span>{order.payment_method || 'نامشخص'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">تاریخ سفارش:</span>
                        <span>{new Date(order.order_date).toLocaleDateString('fa-IR')}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.irc && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">کد IRC:</span>
                          <span className="font-mono">{order.irc}</span>
                        </div>
                      )}
                      {order.gtin && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">کد GTIN:</span>
                          <span className="font-mono">{order.gtin}</span>
                        </div>
                      )}
                      {order.erx_code && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">کد ERX:</span>
                          <span className="font-mono">{order.erx_code}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {order.notes && (
                    <div className="pt-2 border-t">
                      <div className="text-sm">
                        <span className="font-medium">یادداشت:</span> {order.notes}
                      </div>
                    </div>
                  )}
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
        {/* Desktop - All Tabs */}
        <div className="desktop-only">
          <Tabs defaultValue="final-approval" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="consolidated" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                سفارشات تجمیعی
              </TabsTrigger>
              <TabsTrigger value="final-approval" className="gap-2">
                <CheckCircle className="h-4 w-4" />
                تایید نهایی
              </TabsTrigger>
              <TabsTrigger value="invoice-pending" className="gap-2">
                <FileText className="h-4 w-4" />
                صدور فاکتور
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                گزارشات بارمان
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                تاریخچه
              </TabsTrigger>
            </TabsList>

            <TabsContent value="consolidated" className="mt-6">
              <ConsolidatedDrugsTab />
            </TabsContent>

            <TabsContent value="final-approval" className="mt-6">
              <FinalApprovalTab />
            </TabsContent>

            <TabsContent value="invoice-pending" className="mt-6">
              <InvoicePendingTab />
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <ReportsTab />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <HistoryTab />
            </TabsContent>
          </Tabs>
        </div>

        {/* Mobile - Separated Tabs */}
        <div className="mobile-only">
          {activeTab === 'drugs' && (
            <ConsolidatedDrugsTab />
          )}
          
          {activeTab === 'reports' && (
            <Tabs value={activeReportsSubTab} onValueChange={setActiveReportsSubTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="final-approval" className="gap-2 text-xs">
                  <CheckCircle className="h-4 w-4" />
                  تایید نهایی
                </TabsTrigger>
                <TabsTrigger value="invoice-pending" className="gap-2 text-xs">
                  <FileText className="h-4 w-4" />
                  صدور فاکتور
                </TabsTrigger>
                <TabsTrigger value="consolidated" className="gap-2 text-xs">
                  <BarChart3 className="h-4 w-4" />
                  سفارشات تجمیعی
                </TabsTrigger>
              </TabsList>

              <TabsContent value="final-approval" className="mt-6">
                <FinalApprovalTab />
              </TabsContent>

              <TabsContent value="invoice-pending" className="mt-6">
                <InvoicePendingTab />
              </TabsContent>

              <TabsContent value="consolidated" className="mt-6">
                <ConsolidatedDrugsTab />
              </TabsContent>
            </Tabs>
          )}

          {activeTab === 'reports' && (
            <Tabs value={activeReportsSubTab} onValueChange={setActiveReportsSubTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  تاریخچه
                </TabsTrigger>
                <TabsTrigger value="barman-reports" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  گزارشات بارمان
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="mt-6">
                <HistoryTab />
              </TabsContent>

              <TabsContent value="barman-reports" className="mt-6">
                <ReportsTab />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        activeTab={activeTab}
        onTabChange={setActiveTab}
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

      {/* Order Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ثبت سفارش دارو</DialogTitle>
            <DialogDescription>
              {selectedDrug?.drug_name} - {selectedDrug?.company_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">تعداد سفارش</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantityOrdered}
                  onChange={(e) => setQuantityOrdered(Number(e.target.value))}
                  placeholder="تعداد"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonus">درصد پاداش</Label>
                <Input
                  id="bonus"
                  type="number"
                  value={bonusPercentage}
                  onChange={(e) => setBonusPercentage(Number(e.target.value))}
                  placeholder="درصد پاداش"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment">روش پرداخت</Label>
              <Input
                id="payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="روش پرداخت"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">یادداشت</Label>
              <Textarea
                id="notes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="یادداشت (اختیاری)"
              />
            </div>
            {quantityOrdered > 0 && bonusPercentage > 0 && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-sm space-y-1">
                  <div>تعداد سفارش: {quantityOrdered}</div>
                  <div>پاداش ({bonusPercentage}%): {Math.floor(quantityOrdered * (bonusPercentage / 100))}</div>
                  <div className="font-medium">مجموع دریافتی: {quantityOrdered + Math.floor(quantityOrdered * (bonusPercentage / 100))}</div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              انصراف
            </Button>
            <Button onClick={handlePlaceOrder}>
              ثبت سفارش
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BarmanManagerDashboard;