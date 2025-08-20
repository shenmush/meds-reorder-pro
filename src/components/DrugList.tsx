import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Pill, Plus, Minus, ShoppingCart, Search } from 'lucide-react';

interface Drug {
  id: string;
  name: string;
  generic_name?: string;
  dosage?: string;
  unit: string;
  category?: string;
  description?: string;
}

interface Pharmacy {
  id: string;
  name: string;
}

interface DrugListProps {
  pharmacy: Pharmacy;
}

interface CartItem {
  drug: Drug;
  quantity: number;
}

const DrugList: React.FC<DrugListProps> = ({ pharmacy }) => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrugs();
  }, []);

  const fetchDrugs = async () => {
    try {
      const { data, error } = await supabase
        .from('drugs')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDrugs(data || []);
    } catch (error: any) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری فهرست داروها",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredDrugs = drugs.filter(drug =>
    drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drug.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    drug.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (drug: Drug) => {
    setCart(prev => {
      const existing = prev.find(item => item.drug.id === drug.id);
      if (existing) {
        return prev.map(item =>
          item.drug.id === drug.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { drug, quantity: 1 }];
    });
  };

  const updateQuantity = (drugId: string, newQuantity: number) => {
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

  const getCartQuantity = (drugId: string) => {
    const item = cart.find(item => item.drug.id === drugId);
    return item ? item.quantity : 0;
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "سبد خرید خالی",
        description: "لطفاً حداقل یک دارو انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          pharmacy_id: pharmacy.id,
          total_items: getTotalItems(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        drug_id: item.drug.id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      setCart([]);
      
      toast({
        title: "سفارش ثبت شد",
        description: `سفارش شما با ${getTotalItems()} قلم دارو ثبت شد`,
      });
    } catch (error: any) {
      toast({
        title: "خطا",
        description: "خطا در ثبت سفارش",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Pill className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">در حال بارگذاری فهرست داروها...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Cart Summary */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="جستجو در داروها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 text-right"
          />
        </div>
        
        {cart.length > 0 && (
          <Card className="w-full sm:w-auto">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">سبد خرید</p>
                  <p className="font-bold">{getTotalItems()} قلم</p>
                </div>
                <Button 
                  onClick={submitOrder}
                  disabled={submitting}
                  className="gap-2"
                  style={{ background: 'var(--gradient-secondary)' }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  ثبت سفارش
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Drugs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrugs.map((drug) => {
          const quantity = getCartQuantity(drug.id);
          
          return (
            <Card key={drug.id} className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-[var(--transition-smooth)]">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="text-right flex-1">
                    <CardTitle className="text-lg">{drug.name}</CardTitle>
                    {drug.generic_name && (
                      <CardDescription className="text-sm text-muted-foreground">
                        {drug.generic_name}
                      </CardDescription>
                    )}
                  </div>
                  <Pill className="h-6 w-6 text-primary flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2 text-right">
                  {drug.dosage && (
                    <Badge variant="secondary" className="text-xs">
                      {drug.dosage}
                    </Badge>
                  )}
                  {drug.category && (
                    <Badge variant="outline" className="text-xs">
                      {drug.category}
                    </Badge>
                  )}
                </div>
                
                {drug.description && (
                  <p className="text-sm text-muted-foreground text-right line-clamp-2">
                    {drug.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-2">
                  {quantity > 0 ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(drug.id, quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="min-w-[2rem] text-center font-bold">
                        {quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(drug.id, quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => addToCart(drug)}
                      className="gap-2"
                    >
                      <Plus className="h-3 w-3" />
                      افزودن
                    </Button>
                  )}
                  
                  <span className="text-xs text-muted-foreground">
                    {drug.unit}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDrugs.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'داروی مورد نظر یافت نشد' : 'داروی در دسترس نیست'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DrugList;