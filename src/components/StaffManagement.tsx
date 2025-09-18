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
import { Loader2, Plus, UserPlus, Users, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface StaffMember {
  id: string;
  user_id: string;
  display_name: string;
  role: 'pharmacy_staff' | 'pharmacy_accountant';
  email: string;
  created_at: string;
}

interface StaffManagementProps {
  user: User;
  pharmacyId: string;
  pharmacyName: string;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ user, pharmacyId, pharmacyName }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [staffName, setStaffName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'pharmacy_staff' | 'pharmacy_accountant'>('pharmacy_staff');
  
  const { toast } = useToast();

  const fetchStaffList = async () => {
    try {
      // Get user roles for this pharmacy
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          created_at,
          profiles!inner(
            display_name,
            user_id
          )
        `)
        .eq('pharmacy_id', pharmacyId)
        .in('role', ['pharmacy_staff', 'pharmacy_accountant'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to our interface
      const transformedStaff = (userRoles || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        display_name: item.profiles?.display_name || 'نام نمایشی تنظیم نشده',
        role: item.role as 'pharmacy_staff' | 'pharmacy_accountant',
        email: 'کارمند داروخانه', // Hide email for privacy
        created_at: item.created_at
      }));

      setStaffList(transformedStaff);
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
      if (!staffName.trim() || !email.trim() || !password.trim()) {
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

      // Get the session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('ورود مجدد مورد نیاز است');
      }

      // Call Edge Function to create user
      const { data, error } = await supabase.functions.invoke('create-staff-user', {
        body: {
          email: email.trim(),
          password: password,
          displayName: staffName.trim(),
          role: role
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || 'خطا در ایجاد کاربر');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "موفق",
        description: `${role === 'pharmacy_staff' ? 'کارمند' : 'حسابدار'} جدید با موفقیت ایجاد شد`,
      });

      // Reset form
      setStaffName('');
      setEmail('');
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

  const handleRemoveStaff = async (staffId: string, staffName: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', staffId);

      if (error) throw error;

      toast({
        title: "موفق",
        description: `${staffName} از داروخانه حذف شد`,
      });

      fetchStaffList();
    } catch (error: any) {
      toast({
        title: "خطا",
        description: "خطا در حذف کارمند",
        variant: "destructive",
      });
    }
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
                        className="text-right"
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
                      <Label htmlFor="email">ایمیل</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="مثال: ali@example.com"
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
                        placeholder="رمز عبور (حداقل 6 کاراکتر)"
                        required
                        minLength={6}
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
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 text-right">
                          <h3 className="font-medium">{staff.display_name}</h3>
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <Badge variant={getRoleVariant(staff.role)}>
                              {getRoleLabel(staff.role)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {staff.email}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 text-right">
                            تاریخ ایجاد: {new Date(staff.created_at).toLocaleDateString('fa-IR')}
                          </div>
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
                          <AlertDialogTitle>حذف کارمند</AlertDialogTitle>
                          <AlertDialogDescription>
                            آیا از حذف {staff.display_name} از داروخانه اطمینان دارید؟
                            این عمل غیرقابل بازگشت است.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>انصراف</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveStaff(staff.id, staff.display_name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            حذف کارمند
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