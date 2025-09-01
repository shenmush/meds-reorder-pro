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

const ITEMS_PER_PAGE = 50;

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
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  useEffect(() => {
    fetchDrugs();
  }, [currentPage, searchTerm, typeFilter]);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      let allDrugs: Drug[] = [];
      let totalItems = 0;

      if (typeFilter === "all" || typeFilter === "chemical") {
        // Fetch chemical drugs
        let query = supabase.from('chemical_drugs')
          .select('id, full_brand_name, irc, package_count, license_owner_company_name, erx_code, gtin', { count: 'exact' })
          .eq('is_active', true);

        // Apply search filter
        if (searchTerm.trim() !== "") {
          query = query.or(`full_brand_name.ilike.%${searchTerm}%,irc.ilike.%${searchTerm}%,license_owner_company_name.ilike.%${searchTerm}%`);
        }

        const { data: chemicalData, error: chemicalError, count: chemicalCount } = await query
          .range(offset, offset + ITEMS_PER_PAGE - 1);

        if (chemicalError) throw chemicalError;

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

        if (typeFilter === "chemical") {
          totalItems = chemicalCount || 0;
        } else {
          // For "all", we need to get total count from all tables
          // For simplicity, we'll approximate based on chemical drugs count
          totalItems = chemicalCount || 0;
        }
      }

      if (typeFilter === "all" || typeFilter === "medical") {
        if (typeFilter === "medical" || allDrugs.length < ITEMS_PER_PAGE) {
          // Fetch medical supplies
          let medicalQuery = supabase.from('medical_supplies')
            .select('id, brand_name, irc, package_count, license_owner_company_name', { count: 'exact' })
            .eq('is_active', true);

          if (searchTerm.trim() !== "") {
            medicalQuery = medicalQuery.or(`brand_name.ilike.%${searchTerm}%,irc.ilike.%${searchTerm}%,license_owner_company_name.ilike.%${searchTerm}%`);
          }

          const medicalOffset = typeFilter === "medical" ? offset : Math.max(0, offset - (totalItems));
          const medicalLimit = typeFilter === "medical" ? ITEMS_PER_PAGE : ITEMS_PER_PAGE - allDrugs.length;

          const { data: medicalData, error: medicalError, count: medicalCount } = await medicalQuery
            .range(medicalOffset, medicalOffset + medicalLimit - 1);

          if (!medicalError && medicalData) {
            allDrugs.push(...medicalData.map((drug: any) => ({
              id: drug.id,
              name: drug.brand_name,
              irc: drug.irc,
              package_count: drug.package_count,
              company_name: drug.license_owner_company_name,
              type: 'medical' as const
            })));
          }

          if (typeFilter === "medical") {
            totalItems = medicalCount || 0;
          } else {
            totalItems += medicalCount || 0;
          }
        }
      }

      if (typeFilter === "all" || typeFilter === "natural") {
        if (typeFilter === "natural" || allDrugs.length < ITEMS_PER_PAGE) {
          // Fetch natural products
          let naturalQuery = supabase.from('natural_products')
            .select('id, persian_name, code, company_name', { count: 'exact' })
            .eq('is_active', true);

          if (searchTerm.trim() !== "") {
            naturalQuery = naturalQuery.or(`persian_name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`);
          }

          const naturalOffset = typeFilter === "natural" ? offset : Math.max(0, offset - totalItems);
          const naturalLimit = typeFilter === "natural" ? ITEMS_PER_PAGE : ITEMS_PER_PAGE - allDrugs.length;

          const { data: naturalData, error: naturalError, count: naturalCount } = await naturalQuery
            .range(naturalOffset, naturalOffset + naturalLimit - 1);

          if (!naturalError && naturalData) {
            allDrugs.push(...naturalData.map((drug: any) => ({
              id: drug.id,
              name: drug.persian_name,
              irc: drug.code,
              package_count: null,
              company_name: drug.company_name,
              type: 'natural' as const
            })));
          }

          if (typeFilter === "natural") {
            totalItems = naturalCount || 0;
          } else {
            totalItems += naturalCount || 0;
          }
        }
      }

      setDrugs(allDrugs);
      setTotalCount(totalItems);
    } catch (error) {
      console.error('Error fetching drugs:', error);
      toast.error('خطا در دریافت داروها');
      setDrugs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const addToCartWithQuantity = (drug: Drug, quantity: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.drug.id === drug.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.drug.id === drug.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { drug, quantity }];
      }
    });
    toast.success(`${drug.name} به سبد خرید اضافه شد`);
  };

  const updateCartItemQuantity = (drugId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(drugId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.drug.id === drugId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (drugId: string) => {
    setCart(prevCart => prevCart.filter(item => item.drug.id !== drugId));
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      toast.error('سبد خرید خالی است');
      return;
    }

    try {
      setSubmittingOrder(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('لطفاً ابتدا وارد حساب کاربری خود شوید');
        return;
      }

      // Get user's pharmacy
      const { data: profile } = await supabase
        .from('user_roles')
        .select('pharmacy_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.pharmacy_id) {
        toast.error('داروخانه شما در سیستم ثبت نشده است');
        return;
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          pharmacy_id: profile.pharmacy_id,
          notes: orderNotes,
          total_amount: 0, // Will be calculated later
          workflow_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        drug_id: item.drug.id,
        drug_name: item.drug.name,
        drug_irc: item.drug.irc,
        drug_type: item.drug.type,
        quantity: item.quantity,
        unit_price: 0, // Will be set by admin
        total_price: 0
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
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getTypeDisplayName = (type: string) => {
    const typeNames = {
      'chemical': 'شیمیایی',
      'medical': 'تجهیزات پزشکی',
      'natural': 'طبیعی'
    };
    return typeNames[type as keyof typeof typeNames] || type;
  };

  const getTypeBadgeVariant = (type: string) => {
    const variants = {
      'chemical': 'default',
      'medical': 'secondary',
      'natural': 'outline'
    };
    return variants[type as keyof typeof variants] || 'default';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-7xl mx-auto backdrop-blur-sm bg-card/95 shadow-xl border-border/50">
        <CardHeader className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                فهرست داروها و تجهیزات پزشکی
              </CardTitle>
              <CardDescription className="text-base mt-2">
                جستجو و سفارش انواع داروها، تجهیزات پزشکی و فرآورده‌های طبیعی
              </CardDescription>
            </div>
            <Button
              onClick={() => setIsCartOpen(true)}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5" />
              سبد خرید ({getTotalCartItems()})
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="جستجو بر اساس نام دارو، کد IRC، یا شرکت سازنده..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 h-11 rounded-lg border-border/60 focus:border-primary/60 transition-colors"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-11 rounded-lg border-border/60 focus:border-primary/60">
                <Filter className="h-4 w-4 ml-2" />
                <SelectValue placeholder="نوع محصول" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه موارد</SelectItem>
                <SelectItem value="chemical">داروهای شیمیایی</SelectItem>
                <SelectItem value="medical">تجهیزات پزشکی</SelectItem>
                <SelectItem value="natural">فرآورده‌های طبیعی</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center justify-center bg-muted/30 rounded-lg px-3">
              <Package className="h-4 w-4 ml-2" />
              {totalCount.toLocaleString('fa-IR')} محصول
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {drugs.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || typeFilter !== "all" ? 'نتیجه‌ای یافت نشد' : 'هیچ دارویی در سیستم ثبت نشده است'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {drugs.map((drug) => (
                <Card key={drug.id} className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/30">
                  <CardContent className="p-5 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {drug.name}
                        </h3>
                        <Badge 
                          variant={getTypeBadgeVariant(drug.type) as any}
                          className="shrink-0 text-xs"
                        >
                          {getTypeDisplayName(drug.type)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Pill className="h-4 w-4 shrink-0" />
                          <span className="font-medium">کد IRC:</span>
                          <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-xs">
                            {drug.irc}
                          </span>
                        </div>
                        
                        {drug.company_name && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Package className="h-4 w-4 shrink-0" />
                            <span className="font-medium">شرکت:</span>
                            <span className="truncate">{drug.company_name}</span>
                          </div>
                        )}
                        
                        {drug.package_count && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-medium">تعداد در بسته:</span>
                            <span>{drug.package_count.toLocaleString('fa-IR')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60">
                      <DrugCartControls drug={drug} onAddToCart={addToCartWithQuantity} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
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
            صفحه {currentPage} از {totalPages} - مجموع {totalCount.toLocaleString('fa-IR')} نتیجه
          </div>
        </CardContent>
      </Card>

      {/* Cart Dialog */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              سبد خرید ({getTotalCartItems()} محصول)
            </DialogTitle>
            <DialogDescription>
              مرور و ارسال سفارش محصولات انتخابی
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">سبد خرید شما خالی است</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.drug.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">{item.drug.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.drug.irc} • {getTypeDisplayName(item.drug.type)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartItemQuantity(item.drug.id, item.quantity - 1)}
                        className="h-7 w-7 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartItemQuantity(item.drug.id, item.quantity + 1)}
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.drug.id)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="order-notes">یادداشت سفارش (اختیاری)</Label>
                  <Textarea
                    id="order-notes"
                    placeholder="توضیحات اضافی برای سفارش..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <DialogFooter>
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
                ارسال سفارش
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrugList;