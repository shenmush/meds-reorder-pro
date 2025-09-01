import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Building2, Loader2, Save } from 'lucide-react';

interface Pharmacy {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  license_number?: string;
}

interface PharmacyProfileProps {
  user: User;
  pharmacy: Pharmacy | null;
  onPharmacyUpdate: (pharmacy: Pharmacy) => void;
  userRole?: string;
}

const PharmacyProfile: React.FC<PharmacyProfileProps> = ({ 
  user, 
  pharmacy, 
  onPharmacyUpdate,
  userRole
}) => {
  const [formData, setFormData] = useState({
    name: pharmacy?.name || '',
    address: pharmacy?.address || '',
    phone: pharmacy?.phone || '',
    license_number: pharmacy?.license_number || '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (pharmacy) {
        // Update existing pharmacy
        const { data, error } = await supabase
          .from('pharmacies')
          .update(formData)
          .eq('id', pharmacy.id)
          .select()
          .single();

        if (error) throw error;
        
        onPharmacyUpdate(data);
        toast({
          title: "بروزرسانی موفق",
          description: "اطلاعات داروخانه با موفقیت بروزرسانی شد",
        });
      } else {
        // Create new pharmacy profile
        const { data, error } = await supabase
          .from('pharmacies')
          .insert({
            ...formData,
            user_id: user.id,
          })
          .select()
          .single();

        if (error) throw error;
        
        onPharmacyUpdate(data);
        toast({
          title: "ثبت موفق",
          description: "اطلاعات داروخانه با موفقیت ثبت شد",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در ثبت اطلاعات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const canEdit = userRole === 'pharmacy_manager' || userRole === 'admin' || !userRole;

  return (
    <Card className="max-w-2xl mx-auto shadow-[var(--shadow-medium)]">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Building2 className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-right">
          {pharmacy ? 'ویرایش اطلاعات داروخانه' : 'تکمیل اطلاعات داروخانه'}
        </CardTitle>
        <CardDescription className="text-right">
          {pharmacy 
            ? 'اطلاعات داروخانه خود را ویرایش کنید'
            : 'لطفاً اطلاعات داروخانه خود را تکمیل کنید'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-right block">
              نام داروخانه *
            </Label>
            <Input
              id="name"
              placeholder="نام داروخانه"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              className="text-right"
              readOnly={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="license_number" className="text-right block">
              شماره پروانه
            </Label>
            <Input
              id="license_number"
              placeholder="شماره پروانه داروخانه"
              value={formData.license_number}
              onChange={(e) => handleInputChange('license_number', e.target.value)}
              className="text-right"
              readOnly={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-right block">
              شماره تماس
            </Label>
            <Input
              id="phone"
              placeholder="09123456789"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="text-right"
              dir="ltr"
              readOnly={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-right block">
              آدرس
            </Label>
            <Textarea
              id="address"
              placeholder="آدرس کامل داروخانه"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="text-right min-h-[100px]"
              readOnly={!canEdit}
            />
          </div>

          {canEdit && (
            <Button
              type="submit"
              className="w-full text-lg gap-2"
              disabled={loading}
              style={{ background: 'var(--gradient-primary)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {pharmacy ? 'بروزرسانی اطلاعات' : 'ثبت اطلاعات'}
                </>
              )}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default PharmacyProfile;