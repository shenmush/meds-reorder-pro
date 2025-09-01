import React from 'react';
import { Pill, User, ShoppingCart, BarChart3, Building2, Users, UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string | null;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  activeTab, 
  onTabChange, 
  userRole 
}) => {
  const adminTabs = [
    { id: 'pharmacies', icon: User, label: 'داروخانه‌ها' },
    { id: 'orders', icon: ShoppingCart, label: 'سفارشات' },
    { id: 'reports', icon: BarChart3, label: 'گزارشات' },
    { id: 'upload', icon: Pill, label: 'افزودن' }
  ];

  const pharmacyManagerTabs = [
    { id: 'orders', icon: ShoppingCart, label: 'سفارشات' },
    { id: 'pharmacy', icon: Building2, label: 'داروخانه' },
    { id: 'drugs', icon: Pill, label: 'داروها' }
  ];

  const userTabs = [
    { id: 'drugs', icon: Pill, label: 'داروها' },
    { id: 'profile', icon: User, label: 'پروفایل' },
    { id: 'orders', icon: ShoppingCart, label: 'سفارشات' }
  ];

  const getTabs = () => {
    if (userRole === 'admin') return adminTabs;
    if (userRole === 'pharmacy_manager') return pharmacyManagerTabs;
    return userTabs;
  };

  const tabs = getTabs();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 mb-1 transition-all duration-200",
                  isActive ? "scale-110" : "scale-100"
                )} 
              />
              <span className="text-xs font-medium leading-none truncate">
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-primary rounded-full mt-1 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;