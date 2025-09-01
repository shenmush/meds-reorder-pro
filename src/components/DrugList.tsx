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
import { Loader2, Pill, Package, Search, ShoppingCart, Plus, Minus, Filter, Send } from "lucide-react";
import { toast } from "sonner";

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

const DrugList: React.FC = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    fetchDrugs();
  }, []);

  useEffect(() => {
    let filtered = drugs;

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(drug => 
        drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.irc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (drug.company_name && drug.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(drug => drug.type === typeFilter);
    }

    setFilteredDrugs(filtered);
  }, [searchTerm, typeFilter, drugs]);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      
      // Fetch from all three tables
      const [chemicalResult, medicalResult, naturalResult] = await Promise.all([
        supabase
          .from('chemical_drugs')
          .select('id, full_brand_name, irc, package_count, license_owner_company_name, erx_code, gtin')
          .eq('is_active', true),
        supabase
          .from('medical_supplies')
          .select('id, title, irc, package_count, license_owner_company_name, erx_code, gtin')
          .eq('is_active', true),
        supabase
          .from('natural_products')
          .select('id, full_en_brand_name, irc, package_count, license_owner_name, erx_code, gtin')
          .eq('is_active', true)
      ]);

      const combinedDrugs: Drug[] = [
        ...(chemicalResult.data || []).map(item => ({
          id: item.id,
          name: item.full_brand_name,
          irc: item.irc,
          package_count: item.package_count,
          company_name: item.license_owner_company_name,
          type: 'chemical' as const,
          erx_code: item.erx_code || undefined,
          gtin: item.gtin || undefined
        })),
        ...(medicalResult.data || []).map(item => ({
          id: item.id,
          name: item.title,
          irc: item.irc,
          package_count: item.package_count,
          company_name: item.license_owner_company_name,
          type: 'medical' as const,
          erx_code: item.erx_code || undefined,
          gtin: item.gtin || undefined
        })),
        ...(naturalResult.data || []).map(item => ({
          id: item.id,
          name: item.full_en_brand_name,
          irc: item.irc,
          package_count: item.package_count,
          company_name: item.license_owner_name,
          type: 'natural' as const,
          erx_code: item.erx_code || undefined,
          gtin: item.gtin || undefined
        }))
      ];

      setDrugs(combinedDrugs);
      setFilteredDrugs(combinedDrugs);
    } catch (error) {
      console.error('Error fetching drugs:', error);
      toast.error('خطا در بارگذاری فهرست داروها');
    } finally {
      setLoading(false);
    }
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

      // Get user's pharmacy ID
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('pharmacy_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (roleError || !userRole?.pharmacy_id) {
        toast.error('خطا در شناسایی داروخانه کاربر');
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          pharmacy_id: userRole.pharmacy_id,
          total_items: getTotalItems(),
          notes: orderNotes || null,
          status: 'pending',
          workflow_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order items
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">در حال بارگذاری فهرست داروها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                فهرست داروها و تجهیزات پزشکی
              </CardTitle>
              <CardDescription>
                مجموعه کامل داروها، تجهیزات پزشکی و محصولات طبیعی موجود در سیستم
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
          
          <div className="grid gap-4">
            {filteredDrugs.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || typeFilter !== "all" ? 'نتیجه‌ای یافت نشد' : 'هیچ دارویی در سیستم ثبت نشده است'}
                </p>
              </div>
            ) : (
              filteredDrugs.map((drug) => (
                <Card key={drug.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{drug.name}</h3>
                          {getDrugTypeBadge(drug.type)}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p><span className="font-medium">کد IRC:</span> {drug.irc}</p>
                          {drug.company_name && (
                            <p><span className="font-medium">شرکت سازنده:</span> {drug.company_name}</p>
                          )}
                          {drug.package_count && (
                            <p><span className="font-medium">تعداد در بسته:</span> {drug.package_count}</p>
                          )}
                          {drug.erx_code && (
                            <p><span className="font-medium">کد ERX:</span> {drug.erx_code}</p>
                          )}
                          {drug.gtin && (
                            <p><span className="font-medium">کد GTIN:</span> {drug.gtin}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => addToCart(drug)}
                          size="sm"
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          افزودن به سبد
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              سبد خرید ({getTotalItems()} قلم)
            </DialogTitle>
            <DialogDescription>
              بررسی و تایید نهایی سفارش
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">سبد خرید خالی است</p>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <Card key={item.drug.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.drug.name}</h4>
                          <p className="text-sm text-muted-foreground">کد IRC: {item.drug.irc}</p>
                          {getDrugTypeBadge(item.drug.type)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(item.drug.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCartQuantity(item.drug.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="order-notes">یادداشت سفارش (اختیاری)</Label>
                    <Textarea
                      id="order-notes"
                      placeholder="توضیحات اضافی برای سفارش..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCartOpen(false)}>
              بستن
            </Button>
            {cart.length > 0 && (
              <Button 
                onClick={submitOrder} 
                disabled={submittingOrder}
                className="gap-2"
              >
                {submittingOrder ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                ثبت سفارش
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrugList;