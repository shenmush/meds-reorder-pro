import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Pill, ShoppingCart, Menu } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface MobileHeaderProps {
  user: User;
  pharmacy: { name: string } | null;
  userRole: string | null;
  onSignOut: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  user, 
  pharmacy, 
  userRole, 
  onSignOut 
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-card/90 backdrop-blur-lg supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10">
            <Pill className="h-6 w-6 text-primary" />
            <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-secondary rounded-full">
              <ShoppingCart className="h-2.5 w-2.5 text-white" />
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold text-foreground">
              {userRole === 'admin' ? 'پنل مدیریت' : 
               userRole === 'pharmacy_manager' ? 'مدیر داروخانه' :
               userRole === 'pharmacy_staff' ? 'کارمند داروخانه' :
               userRole === 'barman_staff' ? 'کارمند بارمان' :
               userRole === 'barman_manager' ? 'مدیر بارمان' :
               userRole === 'pharmacy_accountant' ? 'حسابدار داروخانه' :
               userRole === 'barman_accountant' ? 'حسابدار بارمان' :
               'MedOrder Pro'}
            </h1>
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
              {userRole === 'admin' ? user.email : 
               userRole === 'pharmacy_staff' ? user.email :
               pharmacy?.name || user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="gap-2 px-3 py-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-sm">خروج</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;