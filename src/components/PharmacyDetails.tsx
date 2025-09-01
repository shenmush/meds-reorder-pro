import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, UserCheck, UserCog, UserPlus, Loader2 } from 'lucide-react';

interface PharmacyStaff {
  id: string;
  user_id: string;
  role: string;
  display_name?: string;
  email?: string;
  last_sign_in_at?: string | null;
}

interface Pharmacy {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  license_number?: string;
}

interface PharmacyDetailsProps {
  user: User;
  pharmacy: Pharmacy;
  onPharmacyUpdate: (pharmacy: Pharmacy) => void;
  userRole: string;
}

const PharmacyDetails: React.FC<PharmacyDetailsProps> = ({ 
  user, 
  pharmacy,
  onPharmacyUpdate,
  userRole
}) => {
  const [staff, setStaff] = useState<PharmacyStaff[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: pharmacy?.name || '',
    license_number: pharmacy?.license_number || '',
    phone: pharmacy?.phone || '',
    address: pharmacy?.address || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPharmacyStaff();
  }, [pharmacy.id]);

  useEffect(() => {
    if (pharmacy) {
      setFormData({
        name: pharmacy.name || '',
        license_number: pharmacy.license_number || '',
        phone: pharmacy.phone || '',
        address: pharmacy.address || '',
      });
    }
  }, [pharmacy]);

  const fetchPharmacyStaff = async () => {
    try {
      setStaffLoading(true);
      
      // Get all user_roles for this pharmacy (without join to avoid filtering)
      const { data: staffRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, user_id, role')
        .eq('pharmacy_id', pharmacy.id);

      if (rolesError) throw rolesError;

      // Get profiles and auth data for each staff member
      const staffWithDetails = await Promise.all(
        (staffRoles || []).map(async (staff) => {
          try {
            // Get display name from profiles
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('user_id', staff.user_id)
              .single();

            // Get email and last sign in from auth (this will fail for non-admin users, but that's ok)
            let email = 'نامشخص';
            let last_sign_in_at = null;
            
            try {
              const { data: authData } = await supabase.auth.admin.getUserById(staff.user_id);
              email = authData.user?.email || 'نامشخص';
              last_sign_in_at = authData.user?.last_sign_in_at || null;
            } catch (authError) {
              // Expected to fail for non-admin users
              console.log('Auth data not accessible (expected for non-admin users)');
            }
            
            return {
              id: staff.id,
              user_id: staff.user_id,
              role: staff.role,
              display_name: profile?.display_name || 'نام نمایشی تنظیم نشده',
              email,
              last_sign_in_at
            };
          } catch (error) {
            console.error('Error fetching staff details for user:', staff.user_id, error);
            return {
              id: staff.id,
              user_id: staff.user_id,
              role: staff.role,
              display_name: 'نام نمایشی تنظیم نشده',
              email: 'نامشخص',
              last_sign_in_at: null
            };
          }
        })
      );

      setStaff(staffWithDetails);
    } catch (error: any) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری اطلاعات کارمندان",
        variant: "destructive",
      });
      console.error('Error fetching staff:', error);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setProfileLoading(true);
      
      const { data, error } = await supabase
        .from('pharmacies')
        .update({
          name: formData.name,
          license_number: formData.license_number || null,
          phone: formData.phone || null,
          address: formData.address || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', pharmacy.id)
        .select()
        .single();

      if (error) throw error;

      onPharmacyUpdate(data);
      toast({
        title: "موفقیت",
        description: "اطلاعات داروخانه با موفقیت به‌روزرسانی شد",
      });
    } catch (error: any) {
      toast({
        title: "خطا",
        description: "خطا در به‌روزرسانی اطلاعات داروخانه",
        variant: "destructive",
      });
      console.error('Error updating pharmacy:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'pharmacy_staff':
        return 'کارمند داروخانه';
      case 'pharmacy_accountant':
        return 'حسابدار داروخانه';
      case 'pharmacy_manager':
        return 'مدیر داروخانه';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'pharmacy_staff':
        return <UserCheck className="h-4 w-4" />;
      case 'pharmacy_accountant':
        return <UserCog className="h-4 w-4" />;
      case 'pharmacy_manager':
        return <UserPlus className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'pharmacy_staff':
        return 'secondary';
      case 'pharmacy_accountant':
        return 'outline';
      case 'pharmacy_manager':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const canEdit = userRole === 'pharmacy_manager' || userRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Pharmacy Profile Section */}
      <Card className="shadow-[var(--shadow-medium)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-right">مشخصات داروخانه</CardTitle>
              <CardDescription className="text-right">
                اطلاعات و مشخصات داروخانه {pharmacy.name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-right block">
                  نام داروخانه *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="نام داروخانه را وارد کنید"
                  required
                  disabled={!canEdit}
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_number" className="text-right block">
                  شماره پروانه
                </Label>
                <Input
                  id="license_number"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  placeholder="شماره پروانه را وارد کنید"
                  disabled={!canEdit}
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-right block">
                  شماره تلفن
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="شماره تلفن را وارد کنید"
                  disabled={!canEdit}
                  className="text-right"
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="address" className="text-right block">
                  آدرس
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="آدرس داروخانه را وارد کنید"
                  disabled={!canEdit}
                  className="text-right min-h-[100px]"
                />
              </div>
            </div>

            {canEdit && (
              <div className="flex justify-end">
                <Button type="submit" disabled={profileLoading}>
                  {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {pharmacy ? 'به‌روزرسانی اطلاعات' : 'ثبت اطلاعات'}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Staff Management Section */}
      <Card className="shadow-[var(--shadow-medium)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-right">مدیریت کارمندان</CardTitle>
              <CardDescription className="text-right">
                لیست کارمندان داروخانه {pharmacy.name}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {staffLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">در حال بارگذاری کارمندان...</p>
              </div>
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              هیچ کارمندی یافت نشد
            </div>
          ) : (
            <div className="space-y-4">
              {staff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getRoleIcon(member.role)}
                    <div className="flex-1">
                      <p className="font-medium text-right">
                        {member.display_name}
                      </p>
                      <p className="text-sm text-muted-foreground text-right">
                        {member.email}
                      </p>
                      <p className="text-xs text-muted-foreground text-right">
                        آخرین ورود: {member.last_sign_in_at 
                          ? new Date(member.last_sign_in_at).toLocaleDateString('fa-IR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'هرگز'
                        }
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={getRoleVariant(member.role) as any}
                    className="gap-1"
                  >
                    {getRoleLabel(member.role)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacyDetails;