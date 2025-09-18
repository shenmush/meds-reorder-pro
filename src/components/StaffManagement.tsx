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
import { Loader2, Plus, UserPlus, Users, Trash2, RotateCcw } from 'lucide-react';
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

interface CreatedStaffResponse {
  username: string;
  password: string;
  display_name: string;
  role: string;
}

const StaffManagement: React.FC<StaffManagementProps> = ({ user, pharmacyId, pharmacyName }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pharmacyEnglishName, setPharmacyEnglishName] = useState('');
  const [createdStaff, setCreatedStaff] = useState<CreatedStaffResponse | null>(null);
  const [resetPasswordLoading, setResetPasswordLoading] = useState<string | null>(null);
  const [resetPasswordResult, setResetPasswordResult] = useState<{username: string, password: string, display_name: string} | null>(null);
  
  // Form state
  const [staffName, setStaffName] = useState('');
  const [role, setRole] = useState<'pharmacy_staff' | 'pharmacy_accountant'>('pharmacy_staff');
  
  const { toast } = useToast();

  const fetchStaffList = async () => {
    try {
      // Get pharmacy english name
      const { data: pharmacy, error: pharmacyError } = await supabase
        .from('pharmacies')
        .select('english_name')
        .eq('id', pharmacyId)
        .single();

      if (pharmacyError) throw pharmacyError;
      setPharmacyEnglishName(pharmacy.english_name || 'pharmacy');

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
      if (!staffName.trim()) {
        toast({
          title: "خطا",
          description: "لطفاً نام کارمند را وارد کنید",
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

      console.log('Starting staff creation...');

      // Get the session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('خطا در دریافت session');
      }
      
      if (!session?.access_token) {
        console.error('No access token found');
        throw new Error('ورود مجدد مورد نیاز است');
      }

      console.log('Calling Edge Function with token...');

      // Calculate next number for username
      const currentRoleCount = role === 'pharmacy_staff' ? staffCount : accountantCount;
      const prefix = role === 'pharmacy_staff' ? 's' : 'a';
      const nextNumber = currentRoleCount + 1;

      // Call Edge Function to create user
      try {
        const { data, error } = await supabase.functions.invoke('create-staff-user', {
          body: {
            displayName: staffName.trim(),
            role: role,
            pharmacyEnglishName: pharmacyEnglishName,
            rolePrefix: prefix,
            roleNumber: nextNumber
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        console.log('Edge Function response:', { data, error });

        if (error) {
          console.error('Edge Function error:', error);
          throw new Error(error.message || 'خطا در ایجاد کاربر');
        }

        if (data?.error) {
          console.error('Edge Function data error:', data.error);
          throw new Error(data.error);
        }

        console.log('Staff created successfully:', data);

        // Set created staff info to show to manager
        setCreatedStaff(data.user);

        toast({
          title: "موفق",
          description: `${role === 'pharmacy_staff' ? 'کارمند' : 'حسابدار'} جدید با موفقیت ایجاد شد`,
        });

        // Reset form
        setStaffName('');
        setRole('pharmacy_staff');
        setShowForm(false);
        
        // Refresh list
        fetchStaffList();
      } catch (funcError: any) {
        console.error('Function call error:', funcError);
        throw new Error(funcError.message || 'خطا در ایجاد کاربر');
      }
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

  const handleResetPassword = async (staffId: string, staffName: string, staffUserId: string) => {
    setResetPasswordLoading(staffId);
    
    try {
      // Get the session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('خطا در دریافت session');
      }
      
      if (!session?.access_token) {
        throw new Error('ورود مجدد مورد نیاز است');
      }

      // Call Edge Function to reset password
      const { data, error } = await supabase.functions.invoke('reset-staff-password', {
        body: {
          userId: staffUserId,
          pharmacyEnglishName: pharmacyEnglishName
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || 'خطا در ریست پسورد');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Set reset password result to show to manager
      setResetPasswordResult({
        username: data.username,
        password: data.password,
        display_name: staffName
      });

      toast({
        title: "موفق",
        description: `رمز عبور ${staffName} با موفقیت ریست شد`,
      });

    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: "خطا",
        description: error.message || "خطا در ریست پسورد",
        variant: "destructive",
      });
    } finally {
      setResetPasswordLoading(null);
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
                <CardDescription>
                  نام کاربری و رمز عبور به صورت خودکار ساخته می‌شود
                </CardDescription>
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

          {/* Show created staff credentials */}
          {createdStaff && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">اطلاعات ورود کارمند جدید</CardTitle>
                <CardDescription className="text-green-700">
                  لطفاً این اطلاعات را به کارمند ارائه دهید
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-green-800">نام کاربری:</Label>
                    <div className="p-2 bg-white rounded border font-mono text-left" dir="ltr">
                      {createdStaff.username}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-green-800">رمز عبور:</Label>
                    <div className="p-2 bg-white rounded border font-mono text-left" dir="ltr">
                      {createdStaff.password}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCreatedStaff(null)}
                  >
                    بستن
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Show reset password result */}
          {resetPasswordResult && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-800">رمز عبور جدید برای {resetPasswordResult.display_name}</CardTitle>
                <CardDescription className="text-blue-700">
                  لطفاً این اطلاعات را به کارمند ارائه دهید
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-blue-800">نام کاربری:</Label>
                    <div className="p-2 bg-white rounded border font-mono text-left" dir="ltr">
                      {resetPasswordResult.username}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-blue-800">رمز عبور جدید:</Label>
                    <div className="p-2 bg-white rounded border font-mono text-left" dir="ltr">
                      {resetPasswordResult.password}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setResetPasswordResult(null)}
                  >
                    بستن
                  </Button>
                </div>
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetPassword(staff.id, staff.display_name, staff.user_id)}
                        disabled={resetPasswordLoading === staff.id}
                      >
                        {resetPasswordLoading === staff.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />                          
                        )}
                      </Button>
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