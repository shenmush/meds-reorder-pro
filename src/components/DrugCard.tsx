import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ShoppingCart, Building2, Hash, Package } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
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

interface DrugCardProps {
  drug: Drug;
}

const DrugCard: React.FC<DrugCardProps> = ({ drug }) => {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getDrugTypeBadge = (type: string) => {
    const typeMap = {
      'chemical': { label: 'دارو', variant: 'default' as const },
      'medical': { label: 'تجهیزات پزشکی', variant: 'secondary' as const },
      'natural': { label: 'محصولات طبیعی', variant: 'outline' as const }
    };
    
    const config = typeMap[type as keyof typeof typeMap] || { label: type, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleAddToOrder = async () => {
    try {
      setIsSubmitting(true);

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
          total_items: quantity,
          status: 'pending',
          workflow_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Add order item
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          drug_id: drug.id,
          quantity: quantity
        });

      if (itemError) throw itemError;

      toast.success(`سفارش ${drug.name} با تعداد ${quantity} ثبت شد`);
      setQuantity(1);

    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('خطا در ثبت سفارش');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="hover:shadow-elegant transition-all duration-300 border-border/60 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4 space-y-4">
        {/* Header with name and type */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            {getDrugTypeBadge(drug.type)}
          </div>
          
          <h3 className="text-right font-bold text-lg leading-tight text-foreground">
            {drug.name}
          </h3>
        </div>

        {/* Company info */}
        {drug.company_name && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate">{drug.company_name}</span>
          </div>
        )}

        {/* Codes and info grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-muted/20 p-2 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">IRC</span>
            </div>
            <div className="font-mono text-xs">{drug.irc}</div>
          </div>

          {drug.erx_code && (
            <div className="bg-muted/20 p-2 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">ERX</span>
              </div>
              <div className="font-mono text-xs">{drug.erx_code}</div>
            </div>
          )}

          {drug.gtin && (
            <div className="bg-muted/20 p-2 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">GTIN</span>
              </div>
              <div className="font-mono text-xs">{drug.gtin}</div>
            </div>
          )}

          {drug.package_count && (
            <div className="bg-muted/20 p-2 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <Package className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">تعداد بسته</span>
              </div>
              <div className="text-xs font-medium">{drug.package_count}</div>
            </div>
          )}
        </div>

        {/* Add to order section */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8 p-0 rounded-lg border-border/60 hover:border-primary/30"
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-16 text-center h-8 rounded-lg border-border/60 focus:border-primary/50"
            />
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuantity(quantity + 1)}
              className="h-8 w-8 p-0 rounded-lg border-border/60 hover:border-primary/30"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={handleAddToOrder}
            disabled={isSubmitting}
            className="gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-hover hover:shadow-medium transition-all duration-300"
          >
            <ShoppingCart className="h-3 w-3" />
            {isSubmitting ? 'در حال ثبت...' : 'سفارش'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DrugCard;