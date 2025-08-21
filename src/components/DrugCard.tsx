import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, ShoppingCart, Building2, Hash, Package } from 'lucide-react';

interface UnifiedDrug {
  id: string;
  name: string;
  company: string;
  packageCount?: number;
  action?: string;
  irc: string;
  type: 'chemical' | 'medical' | 'natural';
  erxCode?: string;
  gtin?: string;
  genericCode?: string;
  atcCode?: string;
}

interface DrugCardProps {
  drug: UnifiedDrug;
  quantity: number;
  tempQuantity: number;
  onUpdateTempQuantity: (quantity: number) => void;
  onAddToCart: () => void;
  getTypeLabel: (type: string) => string;
}

const DrugCard: React.FC<DrugCardProps> = ({
  drug,
  quantity,
  tempQuantity,
  onUpdateTempQuantity,
  onAddToCart,
  getTypeLabel
}) => {
  return (
    <Card className="hover:shadow-elegant transition-all duration-300 border-border/60 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4 space-y-4">
        {/* Header with name and type */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Badge 
              variant="secondary" 
              className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary border-primary/20"
            >
              {getTypeLabel(drug.type)}
            </Badge>
            {quantity > 0 && (
              <Badge 
                variant="default" 
                className="text-xs px-2 py-1 rounded-lg bg-green-500/10 text-green-700 border-green-500/20"
              >
                در سبد: {quantity}
              </Badge>
            )}
          </div>
          
          <h3 className="text-right font-bold text-lg leading-tight text-foreground">
            {drug.name}
          </h3>
          
          {drug.genericCode && (
            <div className="text-sm text-muted-foreground bg-muted/30 px-2 py-1 rounded-lg">
              کد ژنریک: {drug.genericCode}
            </div>
          )}
        </div>

        {/* Company info */}
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground truncate">{drug.company}</span>
        </div>

        {/* Codes and info grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-muted/20 p-2 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">IRC</span>
            </div>
            <div className="font-mono text-xs">{drug.irc}</div>
          </div>

          {drug.erxCode && (
            <div className="bg-muted/20 p-2 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">ERX</span>
              </div>
              <div className="font-mono text-xs">{drug.erxCode}</div>
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

          {drug.packageCount && (
            <div className="bg-muted/20 p-2 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <Package className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">تعداد بسته</span>
              </div>
              <div className="text-xs font-medium">{drug.packageCount}</div>
            </div>
          )}

          {drug.atcCode && (
            <div className="bg-muted/20 p-2 rounded-lg">
              <div className="flex items-center gap-1 mb-1">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">ATC</span>
              </div>
              <div className="font-mono text-xs">{drug.atcCode}</div>
            </div>
          )}
        </div>

        {/* Add to cart section */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateTempQuantity(tempQuantity - 1)}
              className="h-8 w-8 p-0 rounded-lg border-border/60 hover:border-primary/30"
              disabled={tempQuantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <Input
              type="number"
              min="1"
              value={tempQuantity}
              onChange={(e) => onUpdateTempQuantity(parseInt(e.target.value) || 1)}
              className="w-16 text-center h-8 rounded-lg border-border/60 focus:border-primary/50"
            />
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateTempQuantity(tempQuantity + 1)}
              className="h-8 w-8 p-0 rounded-lg border-border/60 hover:border-primary/30"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={onAddToCart}
            className="gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-hover hover:shadow-medium transition-all duration-300"
          >
            <ShoppingCart className="h-3 w-3" />
            افزودن
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DrugCard;