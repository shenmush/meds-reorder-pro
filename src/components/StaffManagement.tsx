import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, UserPlus, Users, Eye, EyeOff, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface StaffAccount {
  id: string;
  staff_name: string;
  username: string;
  password_hash: string;
  role: 'pharmacy_staff' | 'pharmacy_accountant' | 'user' | 'admin' | 'pharmacy_manager' | 'barman_staff' | 'barman_manager' | 'barman_accountant';
  is_active: boolean;
  created_at: string;
}

interface StaffManagementProps {
  user: User;
  pharmacyId: string;
  pharmacyName: string;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ user, pharmacyId, pharmacyName }) => {
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  // Form state
  const [staffName, setStaffName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'pharmacy_staff' | 'pharmacy_accountant'>('pharmacy_staff');
  
  const { toast } = useToast();

  const fetchStaffList = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacy_staff_accounts')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaffList(data || []);
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      toast({
        title: "خطا",
        description: "خطا در بارگذاری لیست کارمندان",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffList();
  }, [pharmacyId]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Validate fields
      if (!staffName.trim() || !username.trim() || !password.trim()) {
        toast({
          title: "خطا",
          description: "لطفاً همه فیلدها را پر کنید",
          variant: "destructive",
        });
        return;
      }

      // Check current count
      const staffCount = staffList.filter(s => s.role === 'pharmacy_staff').length;
      const accountantCount = staffList.filter(s => s.role === 'pharmacy_accountant').length;

      if (role === 'pharmacy_staff' && staffCount >= 3) {
        toast({
          title: "محدودیت تعداد",
          description: "حداکثر 3 کارمند قابل ایجاد است",
          variant: "destructive",
        });
        return;
      }

      if (role === 'pharmacy_accountant' && accountantCount >= 3) {
        toast({
          title: "محدودیت تعداد", 
          description: "حداکثر 3 حسابدار قابل ایجاد است",
          variant: "destructive",
        });
        return;
      }

      // Create simple hash for password (in production, use proper bcrypt)
      const passwordHash = password; // For now, storing plain text (should be hashed)

      const { error } = await supabase
        .from('pharmacy_staff_accounts')
        .insert({
          pharmacy_id: pharmacyId,
          staff_name: staffName.trim(),
          username: username.trim(),
          password_hash: passwordHash,
          role: role,
          created_by: user.id
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
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
        description: `${role === 'pharmacy_staff' ? 'کارمند' : 'حسابدار'} جدید با موفقیت ایجاد شد`,
      });

      // Reset form
      setStaffName('');
      setUsername('');
      setPassword('');
      setRole('pharmacy_staff');
      setShowForm(false);
      
      // Refresh list
      fetchStaffList();
    } catch (error: any) {
      console.error('Error creating staff:', error);
      toast({
        title: "خطا",
        description: error.message || "خطا در ایجاد کارمند",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivateStaff = async (staffId: string, staffName: string) => {
    try {
      const { error } = await supabase
        .from('pharmacy_staff_accounts')
        .update({ is_active: false })
        .eq('id', staffId);

      if (error) throw error;

      toast({
        title: "موفق",
        description: `${staffName} غیرفعال شد`,
      });

      fetchStaffList();
    } catch (error: any) {
      toast({
        title: "خطا",
        description: "خطا در غیرفعال کردن کارمند",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = (staffId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [staffId]: !prev[staffId]
    }));
  };

  const getRoleLabel = (role: string) => {
    return role === 'pharmacy_staff' ? 'کارمند' : 'حسابدار';
  };

  const getRoleVariant = (role: string) => {
    return role === 'pharmacy_staff' ? 'default' : 'secondary';
  };

  const staffCount = staffList.filter(s => s.role === 'pharmacy_staff').length;
  const accountantCount = staffList.filter(s => s.role === 'pharmacy_accountant').length;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            مدیریت کارمندان - {pharmacyName}
          </CardTitle>
          <CardDescription>
            مدیریت کارمندان و حسابداران داروخانه
            <div className="flex gap-4 mt-2">
              <span>کارمندان: {staffCount}/3</span>
              <span>حسابداران: {accountantCount}/3</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Button
              onClick={() => setShowForm(!showForm)}
              disabled={staffCount >= 3 && accountantCount >= 3}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              افزودن کارمند جدید
            </Button>
          </div>

          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">ایجاد کارمند جدید</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateStaff} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="staffName">نام کارمند</Label>
                      <Input
                        id="staffName"
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        placeholder="مثال: علی احمدی"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">نقش</Label>
                      <Select value={role} onValueChange={(value: any) => setRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pharmacy_staff" disabled={staffCount >= 3}>
                            کارمند ({staffCount}/3)
                          </SelectItem>
                          <SelectItem value="pharmacy_accountant" disabled={accountantCount >= 3}>
                            حسابدار ({accountantCount}/3)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">نام کاربری</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="مثال: ali.ahmadi"
                        required
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">رمز عبور اولیه</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="رمز عبور"
                        required
                        minLength={4}
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={creating}>
                      {creating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          در حال ایجاد...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          ایجاد کارمند
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowForm(false)}
                    >
                      انصراف
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {staffList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              هنوز کارمندی اضافه نشده است
            </div>
          ) : (
            <div className="space-y-4">
              {staffList.map((staff) => (
                <Card key={staff.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">{staff.staff_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">
                            نام کاربری: {staff.username}
                          </span>
                          <Badge variant={getRoleVariant(staff.role)}>
                            {getRoleLabel(staff.role)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-muted-foreground">رمز عبور:</span>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {showPasswords[staff.id] ? staff.password_hash : '••••••••'}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePasswordVisibility(staff.id)}
                          >
                            {showPasswords[staff.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>غیرفعال کردن کارمند</AlertDialogTitle>
                          <AlertDialogDescription>
                            آیا از غیرفعال کردن {staff.staff_name} اطمینان دارید؟
                            این عمل امکان ورود کارمند را غیرفعال می‌کند.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>انصراف</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeactivateStaff(staff.id, staff.staff_name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            غیرفعال کردن
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffManagement;