import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, Building2 } from 'lucide-react';

interface StaffLoginData {
  staff_id: string;
  pharmacy_id: string;
  staff_name: string;
  username: string;
  role: string;
  pharmacy_name: string;
}

interface StaffAuthPageProps {
  onStaffLogin: (staffData: StaffLoginData) => void;
  onSwitchToManager: () => void;
}

const StaffAuthPage: React.FC<StaffAuthPageProps> = ({ onStaffLogin, onSwitchToManager }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!username.trim() || !password.trim()) {
        toast({
          title: "خطا",
          description: "لطفاً نام کاربری و رمز عبور را وارد کنید",
          variant: "destructive",
        });
        return;
      }

      // Call the authenticate_staff function
      const { data, error } = await supabase.rpc('authenticate_staff', {
        username_input: username.trim(),
        password_input: password
      });

      if (error) {
        console.error('Authentication error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        toast({
          title: "خطا",
          description: "نام کاربری یا رمز عبور اشتباه است",
          variant: "destructive",
        });
        return;
      }

      const staffData = data[0];

      toast({
        title: "ورود موفق",
        description: `خوش آمدید ${staffData.staff_name}`,
      });

      onStaffLogin(staffData);
    } catch (error: any) {
      console.error('Staff login error:', error);
      toast({
        title: "خطا",
        description: error.message || "خطا در ورود به سیستم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-hero)' }}>
      <Card className="w-full max-w-md shadow-[var(--shadow-strong)]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Users className="h-12 w-12 text-primary" />
              <Building2 className="h-6 w-6 text-secondary absolute -bottom-1 -right-1" />
            </div>
          </div>
          <CardTitle className="text-2xl text-right">
            ورود کارمندان
          </CardTitle>
          <CardDescription className="text-right">
            با نام کاربری و رمز عبور اختصاصی خود وارد شوید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-right block">نام کاربری</Label>
              <Input
                id="username"
                type="text"
                placeholder="نام کاربری"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                dir="ltr"
              />
            </div>

            <Button
              type="submit"
              className="w-full text-lg"
              disabled={loading}
              style={{ background: 'var(--gradient-primary)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  در حال ورود...
                </>
              ) : (
                'ورود'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={onSwitchToManager}
              className="text-sm text-muted-foreground"
            >
              مدیر داروخانه هستید؟ اینجا کلیک کنید
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffAuthPage;