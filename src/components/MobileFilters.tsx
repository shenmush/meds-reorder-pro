import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';

interface MobileFiltersProps {
  columnFilters: Record<string, string>;
  onUpdateFilter: (column: string, value: string) => void;
  onClearFilters: () => void;
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  columnFilters,
  onUpdateFilter,
  onClearFilters
}) => {
  const [open, setOpen] = useState(false);

  const hasActiveFilters = Object.values(columnFilters).some(filter => filter !== '');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`gap-2 rounded-xl transition-all duration-300 ${
            hasActiveFilters 
              ? 'border-primary bg-primary/5 text-primary' 
              : 'border-border/60 hover:border-primary/30'
          }`}
        >
          <Filter className="h-4 w-4" />
          فیلترها
          {hasActiveFilters && (
            <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {Object.values(columnFilters).filter(filter => filter !== '').length}
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader className="text-right pb-4 border-b border-border/60">
          <DialogTitle className="text-xl font-bold">فیلتر محصولات</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name-filter" className="text-right text-sm font-medium">
              نام محصول
            </Label>
            <Input
              id="name-filter"
              placeholder="جستجو در نام محصول..."
              value={columnFilters.name}
              onChange={(e) => onUpdateFilter('name', e.target.value)}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-filter" className="text-right text-sm font-medium">
              شرکت تولیدکننده
            </Label>
            <Input
              id="company-filter"
              placeholder="جستجو در شرکت..."
              value={columnFilters.company}
              onChange={(e) => onUpdateFilter('company', e.target.value)}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type-filter" className="text-right text-sm font-medium">
              نوع محصول
            </Label>
            <Input
              id="type-filter"
              placeholder="جستجو در نوع..."
              value={columnFilters.type}
              onChange={(e) => onUpdateFilter('type', e.target.value)}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="irc-filter" className="text-right text-sm font-medium">
              کد IRC
            </Label>
            <Input
              id="irc-filter"
              placeholder="جستجو در کد IRC..."
              value={columnFilters.irc}
              onChange={(e) => onUpdateFilter('irc', e.target.value)}
              className="text-right font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="erx-filter" className="text-right text-sm font-medium">
              کد ERX
            </Label>
            <Input
              id="erx-filter"
              placeholder="جستجو در کد ERX..."
              value={columnFilters.erxCode}
              onChange={(e) => onUpdateFilter('erxCode', e.target.value)}
              className="text-right font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gtin-filter" className="text-right text-sm font-medium">
              کد GTIN
            </Label>
            <Input
              id="gtin-filter"
              placeholder="جستجو در کد GTIN..."
              value={columnFilters.gtin}
              onChange={(e) => onUpdateFilter('gtin', e.target.value)}
              className="text-right font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="package-filter" className="text-right text-sm font-medium">
              تعداد بسته
            </Label>
            <Input
              id="package-filter"
              placeholder="جستجو در تعداد بسته..."
              value={columnFilters.packageCount}
              onChange={(e) => onUpdateFilter('packageCount', e.target.value)}
              className="text-right"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border/60">
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="flex-1 gap-2 rounded-xl"
              disabled={!hasActiveFilters}
            >
              <X className="h-4 w-4" />
              پاک کردن همه
            </Button>
            <Button
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl"
            >
              اعمال فیلترها
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileFilters;