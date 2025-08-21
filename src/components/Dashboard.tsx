import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Pill, Plus, ShoppingCart, User as UserIcon } from 'lucide-react';
import DrugList from './DrugList';
import PharmacyProfile from './PharmacyProfile';
import AdminUpload from './AdminUpload';

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
  const [activeTab, setActiveTab] = useState<'drugs' | 'profile' | 'orders' | 'admin'>('drugs');
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPharmacyProfile();
    fetchUserRole();
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

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
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-[var(--shadow-soft)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Pill className="h-8 w-8 text-primary" />
                <ShoppingCart className="h-4 w-4 text-secondary absolute -bottom-1 -right-1" />
              </div>
              <div className="text-right">
                <h1 className="text-xl font-bold text-foreground">
                  {userRole === 'admin' ? 'پنل مدیریت' : 'سیستم مدیریت سفارشات'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {userRole === 'admin' ? `مدیر: ${user.email}` : pharmacy?.name || user.email}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {!pharmacy && userRole !== 'admin' ? (
          <PharmacyProfile 
            user={user} 
            pharmacy={pharmacy} 
            onPharmacyUpdate={setPharmacy} 
          />
        ) : (
          <>
            {/* Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={activeTab === 'drugs' ? 'default' : 'outline'}
                onClick={() => setActiveTab('drugs')}
                className="gap-2"
              >
                <Pill className="h-4 w-4" />
                فهرست داروها
              </Button>
              <Button
                variant={activeTab === 'profile' ? 'default' : 'outline'}
                onClick={() => setActiveTab('profile')}
                className="gap-2"
              >
                <UserIcon className="h-4 w-4" />
                مشخصات داروخانه
              </Button>
              <Button
                variant={activeTab === 'orders' ? 'default' : 'outline'}
                onClick={() => setActiveTab('orders')}
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                سفارشات من
              </Button>
              {userRole === 'admin' && (
                <Button
                  variant={activeTab === 'admin' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('admin')}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  مدیریت داروها
                </Button>
              )}
            </div>

            {/* Content */}
            {activeTab === 'drugs' && <DrugList pharmacy={pharmacy} />}
            {activeTab === 'profile' && (
              <PharmacyProfile 
                user={user} 
                pharmacy={pharmacy} 
                onPharmacyUpdate={setPharmacy} 
              />
            )}
            {activeTab === 'orders' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-right">سفارشات شما</CardTitle>
                  <CardDescription className="text-right">
                    فهرست سفارشات ثبت شده
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    قابلیت مشاهده سفارشات به زودی اضافه خواهد شد
                  </p>
                </CardContent>
              </Card>
            )}
            {activeTab === 'admin' && userRole === 'admin' && <AdminUpload />}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;