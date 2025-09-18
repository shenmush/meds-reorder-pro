import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, Pill } from 'lucide-react';

interface PharmacySetupProps {
  user: User;
  onSetupComplete: () => void;
}

const PharmacySetup: React.FC<PharmacySetupProps> = ({ user, onSetupComplete }) => {
  const [pharmacyName, setPharmacyName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!pharmacyName.trim()) {
        toast({
          title: "خطا",
          description: "لطفاً نام داروخانه را وارد کنید",
          variant: "destructive",
        });
        return;
      }

      console.log('Starting pharmacy setup for user:', user.id);

      // Create the pharmacy
      const { data: pharmacyData, error: pharmacyError } = await supabase
        .from('pharmacies')
        .insert({
          name: pharmacyName.trim()
        })
        .select()
        .single();

      if (pharmacyError) {
        console.error('Error creating pharmacy:', pharmacyError);
        throw new Error('خطا در ایجاد داروخانه');
      }

      console.log('Pharmacy created:', pharmacyData);

      // Insert user role as pharmacy manager
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'pharmacy_manager',
          pharmacy_id: pharmacyData.id
        });

      if (roleError) {
        console.error('Error inserting user role:', roleError);
        throw new Error('خطا در تعیین نقش کاربری');
      }

      console.log('User role created successfully');

      toast({
        title: "تنظیمات کامل شد",
        description: "داروخانه شما با موفقیت ایجاد شد",
      });

      // Call completion callback
      onSetupComplete();
    } catch (error: any) {
      console.error('Setup error:', error);
      toast({
        title: "خطا",
        description: error.message || "خطایی رخ داده است",
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
              <Building2 className="h-12 w-12 text-primary" />
              <Pill className="h-6 w-6 text-secondary absolute -bottom-1 -right-1" />
            </div>
          </div>
          <CardTitle className="text-2xl text-right">
            تنظیم داروخانه
          </CardTitle>
          <CardDescription className="text-right">
            لطفاً نام داروخانه خود را وارد کنید تا تنظیمات اولیه کامل شود
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pharmacyName" className="text-right block">نام داروخانه</Label>
              <Input
                id="pharmacyName"
                type="text"
                placeholder="داروخانه مهر"
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                required
                className="text-right"
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
                  در حال ایجاد...
                </>
              ) : (
                'ایجاد داروخانه'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacySetup;