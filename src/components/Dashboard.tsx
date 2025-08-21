import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Pill, Plus, ShoppingCart, User as UserIcon } from 'lucide-react';
import DrugList from './DrugList';
import PharmacyProfile from './PharmacyProfile';
import AdminAddDrug from './AdminAddDrug';
import AdminPharmacies from './AdminPharmacies';
import AdminOrders from './AdminOrders';
import AdminReports from './AdminReports';
import OrderHistory from './OrderHistory';

interface DashboardProps {
  user: User;
  onAuthChange: (user: User | null) => void;
}

interface Pharmacy {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  license_number?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onAuthChange }) => {
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'drugs' | 'profile' | 'orders' | 'pharmacies' | 'reports' | 'upload'>('drugs');
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPharmacyProfile();
    fetchUserRole();
  }, [user]);

  useEffect(() => {
    // Set default tab based on user role
    if (userRole === 'admin') {
      setActiveTab('pharmacies');
    } else {
      setActiveTab('drugs');
    }
  }, [userRole]);

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user'); // Default to user role
      } else {
        setUserRole(data?.role || 'user');
      }
    } catch (error) {
      console.error('Error:', error);
      setUserRole('user');
    }
  };

  const fetchPharmacyProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching pharmacy profile:', error);
      }
      
      setPharmacy(data);
    } catch (error: any) {
      console.error('Error fetching pharmacy profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onAuthChange(null);
      toast({
        title: "خروج موفق",
        description: "با موفقیت از سیستم خارج شدید",
      });
    } catch (error: any) {
      toast({
        title: "خطا",
        description: "خطا در خروج از سیستم",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Pill className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Modern Header */}
      <header className="border-b border-border/60 bg-card/90 backdrop-blur-lg shadow-soft">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
                <Pill className="h-7 w-7 text-primary" />
                <div className="absolute -bottom-1 -right-1 p-1 bg-secondary rounded-full">
                  <ShoppingCart className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gradient">
                  {userRole === 'admin' ? 'پنل مدیریت' : 'سیستم مدیریت سفارشات'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {userRole === 'admin' ? `مدیر: ${user.email}` : pharmacy?.name || user.email}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut} 
              className="gap-2 px-6 py-2.5 rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {!pharmacy && userRole !== 'admin' ? (
          <PharmacyProfile 
            user={user} 
            pharmacy={pharmacy} 
            onPharmacyUpdate={setPharmacy} 
          />
        ) : (
          <>
            {/* Modern Navigation */}
            <div className="mb-8">
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-2 border border-border/60 shadow-soft">
                <div className="flex flex-wrap gap-1">
                  {userRole === 'admin' ? (
                    // Admin Navigation
                    <>
                      <Button
                        variant={activeTab === 'pharmacies' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('pharmacies')}
                        className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                          activeTab === 'pharmacies' 
                            ? 'btn-primary shadow-medium' 
                            : 'hover:bg-muted/60'
                        }`}
                      >
                        <UserIcon className="h-5 w-5" />
                        <span className="font-medium">داروخانه‌ها</span>
                      </Button>
                      <Button
                        variant={activeTab === 'orders' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('orders')}
                        className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                          activeTab === 'orders' 
                            ? 'btn-primary shadow-medium' 
                            : 'hover:bg-muted/60'
                        }`}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        <span className="font-medium">سفارشات</span>
                      </Button>
                      <Button
                        variant={activeTab === 'reports' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('reports')}
                        className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                          activeTab === 'reports' 
                            ? 'btn-primary shadow-medium' 
                            : 'hover:bg-muted/60'
                        }`}
                      >
                        <Plus className="h-5 w-5" />
                        <span className="font-medium">گزارشات</span>
                      </Button>
                      <Button
                        variant={activeTab === 'upload' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('upload')}
                        className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                          activeTab === 'upload' 
                            ? 'btn-primary shadow-medium' 
                            : 'hover:bg-muted/60'
                        }`}
                      >
                        <Pill className="h-5 w-5" />
                        <span className="font-medium">مدیریت داروها</span>
                      </Button>
                    </>
                  ) : (
                    // Regular User Navigation
                    <>
                      <Button
                        variant={activeTab === 'drugs' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('drugs')}
                        className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                          activeTab === 'drugs' 
                            ? 'btn-primary shadow-medium' 
                            : 'hover:bg-muted/60'
                        }`}
                      >
                        <Pill className="h-5 w-5" />
                        <span className="font-medium">فهرست داروها</span>
                      </Button>
                      <Button
                        variant={activeTab === 'profile' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('profile')}
                        className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                          activeTab === 'profile' 
                            ? 'btn-primary shadow-medium' 
                            : 'hover:bg-muted/60'
                        }`}
                      >
                        <UserIcon className="h-5 w-5" />
                        <span className="font-medium">مشخصات داروخانه</span>
                      </Button>
                      <Button
                        variant={activeTab === 'orders' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('orders')}
                        className={`gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                          activeTab === 'orders' 
                            ? 'btn-primary shadow-medium' 
                            : 'hover:bg-muted/60'
                        }`}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        <span className="font-medium">سفارشات من</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Content Area */}
            <div className="animate-in fade-in-50 duration-500">
              {userRole === 'admin' ? (
                // Admin Content
                <>
                  {activeTab === 'pharmacies' && <AdminPharmacies />}
                  {activeTab === 'orders' && <AdminOrders />}
                  {activeTab === 'reports' && <AdminReports />}
                  {activeTab === 'upload' && <AdminAddDrug />}
                </>
              ) : (
                // Regular User Content
                <>
                  {activeTab === 'drugs' && <DrugList pharmacy={pharmacy} />}
                  {activeTab === 'profile' && (
                    <PharmacyProfile 
                      user={user} 
                      pharmacy={pharmacy} 
                      onPharmacyUpdate={setPharmacy} 
                    />
                  )}
                  {activeTab === 'orders' && pharmacy && (
                    <OrderHistory pharmacyId={pharmacy.id} />
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;