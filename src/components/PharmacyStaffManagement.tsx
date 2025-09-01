import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, UserCheck, UserCog, UserPlus } from 'lucide-react';

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
}

interface PharmacyStaffManagementProps {
  user: User;
  pharmacy: Pharmacy;
}

const PharmacyStaffManagement: React.FC<PharmacyStaffManagementProps> = ({ 
  user, 
  pharmacy 
}) => {
  const [staff, setStaff] = useState<PharmacyStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPharmacyStaff();
  }, [pharmacy.id]);

  const fetchPharmacyStaff = async () => {
    try {
      setLoading(true);
      
      // Get staff roles for this specific pharmacy
      const { data: staffRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          profiles!inner(display_name)
        `)
        .eq('pharmacy_id', pharmacy.id)
        .in('role', ['pharmacy_staff', 'pharmacy_accountant', 'pharmacy_manager']);

      if (rolesError) throw rolesError;

      // Get user emails and last sign in from auth metadata
      const staffWithDetails = await Promise.all(
        (staffRoles || []).map(async (staff) => {
          try {
            // Get user email and last sign in from auth metadata
            const { data: authData } = await supabase.auth.admin.getUserById(staff.user_id);
            
            return {
              id: staff.id,
              user_id: staff.user_id,
              role: staff.role,
              display_name: (staff.profiles as any)?.display_name || 'نام نمایشی تنظیم نشده',
              email: authData.user?.email || 'نامشخص',
              last_sign_in_at: authData.user?.last_sign_in_at || null
            };
          } catch (authError) {
            console.error('Error fetching auth data for user:', staff.user_id, authError);
            return {
              id: staff.id,
              user_id: staff.user_id,
              role: staff.role,
              display_name: (staff.profiles as any)?.display_name || 'نام نمایشی تنظیم نشده',
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
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="shadow-[var(--shadow-medium)]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-right">مدیریت کارمندان داروخانه</CardTitle>
            <CardDescription className="text-right">
              کارمندان داروخانه {pharmacy.name}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {staff.length === 0 ? (
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
  );
};

export default PharmacyStaffManagement;