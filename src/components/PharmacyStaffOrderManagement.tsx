import { useState, useEffect } from "react";
import { User } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Package, Edit, Eye, Send } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  workflow_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  total_items: number;
  pharmacy_id: string;
}

interface OrderItem {
  id: string;
  drug_id: string;
  quantity: number;
  chemical_drugs?: {
    full_brand_name: string;
    irc: string;
  };
  natural_products?: {
    full_en_brand_name: string;
    irc: string;
  };
  medical_supplies?: {
    title: string;
    irc: string;
  };
}

interface PharmacyStaffOrderManagementProps {
  user: User;
}

const PharmacyStaffOrderManagement: React.FC<PharmacyStaffOrderManagementProps> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // First get user's pharmacy
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('pharmacy_id')
        .eq('user_id', user.id)
        .eq('role', 'pharmacy_staff')
        .single();

      if (roleError) throw roleError;
      if (!userRole?.pharmacy_id) {
        toast.error('شما به هیچ داروخانه‌ای تعلق ندارید');
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('pharmacy_id', userRole.pharmacy_id)
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
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      
      // Fetch drug details separately based on drug_id
      const itemsWithDetails = await Promise.all(
        (data || []).map(async (item) => {
          // Try to find in chemical_drugs first
          let drugDetails = null;
          const { data: chemicalDrug } = await supabase
            .from('chemical_drugs')
            .select('full_brand_name, irc')
            .eq('id', item.drug_id)
            .single();
            
          if (chemicalDrug) {
            drugDetails = { chemical_drugs: chemicalDrug };
          } else {
            // Try natural_products
            const { data: naturalProduct } = await supabase
              .from('natural_products')
              .select('full_en_brand_name, irc')
              .eq('id', item.drug_id)
              .single();
              
            if (naturalProduct) {
              drugDetails = { natural_products: naturalProduct };
            } else {
              // Try medical_supplies
              const { data: medicalSupply } = await supabase
                .from('medical_supplies')
                .select('title, irc')
                .eq('id', item.drug_id)
                .single();
                
              if (medicalSupply) {
                drugDetails = { medical_supplies: medicalSupply };
              }
            }
          }
          
          return { ...item, ...drugDetails };
        })
      );
      
      setOrderItems(itemsWithDetails);
    } catch (error) {
      console.error('Error fetching order items:', error);
      toast.error('خطا در بارگذاری اقلام سفارش');
    }
  };

  const handleViewOrder = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
    setViewDialogOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setNotes(order.notes || "");
    setEditDialogOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          notes: notes.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      toast.success('سفارش با موفقیت به‌روزرسانی شد');
      setEditDialogOpen(false);
      await fetchOrders();
      
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('خطا در به‌روزرسانی سفارش');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'در انتظار بررسی', variant: 'secondary' as const },
      'approved': { label: 'تایید شده', variant: 'default' as const },
      'needs_revision_ps': { label: 'نیاز به ویرایش', variant: 'destructive' as const },
      'needs_revision_pm': { label: 'نیاز به ویرایش مدیر', variant: 'destructive' as const },
      'approved_bs': { label: 'در حال پردازش', variant: 'default' as const },
      'invoice_issued': { label: 'فاکتور صادر شده', variant: 'secondary' as const },
      'payment_uploaded': { label: 'رسید آپلود شده', variant: 'default' as const },
      'payment_rejected': { label: 'پرداخت رد شده', variant: 'destructive' as const },
      'payment_verified': { label: 'پرداخت تایید شده', variant: 'default' as const },
      'rejected': { label: 'رد شده', variant: 'destructive' as const },
      'completed': { label: 'تکمیل شده', variant: 'default' as const },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const canEditOrder = (status: string) => {
    return status === 'needs_revision_ps' || status === 'pending';
  };

  const getDrugName = (item: OrderItem) => {
    if (item.chemical_drugs) return item.chemical_drugs.full_brand_name;
    if (item.natural_products) return item.natural_products.full_en_brand_name;
    if (item.medical_supplies) return item.medical_supplies.title;
    return 'نامشخص';
  };

  const getDrugIRC = (item: OrderItem) => {
    if (item.chemical_drugs) return item.chemical_drugs.irc;
    if (item.natural_products) return item.natural_products.irc;
    if (item.medical_supplies) return item.medical_supplies.irc;
    return 'نامشخص';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مدیریت سفارشات</h1>
          <p className="text-muted-foreground">مشاهده و ویرایش سفارشات داروخانه</p>
        </div>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">هیچ سفارشی یافت نشد</p>
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
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      مشاهده
                    </Button>
                    {canEditOrder(order.workflow_status) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditOrder(order)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        ویرایش
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>جزئیات سفارش #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
            <DialogDescription>
              تاریخ ثبت: {selectedOrder && new Date(selectedOrder.created_at).toLocaleDateString('fa-IR')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span>وضعیت:</span>
              {selectedOrder && getStatusBadge(selectedOrder.workflow_status)}
            </div>
            
            {selectedOrder?.notes && (
              <div>
                <Label>یادداشت سفارش:</Label>
                <p className="text-sm text-muted-foreground mt-1">{selectedOrder.notes}</p>
              </div>
            )}

            <div>
              <Label>اقلام سفارش:</Label>
              <div className="space-y-2 mt-2">
                {orderItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{getDrugName(item)}</p>
                          <p className="text-sm text-muted-foreground">IRC: {getDrugIRC(item)}</p>
                        </div>
                        <Badge variant="outline">تعداد: {item.quantity}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش سفارش #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
            <DialogDescription>
              یادداشت سفارش را ویرایش کنید
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">یادداشت سفارش</Label>
              <Textarea
                id="notes"
                placeholder="یادداشت خود را وارد کنید..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
                disabled={updating}
              >
                لغو
              </Button>
              <Button 
                onClick={handleUpdateOrder}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    در حال به‌روزرسانی...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    به‌روزرسانی
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PharmacyStaffOrderManagement;