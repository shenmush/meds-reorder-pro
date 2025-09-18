import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Building2, Loader2 } from 'lucide-react';
import StaffManagement from './StaffManagement';

interface Pharmacy {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  license_number?: string;
}

interface PharmacyDetailsProps {
  user: User;
  pharmacy: Pharmacy | null;
  onPharmacyUpdate: (pharmacy: Pharmacy) => void;
  userRole: string;
}

const PharmacyDetails: React.FC<PharmacyDetailsProps> = ({ 
  user, 
  pharmacy,
  onPharmacyUpdate,
  userRole
}) => {
  const [formData, setFormData] = useState({
    name: pharmacy?.name || '',
    license_number: pharmacy?.license_number || '',
    phone: pharmacy?.phone || '',
    address: pharmacy?.address || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pharmacy?.id) {
      toast({
        title: "خطا",
        description: "اطلاعات داروخانه یافت نشد",
        variant: "destructive",
      });
      return;
    }
    
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
                اطلاعات و مشخصات داروخانه {pharmacy?.name}
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
      {pharmacy?.id && (
        <StaffManagement
          user={user}
          pharmacyId={pharmacy.id}
          pharmacyName={pharmacy.name}
        />
      )}
    </div>
  );
};

export default PharmacyDetails;