import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Pill, Plus, Save } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DrugFormData {
  type: 'chemical' | 'medical' | 'natural';
  irc: string;
  full_brand_name?: string;
  title?: string;
  full_en_brand_name?: string;
  erx_code?: string;
  generic_code?: string;
  atc_code?: string;
  action?: string;
  license_owner_company_name?: string;
  license_owner_name?: string;
  license_owner_company_national_id?: string;
  license_owner_national_code?: string;
  gtin?: string;
  package_count?: number;
  is_active: boolean;
}

const AdminAddDrug = () => {
  const [formData, setFormData] = useState<DrugFormData>({
    type: 'chemical',
    irc: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.irc) {
      toast({
        title: "خطا",
        description: "کد IRC الزامی است",
        variant: "destructive",
      });
      return;
    }

    // Check required fields based on type
    if (formData.type === 'chemical' && !formData.full_brand_name) {
      toast({
        title: "خطا",
        description: "نام کامل برند برای داروی شیمیایی الزامی است",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === 'medical' && !formData.title) {
      toast({
        title: "خطا",
        description: "عنوان برای تجهیزات پزشکی الزامی است",
        variant: "destructive",
      });
      return;
    }

    if (formData.type === 'natural' && !formData.full_en_brand_name) {
      toast({
        title: "خطا",
        description: "نام انگلیسی برند برای محصولات طبیعی الزامی است",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let tableName: 'chemical_drugs' | 'medical_supplies' | 'natural_products';
      let data: any = {
        irc: formData.irc,
        erx_code: formData.erx_code,
        action: formData.action,
        gtin: formData.gtin,
        package_count: formData.package_count ? parseInt(formData.package_count.toString()) : null,
        is_active: formData.is_active
      };

      switch (formData.type) {
        case 'chemical':
          tableName = 'chemical_drugs';
          data = {
            ...data,
            full_brand_name: formData.full_brand_name,
            generic_code: formData.generic_code,
            license_owner_company_name: formData.license_owner_company_name,
            license_owner_company_national_id: formData.license_owner_company_national_id
          };
          break;
        case 'medical':
          tableName = 'medical_supplies';
          data = {
            ...data,
            title: formData.title,
            license_owner_company_name: formData.license_owner_company_name,
            license_owner_company_national_code: formData.license_owner_company_national_id
          };
          break;
        case 'natural':
          tableName = 'natural_products';
          data = {
            ...data,
            full_en_brand_name: formData.full_en_brand_name,
            atc_code: formData.atc_code,
            license_owner_name: formData.license_owner_name,
            license_owner_national_code: formData.license_owner_national_code
          };
          break;
      }

      const { error } = await supabase
        .from(tableName)
        .insert([data]);

      if (error) throw error;

      toast({
        title: "موفقیت",
        description: "دارو با موفقیت اضافه شد",
      });

      // Reset form
      setFormData({
        type: 'chemical',
        irc: '',
        is_active: true
      });

    } catch (error: any) {
      console.error('Error adding drug:', error);
      toast({
        title: "خطا",
        description: error.message || "خطا در اضافه کردن دارو",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
        <h2 className={`font-bold gradient-text ${isMobile ? 'text-xl text-center' : 'text-2xl'}`}>
          افزودن دارو جدید
        </h2>
      </div>

      <Card className="shadow-medium border-border/60 rounded-2xl">
        <CardHeader className={isMobile ? 'px-4 py-4' : 'px-6 py-6'}>
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-lg' : 'text-xl'}`}>
            <Pill className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-primary`} />
            اطلاعات دارو
          </CardTitle>
          <CardDescription>
            فرم اضافه کردن دارو، تجهیزات پزشکی یا محصولات طبیعی جدید به سیستم
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? 'px-4 pb-4' : 'px-6 pb-6'}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Drug Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">نوع محصول *</Label>
              <Select value={formData.type} onValueChange={(value: 'chemical' | 'medical' | 'natural') => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="نوع محصول را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chemical">داروی شیمیایی</SelectItem>
                  <SelectItem value="medical">تجهیزات پزشکی</SelectItem>
                  <SelectItem value="natural">محصولات طبیعی</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Common Fields */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <div className="space-y-2">
                <Label htmlFor="irc" className="text-sm font-medium">کد IRC *</Label>
                <Input
                  id="irc"
                  value={formData.irc}
                  onChange={(e) => handleInputChange('irc', e.target.value)}
                  placeholder="کد IRC را وارد کنید"
                  required
                />
              </div>

              {/* Conditional Name/Title Field */}
              {formData.type === 'chemical' && (
                <div className="space-y-2">
                  <Label htmlFor="full_brand_name" className="text-sm font-medium">نام کامل برند *</Label>
                  <Input
                    id="full_brand_name"
                    value={formData.full_brand_name || ''}
                    onChange={(e) => handleInputChange('full_brand_name', e.target.value)}
                    placeholder="نام کامل برند را وارد کنید"
                    required
                  />
                </div>
              )}

              {formData.type === 'medical' && (
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">عنوان *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="عنوان تجهیزات پزشکی را وارد کنید"
                    required
                  />
                </div>
              )}

              {formData.type === 'natural' && (
                <div className="space-y-2">
                  <Label htmlFor="full_en_brand_name" className="text-sm font-medium">نام انگلیسی برند *</Label>
                  <Input
                    id="full_en_brand_name"
                    value={formData.full_en_brand_name || ''}
                    onChange={(e) => handleInputChange('full_en_brand_name', e.target.value)}
                    placeholder="نام انگلیسی برند را وارد کنید"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="erx_code" className="text-sm font-medium">کد ERX</Label>
                <Input
                  id="erx_code"
                  value={formData.erx_code || ''}
                  onChange={(e) => handleInputChange('erx_code', e.target.value)}
                  placeholder="کد ERX را وارد کنید"
                />
              </div>

              {/* Chemical Drug Specific */}
              {formData.type === 'chemical' && (
                <div className="space-y-2">
                  <Label htmlFor="generic_code" className="text-sm font-medium">کد ژنریک</Label>
                  <Input
                    id="generic_code"
                    value={formData.generic_code || ''}
                    onChange={(e) => handleInputChange('generic_code', e.target.value)}
                    placeholder="کد ژنریک را وارد کنید"
                  />
                </div>
              )}

              {/* Natural Products Specific */}
              {formData.type === 'natural' && (
                <div className="space-y-2">
                  <Label htmlFor="atc_code" className="text-sm font-medium">کد ATC</Label>
                  <Input
                    id="atc_code"
                    value={formData.atc_code || ''}
                    onChange={(e) => handleInputChange('atc_code', e.target.value)}
                    placeholder="کد ATC را وارد کنید"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="gtin" className="text-sm font-medium">کد GTIN</Label>
                <Input
                  id="gtin"
                  value={formData.gtin || ''}
                  onChange={(e) => handleInputChange('gtin', e.target.value)}
                  placeholder="کد GTIN را وارد کنید"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="package_count" className="text-sm font-medium">تعداد در بسته</Label>
                <Input
                  id="package_count"
                  type="number"
                  value={formData.package_count || ''}
                  onChange={(e) => handleInputChange('package_count', e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="تعداد در بسته را وارد کنید"
                />
              </div>
            </div>

            {/* Company/License Owner Fields */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {(formData.type === 'chemical' || formData.type === 'medical') && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="license_owner_company_name" className="text-sm font-medium">نام شرکت صاحب پروانه</Label>
                    <Input
                      id="license_owner_company_name"
                      value={formData.license_owner_company_name || ''}
                      onChange={(e) => handleInputChange('license_owner_company_name', e.target.value)}
                      placeholder="نام شرکت صاحب پروانه را وارد کنید"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license_owner_company_national_id" className="text-sm font-medium">کد ملی شرکت صاحب پروانه</Label>
                    <Input
                      id="license_owner_company_national_id"
                      value={formData.license_owner_company_national_id || ''}
                      onChange={(e) => handleInputChange('license_owner_company_national_id', e.target.value)}
                      placeholder="کد ملی شرکت را وارد کنید"
                    />
                  </div>
                </>
              )}

              {formData.type === 'natural' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="license_owner_name" className="text-sm font-medium">نام صاحب پروانه</Label>
                    <Input
                      id="license_owner_name"
                      value={formData.license_owner_name || ''}
                      onChange={(e) => handleInputChange('license_owner_name', e.target.value)}
                      placeholder="نام صاحب پروانه را وارد کنید"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license_owner_national_code" className="text-sm font-medium">کد ملی صاحب پروانه</Label>
                    <Input
                      id="license_owner_national_code"
                      value={formData.license_owner_national_code || ''}
                      onChange={(e) => handleInputChange('license_owner_national_code', e.target.value)}
                      placeholder="کد ملی صاحب پروانه را وارد کنید"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Action Field */}
            <div className="space-y-2">
              <Label htmlFor="action" className="text-sm font-medium">عملکرد</Label>
              <Textarea
                id="action"
                value={formData.action || ''}
                onChange={(e) => handleInputChange('action', e.target.value)}
                placeholder="عملکرد و توضیحات دارو را وارد کنید"
                className="min-h-[100px]"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked as boolean)}
              />
              <Label htmlFor="is_active" className="text-sm font-medium">فعال</Label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className={`gap-2 ${isMobile ? 'w-full' : 'min-w-[150px]'}`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    ذخیره دارو
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAddDrug;