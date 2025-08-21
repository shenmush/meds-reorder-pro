import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';

interface AdminMobileFiltersProps {
  searchTerm: string;
  dateFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onDateFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

const AdminMobileFilters: React.FC<AdminMobileFiltersProps> = ({
  searchTerm,
  dateFilter,
  statusFilter,
  onSearchChange,
  onDateFilterChange,
  onStatusFilterChange,
  onClearFilters
}) => {
  const [open, setOpen] = useState(false);

  const hasActiveFilters = searchTerm !== '' || dateFilter !== 'all' || statusFilter !== 'all';

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
              {[searchTerm !== '', dateFilter !== 'all', statusFilter !== 'all'].filter(Boolean).length}
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader className="text-right pb-4 border-b border-border/60">
          <DialogTitle className="text-xl font-bold">فیلتر سفارشات</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="search-filter" className="text-right text-sm font-medium">
              جستجو در سفارشات
            </Label>
            <Input
              id="search-filter"
              placeholder="نام داروخانه یا یادداشت..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-filter" className="text-right text-sm font-medium">
              فیلتر زمانی
            </Label>
            <Select value={dateFilter} onValueChange={onDateFilterChange}>
              <SelectTrigger id="date-filter">
                <SelectValue placeholder="انتخاب بازه زمانی" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه</SelectItem>
                <SelectItem value="today">امروز</SelectItem>
                <SelectItem value="week">هفته گذشته</SelectItem>
                <SelectItem value="month">ماه گذشته</SelectItem>
                <SelectItem value="3months">سه ماه گذشته</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-filter" className="text-right text-sm font-medium">
              وضعیت سفارش
            </Label>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="انتخاب وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                <SelectItem value="pending">در انتظار</SelectItem>
                <SelectItem value="processing">در حال پردازش</SelectItem>
                <SelectItem value="completed">تکمیل شده</SelectItem>
                <SelectItem value="cancelled">لغو شده</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border/60">
            <Button
              variant="outline"
              onClick={() => {
                onClearFilters();
                setOpen(false);
              }}
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

export default AdminMobileFilters;