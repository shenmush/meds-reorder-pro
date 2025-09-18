import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, ChevronDown, ChevronUp, Package, CheckCircle, Clock, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  quantity: number;
  drug_id: string;
  drug_name: string;
  drug_type: string;
  drug_company?: string;
  irc?: string;
  gtin?: string;
  erx_code?: string;
  is_ordered?: boolean; // آیا این آیتم از طریق بارمان سفارش داده شده یا نه
  barman_order_quantity?: number; // مقدار سفارش داده شده از طریق بارمان
}

interface TrackedOrder {
  id: string;
  workflow_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  total_items: number;
  items: OrderItem[];
  completed_items: number;
  pending_items: number;
}

interface PharmacyOrderTrackingProps {
  pharmacyId: string;
}

const PharmacyOrderTracking: React.FC<PharmacyOrderTrackingProps> = ({ pharmacyId }) => {
  const [trackedOrders, setTrackedOrders] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTrackedOrders();
  }, [pharmacyId]);

  const fetchTrackedOrders = async () => {
    try {
      setLoading(true);
      
      // دریافت سفارشاتی که توسط حسابدار بارمان تایید شده و منتظر سفارش‌گیری نهایی هستند
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .eq('workflow_status', 'payment_verified')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        setTrackedOrders([]);
        return;
      }

      // برای هر سفارش، آیتم‌هایش رو بگیریم
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

          if (itemsError) throw itemsError;

          // برای هر آیتم، بررسی کنیم که آیا از طریق barman_orders سفارش داده شده یا نه
          const itemsWithTracking = await Promise.all(
            (orderItems || []).map(async (item) => {
              // جزئیات دارو رو بگیریم
              const [chemical, medical, natural] = await Promise.all([
                supabase
                  .from('chemical_drugs')
                  .select('full_brand_name, license_owner_company_name, irc, gtin, erx_code')
                  .eq('id', item.drug_id)
                  .maybeSingle(),
                supabase
                  .from('medical_supplies')
                  .select('title, license_owner_company_name, irc, gtin, erx_code')
                  .eq('id', item.drug_id)
                  .maybeSingle(),
                supabase
                  .from('natural_products')
                  .select('full_en_brand_name, license_owner_name, irc, gtin, erx_code')
                  .eq('id', item.drug_id)
                  .maybeSingle()
              ]);

              let drugInfo = {
                name: 'نامشخص',
                type: 'نامشخص',
                company: 'نامشخص',
                irc: undefined,
                gtin: undefined,
                erx_code: undefined
              };

              if (chemical.data) {
                drugInfo = {
                  name: chemical.data.full_brand_name,
                  type: 'دارو شیمیایی',
                  company: chemical.data.license_owner_company_name || 'نامشخص',
                  irc: chemical.data.irc,
                  gtin: chemical.data.gtin,
                  erx_code: chemical.data.erx_code
                };
              } else if (medical.data) {
                drugInfo = {
                  name: medical.data.title,
                  type: 'تجهیزات پزشکی',
                  company: medical.data.license_owner_company_name || 'نامشخص',
                  irc: medical.data.irc,
                  gtin: medical.data.gtin,
                  erx_code: medical.data.erx_code
                };
              } else if (natural.data) {
                drugInfo = {
                  name: natural.data.full_en_brand_name,
                  type: 'محصولات طبیعی',
                  company: natural.data.license_owner_name || 'نامشخص',
                  irc: natural.data.irc,
                  gtin: natural.data.gtin,
                  erx_code: natural.data.erx_code
                };
              }

              // بررسی کنیم که آیا این order_item از طریق barman_orders سفارش داده شده
              let isOrderedByBarman = false;
              let barmanOrderQuantity = 0;

              // چک کردن consolidated_drug_status که order_item_ids داره
              const { data: drugStatus } = await supabase
                .from('consolidated_drug_status')
                .select('status, order_item_ids')
                .eq('drug_id', item.drug_id)
                .contains('order_item_ids', [item.id])
                .maybeSingle();

              if (drugStatus?.status === 'ordered') {
                isOrderedByBarman = true;
                // مقدار سفارش داده شده رو از barman_orders بگیریم
                const { data: barmanOrder } = await supabase
                  .from('barman_orders')
                  .select('quantity_ordered')
                  .eq('drug_id', item.drug_id)
                  .maybeSingle();
                
                barmanOrderQuantity = barmanOrder?.quantity_ordered || item.quantity;
              }

              return {
                ...item,
                drug_name: drugInfo.name,
                drug_type: drugInfo.type,
                drug_company: drugInfo.company,
                irc: drugInfo.irc,
                gtin: drugInfo.gtin,
                erx_code: drugInfo.erx_code,
                is_ordered: isOrderedByBarman,
                barman_order_quantity: barmanOrderQuantity
              };
            })
          );

          // محاسبه آمار
          const completedItems = itemsWithTracking.filter(item => item.is_ordered).length;
          const pendingItems = itemsWithTracking.length - completedItems;

          return {
            ...order,
            items: itemsWithTracking,
            completed_items: completedItems,
            pending_items: pendingItems
          };
        })
      );

      setTrackedOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching tracked orders:', error);
      toast.error('خطا در بارگذاری سفارشات');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (expandedOrders.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getProgressBadge = (completedItems: number, totalItems: number) => {
    if (completedItems === 0) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">در انتظار</Badge>;
    } else if (completedItems === totalItems) {
      return <Badge variant="default" className="bg-green-100 text-green-800">تکمیل شده</Badge>;
    } else {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">در حال انجام</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (trackedOrders.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">هیچ سفارش تاییدشده‌ای برای پیگیری وجود ندارد</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">پیگیری سفارشات تایید شده</h3>
      </div>
      
      <div className="space-y-4">
        {trackedOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    سفارش {new Date(order.created_at).toLocaleDateString('fa-IR')}
                  </CardTitle>
                  <CardDescription>
                    {order.total_items} آیتم • {order.completed_items} تکمیل شده • {order.pending_items} در انتظار
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getProgressBadge(order.completed_items, order.total_items)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleOrderExpansion(order.id)}
                  >
                    {expandedOrders.has(order.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedOrders.has(order.id) && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">جزئیات آیتم‌ها:</h4>
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border ${
                        item.is_ordered 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-sm">{item.drug_name}</h5>
                            {item.is_ordered ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.drug_type} • {item.drug_company}
                          </p>
                          {item.irc && (
                            <p className="text-xs text-muted-foreground">IRC: {item.irc}</p>
                          )}
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">
                            {item.is_ordered ? item.barman_order_quantity : item.quantity} عدد
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.is_ordered ? 'سفارش داده شده' : `از ${item.quantity} مورد نیاز`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PharmacyOrderTracking;