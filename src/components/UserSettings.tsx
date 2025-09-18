import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Loader2, Settings, User, Key } from 'lucide-react';

interface StaffInfo {
  id: string;
  staff_name: string;
  username: string;
  role: string;
  pharmacy_name: string;
}

interface UserSettingsProps {
  staffInfo: StaffInfo;
  onUpdate: () => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ staffInfo, onUpdate }) => {
  const [username, setUsername] = useState(staffInfo.username);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  
  const { toast } = useToast();

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({
        title: "خطا",
        description: "نام کاربری نمی‌تواند خالی باشد",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('pharmacy_staff_accounts')
        .update({ username: username.trim() })
        .eq('id', staffInfo.id);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "خطا",
            description: "این نام کاربری قبلاً استفاده شده است",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "موفق",
        description: "نام کاربری با موفقیت تغییر کرد",
      });
      
      onUpdate();
    } catch (error: any) {
      toast({
        title: "خطا",
        description: "خطا در تغییر نام کاربری",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "خطا",
        description: "لطفاً همه فیلدها را پر کنید",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "خطا",
        description: "رمز عبور جدید و تکرار آن مطابقت ندارند",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 4) {
      toast({
        title: "خطا",
        description: "رمز عبور باید حداقل 4 کاراکتر باشد",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      // First verify current password
      const { data: currentData } = await supabase
        .from('pharmacy_staff_accounts')
        .select('password_hash')
        .eq('id', staffInfo.id)
        .single();

      if (!currentData || currentData.password_hash !== currentPassword) {
        toast({
          title: "خطا",
          description: "رمز عبور فعلی صحیح نیست",
          variant: "destructive",
        });
        return;
      }

      // Update password
      const { error } = await supabase
        .from('pharmacy_staff_accounts')
        .update({ password_hash: newPassword })
        .eq('id', staffInfo.id);

      if (error) throw error;

      toast({
        title: "موفق",
        description: "رمز عبور با موفقیت تغییر کرد",
      });
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      onUpdate();
    } catch (error: any) {
      toast({
        title: "خطا",
        description: "خطا در تغییر رمز عبور",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'pharmacy_staff':
        return 'کارمند';
      case 'pharmacy_accountant':
        return 'حسابدار';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            تنظیمات کاربری
          </CardTitle>
          <CardDescription>
            تغییر اطلاعات حساب کاربری شما
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <Card className="p-4 bg-muted/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium">اطلاعات شخصی</span>
              </div>
              <div className="space-y-1">
                <p><strong>نام:</strong> {staffInfo.staff_name}</p>
                <p><strong>داروخانه:</strong> {staffInfo.pharmacy_name}</p>
                <div className="flex items-center gap-2">
                  <strong>نقش:</strong>
                  <Badge variant="outline">{getRoleLabel(staffInfo.role)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  * نام و نقش شما توسط مدیر داروخانه تعیین شده و قابل تغییر نیست
                </p>
              </div>
            </div>
          </Card>

          {/* Username Change */}
          <Card className="p-4">
            <form onSubmit={handleUpdateUsername} className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4" />
                <span className="font-medium">تغییر نام کاربری</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">نام کاربری جدید</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری"
                  required
                  dir="ltr"
                />
              </div>
              <Button type="submit" disabled={updating || username === staffInfo.username}>
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    در حال بروزرسانی...
                  </>
                ) : (
                  'تغییر نام کاربری'
                )}
              </Button>
            </form>
          </Card>

          {/* Password Change */}
          <Card className="p-4">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Key className="h-4 w-4" />
                <span className="font-medium">تغییر رمز عبور</span>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">رمز عبور فعلی</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="رمز عبور فعلی"
                    required
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">رمز عبور جدید</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="رمز عبور جدید"
                    required
                    minLength={4}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تکرار رمز عبور جدید</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="تکرار رمز عبور جدید"
                    required
                    minLength={4}
                    dir="ltr"
                  />
                </div>
              </div>
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    در حال بروزرسانی...
                  </>
                ) : (
                  'تغییر رمز عبور'
                )}
              </Button>
            </form>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;