import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pill, ShoppingCart } from 'lucide-react';

interface AuthPageProps {
  user: User | null;
  onAuthChange: (user: User | null) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ user, onAuthChange }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>('pharmacy_manager');
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>('');
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(false);
  const { toast } = useToast();

  // Fetch pharmacies when role changes to pharmacy-related role
  useEffect(() => {
    if (!isLogin && (role === 'pharmacy_staff' || role === 'pharmacy_accountant')) {
      fetchPharmacies();
    }
  }, [isLogin, role]);

  const fetchPharmacies = async () => {
    setLoadingPharmacies(true);
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setPharmacies(data || []);
    } catch (error: any) {
      toast({
        title: "خطا",
        description: "خطا در بارگیری لیست داروخانه‌ها",
        variant: "destructive",
      });
    } finally {
      setLoadingPharmacies(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          onAuthChange(data.user);
          toast({
            title: "ورود موفق",
            description: "به سیستم مدیریت داروخانه خوش آمدید",
          });
        }
      } else {
        // Validate pharmacy selection for staff roles
        if ((role === 'pharmacy_staff' || role === 'pharmacy_accountant') && !selectedPharmacy) {
          toast({
            title: "خطا",
            description: "لطفاً داروخانه مورد نظر را انتخاب کنید",
            variant: "destructive",
          });
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) throw error;
        
        if (data.user) {
          // Insert user role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: role as any,
              pharmacy_id: (role === 'pharmacy_staff' || role === 'pharmacy_accountant') ? selectedPharmacy : null
            });

          if (roleError) {
            console.error('Error inserting user role:', roleError);
          }

          toast({
            title: "ثبت نام موفق",
            description: "حساب کاربری شما ایجاد شد. لطفاً ایمیل خود را بررسی کنید.",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطایی رخ داده است",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return null; // This component shouldn't render when user is logged in
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
      <Card className="w-full max-w-md shadow-[var(--shadow-strong)]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Pill className="h-12 w-12 text-primary" />
              <ShoppingCart className="h-6 w-6 text-secondary absolute -bottom-1 -right-1" />
            </div>
          </div>
          <CardTitle className="text-2xl text-right">
            {isLogin ? 'ورود به سیستم' : 'ثبت نام'}
          </CardTitle>
          <CardDescription className="text-right">
            {isLogin 
              ? 'به سیستم مدیریت سفارشات داروخانه وارد شوید'
              : 'حساب کاربری جدید ایجاد کنید'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-right block">ایمیل</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@pharmacy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-right"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-right block">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                placeholder="رمز عبور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-right"
                minLength={6}
              />
            </div>
            
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label className="text-right block">نقش کاربری</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="w-full text-right">
                      <SelectValue placeholder="نقش مورد نظر را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pharmacy_manager">مدیر داروخانه</SelectItem>
                      <SelectItem value="pharmacy_staff">کارمند داروخانه</SelectItem>
                      <SelectItem value="pharmacy_accountant">حسابدار داروخانه</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(role === 'pharmacy_staff' || role === 'pharmacy_accountant') && (
                  <div className="space-y-2">
                    <Label className="text-right block">انتخاب داروخانه</Label>
                    <Select value={selectedPharmacy} onValueChange={setSelectedPharmacy}>
                      <SelectTrigger className="w-full text-right">
                        <SelectValue placeholder="داروخانه مورد نظر را انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingPharmacies ? (
                          <SelectItem value="loading" disabled>
                            در حال بارگیری...
                          </SelectItem>
                        ) : pharmacies.length > 0 ? (
                          pharmacies.map((pharmacy) => (
                            <SelectItem key={pharmacy.id} value={pharmacy.id}>
                              {pharmacy.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-pharmacies" disabled>
                            داروخانه‌ای یافت نشد
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
            <Button
              type="submit"
              className="w-full text-lg"
              disabled={loading}
              style={{ background: 'var(--gradient-primary)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  در حال پردازش...
                </>
              ) : (
                isLogin ? 'ورود' : 'ثبت نام'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground"
            >
              {isLogin 
                ? 'حساب کاربری ندارید؟ ثبت نام کنید'
                : 'حساب کاربری دارید؟ وارد شوید'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;