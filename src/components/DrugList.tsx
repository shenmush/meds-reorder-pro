import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Pill, Package, Search, ShoppingCart, Plus, Minus, Filter, Send, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { toast } from "sonner";
import EditOrderDialog from './EditOrderDialog';

interface Drug {
  id: string;
  name: string;
  irc: string;
  package_count: number | null;
  company_name: string | null;
  type: 'chemical' | 'medical' | 'natural';
  erx_code?: string;
  gtin?: string;
}

interface CartItem {
  drug: Drug;
  quantity: number;
}

interface PendingOrder {
  id: string;
  notes: string | null;
  created_at: string;
  total_items: number;
  workflow_status: string;
  items?: any[];
}

const DrugList: React.FC = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState("drugs");
  
  // Pending orders states
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [pendingOrdersLoading, setPendingOrdersLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<PendingOrder | null>(null);

  const ITEMS_PER_PAGE_SERVER = 50;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE_SERVER);

  useEffect(() => {
    fetchDrugs();
    if (activeTab === "orders") {
      fetchPendingOrders();
    }
  }, [currentPage, typeFilter, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchDrugs();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE_SERVER;
      const endIndex = startIndex + ITEMS_PER_PAGE_SERVER - 1;
      
      let query = supabase.from('chemical_drugs')
        .select('id, full_brand_name, irc, package_count, license_owner_company_name, erx_code, gtin', { count: 'exact' })
        .eq('is_active', true);

      if (searchTerm.trim() !== "") {
        query = query.or(`full_brand_name.ilike.%${searchTerm}%,irc.ilike.%${searchTerm}%,license_owner_company_name.ilike.%${searchTerm}%`);
      }

      if (typeFilter === "all" || typeFilter === "chemical") {
        const { data: chemicalData, error: chemicalError, count: chemicalCount } = await query
          .range(startIndex, endIndex);

        if (chemicalError) throw chemicalError;

        let allDrugs: Drug[] = [];
        let totalItems = chemicalCount || 0;

        if (chemicalData) {
          allDrugs.push(...chemicalData.map((drug: any) => ({
            id: drug.id,
            name: drug.full_brand_name,
            irc: drug.irc,
            package_count: drug.package_count,
            company_name: drug.license_owner_company_name,
            type: 'chemical' as const,
            erx_code: drug.erx_code,
            gtin: drug.gtin
          })));
        }

        setDrugs(allDrugs);
        setTotalCount(totalItems);
      }
    } catch (error) {
      console.error('Error fetching drugs:', error);
      toast.error('خطا در دریافت داروها');
      setDrugs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      setPendingOrdersLoading(true);
      
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('pharmacy_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (roleError || !userRole?.pharmacy_id) {
        return;
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('pharmacy_id', userRole.pharmacy_id)
        .in('workflow_status', ['pending', 'needs_revision_ps'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingOrders(orders || []);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      toast.error('خطا در بارگذاری سفارشات');
    } finally {
      setPendingOrdersLoading(false);
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

      const itemsWithDrugs = await Promise.all((data || []).map(async (item) => {
        const [chemical, medical, natural] = await Promise.all([
          supabase.from('chemical_drugs').select(`
            full_brand_name,
            license_owner_company_name,
            irc,
            gtin,
            erx_code,
            package_count
          `).eq('id', item.drug_id).maybeSingle(),
          supabase.from('medical_supplies').select(`
            title,
            license_owner_company_name,
            irc,
            gtin,
            erx_code,
            package_count
          `).eq('id', item.drug_id).maybeSingle(),
          supabase.from('natural_products').select(`
            full_en_brand_name,
            license_owner_name,
            irc,
            gtin,
            erx_code,
            package_count
          `).eq('id', item.drug_id).maybeSingle()
        ]);

        let drugInfo = {
          name: 'نامشخص',
          type: 'نامشخص',
          company: 'نامشخص',
          irc: 'نامشخص',
          gtin: 'نامشخص',
          erx_code: 'نامشخص',
          package_count: null
        };

        if (chemical.data) {
          drugInfo = {
            name: chemical.data.full_brand_name,
            type: 'دارو شیمیایی',
            company: chemical.data.license_owner_company_name || 'نامشخص',
            irc: chemical.data.irc || 'نامشخص',
            gtin: chemical.data.gtin || 'نامشخص',
            erx_code: chemical.data.erx_code || 'نامشخص',
            package_count: chemical.data.package_count
          };
        } else if (medical.data) {
          drugInfo = {
            name: medical.data.title,
            type: 'تجهیزات پزشکی',
            company: medical.data.license_owner_company_name || 'نامشخص',
            irc: medical.data.irc || 'نامشخص',
            gtin: medical.data.gtin || 'نامشخص',
            erx_code: medical.data.erx_code || 'نامشخص',
            package_count: medical.data.package_count
          };
        } else if (natural.data) {
          drugInfo = {
            name: natural.data.full_en_brand_name,
            type: 'محصولات طبیعی',
            company: natural.data.license_owner_name || 'نامشخص',
            irc: natural.data.irc || 'نامشخص',
            gtin: natural.data.gtin || 'نامشخص',
            erx_code: natural.data.erx_code || 'نامشخص',
            package_count: natural.data.package_count
          };
        }

        return {
          ...item,
          drug_name: drugInfo.name,
          drug_type: drugInfo.type,
          drug_company: drugInfo.company,
          drug_irc: drugInfo.irc,
          drug_gtin: drugInfo.gtin,
          drug_erx_code: drugInfo.erx_code,
          drug_package_count: drugInfo.package_count
        };
      }));

      return itemsWithDrugs;
    } catch (error) {
      console.error('Error fetching order items:', error);
      return [];
    }
  };

  const handleEditOrder = async (order: PendingOrder) => {
    const items = await fetchOrderItems(order.id);
    setSelectedOrderForEdit({ ...order, items });
    setEditDialogOpen(true);
  };

  const handleOrderUpdated = () => {
    fetchPendingOrders();
  };

  const getDrugTypeBadge = (type: string) => {
    const typeMap = {
      'chemical': { label: 'دارو', variant: 'default' as const },
      'medical': { label: 'تجهیزات پزشکی', variant: 'secondary' as const },
      'natural': { label: 'محصولات طبیعی', variant: 'outline' as const }
    };
    
    const config = typeMap[type as keyof typeof typeMap] || { label: type, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const addToCart = (drug: Drug) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.drug.id === drug.id);
      if (existingItem) {
        return prev.map(item =>
          item.drug.id === drug.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { drug, quantity: 1 }];
      }
    });
    toast.success(`${drug.name} به سبد خرید اضافه شد`);
  };

  const updateCartQuantity = (drugId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.drug.id !== drugId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.drug.id === drugId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      toast.error('سبد خرید خالی است');
      return;
    }

    try {
      setSubmittingOrder(true);

      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('pharmacy_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (roleError || !userRole?.pharmacy_id) {
        toast.error('خطا در شناسایی داروخانه کاربر');
        return;
      }

      const currentUser = (await supabase.auth.getUser()).data.user;
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          pharmacy_id: userRole.pharmacy_id,
          total_items: getTotalItems(),
          notes: orderNotes || null,
          status: 'pending',
          workflow_status: 'pending',
          created_by: currentUser?.id
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: order.id,
        drug_id: item.drug.id,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success('سفارش با موفقیت ثبت شد');
      setCart([]);
      setOrderNotes("");
      setIsCartOpen(false);

    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('خطا در ثبت سفارش');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drugs" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            فهرست داروها
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            سفارشات قابل ویرایش
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drugs" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    فهرست داروها و تجهیزات پزشکی
                  </CardTitle>
                  <CardDescription>
                    جستجو و سفارش داروها، تجهیزات پزشکی و محصولات طبیعی
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setIsCartOpen(true)}
                  className="gap-2"
                  variant={cart.length > 0 ? "default" : "outline"}
                >
                  <ShoppingCart className="h-4 w-4" />
                  سبد خرید {cart.length > 0 && `(${getTotalItems()})`}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="جستجو در فهرست داروها..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="نوع محصول" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه محصولات</SelectItem>
                      <SelectItem value="chemical">داروهای شیمیایی</SelectItem>
                      <SelectItem value="medical">تجهیزات پزشکی</SelectItem>
                      <SelectItem value="natural">محصولات طبیعی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">در حال جستجو...</p>
                  </div>
                </div>
              ) : drugs.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchTerm || typeFilter !== "all" ? 'نتیجه‌ای یافت نشد' : 'هیچ دارویی در سیستم ثبت نشده است'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {drugs.map((drug) => (
                    <Card key={drug.id} className="hover:shadow-md transition-shadow border-border/60 rounded-xl overflow-hidden">
                      <CardContent className="p-4 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            {getDrugTypeBadge(drug.type)}
                          </div>
                          
                          <h3 className="font-bold text-lg leading-tight text-foreground">
                            {drug.name}
                          </h3>
                        </div>

                        {drug.company_name && (
                          <div className="flex items-center gap-2 text-sm">
                            <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate">{drug.company_name}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-muted/20 p-2 rounded-lg">
                            <div className="text-xs text-muted-foreground">کد IRC</div>
                            <div className="font-mono text-xs font-medium">{drug.irc}</div>
                          </div>
                          {drug.package_count && (
                            <div className="bg-muted/20 p-2 rounded-lg">
                              <div className="text-xs text-muted-foreground">تعداد در بسته</div>
                              <div className="font-medium">{drug.package_count}</div>
                            </div>
                          )}
                        </div>

                        <Button
                          onClick={() => addToCart(drug)}
                          className="w-full gap-2 btn-primary"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          افزودن به سبد
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                سفارشات قابل ویرایش
              </CardTitle>
              <CardDescription>
                سفارشاتی که هنوز تایید نشده‌اند و قابل ویرایش هستند
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingOrdersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">در حال بارگذاری...</p>
                  </div>
                </div>
              ) : pendingOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    هیچ سفارش قابل ویرایشی وجود ندارد
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">سفارش #{order.id.slice(0, 8)}</h4>
                            <p className="text-sm text-muted-foreground">
                              تاریخ ثبت: {new Date(order.created_at).toLocaleDateString('fa-IR')}
                            </p>
                            <p className="text-sm">تعداد آیتم‌ها: {order.total_items}</p>
                            {order.notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                یادداشت: {order.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={order.workflow_status === 'pending' ? 'secondary' : 'destructive'}>
                              {order.workflow_status === 'pending' ? 'در انتظار بررسی' : 'نیاز به ویرایش'}
                            </Badge>
                            <Button
                              onClick={() => handleEditOrder(order)}
                              className="gap-2"
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                              ویرایش
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>سبد خرید</DialogTitle>
            <DialogDescription>
              بررسی و ثبت سفارش داروها
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">سبد خرید خالی است</p>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.drug.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.drug.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {getDrugTypeBadge(item.drug.type)}
                          <span className="text-sm text-muted-foreground">IRC: {item.drug.irc}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartQuantity(item.drug.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartQuantity(item.drug.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                    <span className="font-medium">مجموع آیتم‌ها:</span>
                    <span className="text-lg font-bold">{getTotalItems()} عدد</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="order-notes">یادداشت سفارش (اختیاری)</Label>
                    <Textarea
                      id="order-notes"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="یادداشت برای سفارش..."
                      rows={3}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCartOpen(false)}>
              بستن
            </Button>
            <Button 
              onClick={submitOrder} 
              disabled={cart.length === 0 || submittingOrder}
              className="gap-2"
            >
              {submittingOrder && <Loader2 className="h-4 w-4 animate-spin" />}
              <Send className="h-4 w-4" />
              ثبت سفارش
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      {selectedOrderForEdit && (
        <EditOrderDialog
          isOpen={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setSelectedOrderForEdit(null);
          }}
          orderId={selectedOrderForEdit.id}
          orderItems={selectedOrderForEdit.items || []}
          orderNotes={selectedOrderForEdit.notes}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </div>
  );
};

export default DrugList;