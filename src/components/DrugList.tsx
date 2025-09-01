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
import { Loader2, Pill, Package, Search, ShoppingCart, Plus, Minus, Filter, Send, ChevronLeft, ChevronRight } from "lucide-react";
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

const ITEMS_PER_PAGE = 12;

// Drug Cart Controls Component
const DrugCartControls: React.FC<{ drug: Drug; onAddToCart: (drug: Drug, quantity: number) => void }> = ({ drug, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(drug, quantity);
    setQuantity(1); // Reset after adding
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleQuantityChange(quantity - 1)}
          className="h-8 w-8 p-0 rounded-lg"
          disabled={quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <Input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
          className="w-16 text-center h-8 rounded-lg"
        />
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleQuantityChange(quantity + 1)}
          className="h-8 w-8 p-0 rounded-lg"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <Button
        size="sm"
        onClick={handleAddToCart}
        className="gap-2 rounded-lg"
      >
        <ShoppingCart className="h-3 w-3" />
        افزودن
      </Button>
    </div>
  );
};

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
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredDrugs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDrugs = filteredDrugs.slice(startIndex, endIndex);

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
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, typeFilter, drugs]);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      
      // Fetch with range-based pagination to get all records
      const BATCH_SIZE = 1000;
      let allChemicalDrugs: any[] = [];
      let allMedicalSupplies: any[] = [];
      let allNaturalProducts: any[] = [];

      // Fetch chemical drugs in batches
      let start = 0;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase
          .from('chemical_drugs')
          .select('id, full_brand_name, irc, package_count, license_owner_company_name, erx_code, gtin')
          .eq('is_active', true)
          .range(start, start + BATCH_SIZE - 1);
        
        if (error) throw error;
        if (data && data.length > 0) {
          allChemicalDrugs.push(...data);
          start += BATCH_SIZE;
          hasMore = data.length === BATCH_SIZE;
        } else {
          hasMore = false;
        }
      }

      // Fetch medical supplies in batches
      start = 0;
      hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase
          .from('medical_supplies')
          .select('id, title, irc, package_count, license_owner_company_name, erx_code, gtin')
          .eq('is_active', true)
          .range(start, start + BATCH_SIZE - 1);
        
        if (error) throw error;
        if (data && data.length > 0) {
          allMedicalSupplies.push(...data);
          start += BATCH_SIZE;
          hasMore = data.length === BATCH_SIZE;
        } else {
          hasMore = false;
        }
      }

      // Fetch natural products in batches
      start = 0;
      hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase
          .from('natural_products')
          .select('id, full_en_brand_name, irc, package_count, license_owner_name, erx_code, gtin')
          .eq('is_active', true)
          .range(start, start + BATCH_SIZE - 1);
        
        if (error) throw error;
        if (data && data.length > 0) {
          allNaturalProducts.push(...data);
          start += BATCH_SIZE;
          hasMore = data.length === BATCH_SIZE;
        } else {
          hasMore = false;
        }
      }

      const combinedDrugs: Drug[] = [
        ...allChemicalDrugs.map((drug: any) => ({
          id: drug.id,
          name: drug.full_brand_name,
          irc: drug.irc,
          package_count: drug.package_count,
          company_name: drug.license_owner_company_name,
          erx_code: drug.erx_code,
          gtin: drug.gtin,
          type: 'chemical' as const
        })),
        ...allMedicalSupplies.map((supply: any) => ({
          id: supply.id,
          name: supply.title,
          irc: supply.irc,
          package_count: supply.package_count,
          company_name: supply.license_owner_company_name,
          erx_code: supply.erx_code,
          gtin: supply.gtin,
          type: 'medical' as const
        })),
        ...allNaturalProducts.map((product: any) => ({
          id: product.id,
          name: product.full_en_brand_name,
          irc: product.irc,
          package_count: product.package_count,
          company_name: product.license_owner_name,
          erx_code: product.erx_code,
          gtin: product.gtin,
          type: 'natural' as const
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

  const addToCartWithQuantity = (drug: Drug, quantity: number) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.drug.id === drug.id);
      if (existingItem) {
        return prev.map(item =>
          item.drug.id === drug.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { drug, quantity }];
      }
    });
    toast.success(`${quantity} عدد ${drug.name} به سبد خرید اضافه شد`);
  };

  const addToCart = (drug: Drug) => {
    addToCartWithQuantity(drug, 1);
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
        .maybeSingle();

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

  const goToPage = (page: number) => {
    setCurrentPage(page);
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
          
          {currentDrugs.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== "all" ? 'نتیجه‌ای یافت نشد' : 'هیچ دارویی در سیستم ثبت نشده است'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentDrugs.map((drug) => (
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
                        <div className="text-xs text-muted-foreground mb-1">کد IRC</div>
                        <div className="font-mono text-xs">{drug.irc}</div>
                      </div>

                      {drug.package_count && (
                        <div className="bg-muted/20 p-2 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">تعداد بسته</div>
                          <div className="text-xs font-medium">{drug.package_count}</div>
                        </div>
                      )}

                      {drug.erx_code && (
                        <div className="bg-muted/20 p-2 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">کد ERX</div>
                          <div className="font-mono text-xs">{drug.erx_code}</div>
                        </div>
                      )}

                      {drug.gtin && (
                        <div className="bg-muted/20 p-2 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">کد GTIN</div>
                          <div className="font-mono text-xs">{drug.gtin}</div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/60">
                      <DrugCartControls drug={drug} onAddToCart={addToCartWithQuantity} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Smart Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-2"
              >
                <ChevronRight className="h-4 w-4" />
                قبلی
              </Button>
              
              <div className="flex items-center gap-1">
                {(() => {
                  const pages = [];
                  
                  if (totalPages <= 7) {
                    // Show all pages if 7 or fewer
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(
                        <Button
                          key={i}
                          variant={currentPage === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(i)}
                          className="w-8"
                        >
                          {i}
                        </Button>
                      );
                    }
                  } else {
                    // Show smart pagination
                    // Always show first page
                    pages.push(
                      <Button
                        key={1}
                        variant={currentPage === 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(1)}
                        className="w-8"
                      >
                        1
                      </Button>
                    );

                    if (currentPage > 3) {
                      pages.push(
                        <span key="dots1" className="px-1 text-muted-foreground">...</span>
                      );
                    }

                    // Show pages around current page
                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);
                    
                    for (let i = start; i <= end; i++) {
                      if (i !== 1 && i !== totalPages) {
                        pages.push(
                          <Button
                            key={i}
                            variant={currentPage === i ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(i)}
                            className="w-8"
                          >
                            {i}
                          </Button>
                        );
                      }
                    }

                    if (currentPage < totalPages - 2) {
                      pages.push(
                        <span key="dots2" className="px-1 text-muted-foreground">...</span>
                      );
                    }

                    // Always show last page
                    if (totalPages > 1) {
                      pages.push(
                        <Button
                          key={totalPages}
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(totalPages)}
                          className="w-8"
                        >
                          {totalPages}
                        </Button>
                      );
                    }
                  }
                  
                  return pages;
                })()}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="gap-2"
              >
                بعدی
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Results summary */}
          <div className="text-center text-sm text-muted-foreground mt-4">
            نمایش {startIndex + 1} تا {Math.min(endIndex, filteredDrugs.length)} از {filteredDrugs.length} نتیجه
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