import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminAddDrug = () => {
  const [tableType, setTableType] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Chemical drugs form data
  const [chemicalData, setChemicalData] = useState({
    irc: '',
    full_brand_name: '',
    license_owner_company_name: '',
    license_owner_company_national_id: '',
    package_count: '',
    erx_code: '',
    gtin: '',
    action: '',
    generic_code: ''
  });

  // Natural products form data
  const [naturalData, setNaturalData] = useState({
    irc: '',
    full_en_brand_name: '',
    license_owner_name: '',
    license_owner_national_code: '',
    package_count: '',
    erx_code: '',
    gtin: '',
    action: '',
    atc_code: ''
  });

  // Medical supplies form data
  const [medicalData, setMedicalData] = useState({
    irc: '',
    title: '',
    license_owner_company_name: '',
    license_owner_company_national_code: '',
    package_count: '',
    erx_code: '',
    gtin: '',
    action: ''
  });

  const resetForm = () => {
    setChemicalData({
      irc: '',
      full_brand_name: '',
      license_owner_company_name: '',
      license_owner_company_national_id: '',
      package_count: '',
      erx_code: '',
      gtin: '',
      action: '',
      generic_code: ''
    });

    setNaturalData({
      irc: '',
      full_en_brand_name: '',
      license_owner_name: '',
      license_owner_national_code: '',
      package_count: '',
      erx_code: '',
      gtin: '',
      action: '',
      atc_code: ''
    });

    setMedicalData({
      irc: '',
      title: '',
      license_owner_company_name: '',
      license_owner_company_national_code: '',
      package_count: '',
      erx_code: '',
      gtin: '',
      action: ''
    });
  };

  const handleSave = async () => {
    if (!tableType) {
      toast({
        title: "خطا",
        description: "لطفاً نوع جدول را انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      let tableName: 'chemical_drugs' | 'natural_products' | 'medical_supplies';
      let dataToInsert: any = {};

      if (tableType === 'chemical_drugs') {
        if (!chemicalData.irc || !chemicalData.full_brand_name) {
          throw new Error('IRC و نام دارو الزامی است');
        }
        
        tableName = 'chemical_drugs';
        dataToInsert = {
          ...chemicalData,
          package_count: chemicalData.package_count ? parseInt(chemicalData.package_count) : null
        };
      } else if (tableType === 'natural_products') {
        if (!naturalData.irc || !naturalData.full_en_brand_name) {
          throw new Error('IRC و نام محصول الزامی است');
        }
        
        tableName = 'natural_products';
        dataToInsert = {
          ...naturalData,
          package_count: naturalData.package_count ? parseInt(naturalData.package_count) : null
        };
      } else if (tableType === 'medical_supplies') {
        if (!medicalData.irc || !medicalData.title) {
          throw new Error('IRC و عنوان الزامی است');
        }
        
        tableName = 'medical_supplies';
        dataToInsert = {
          ...medicalData,
          package_count: medicalData.package_count ? parseInt(medicalData.package_count) : null
        };
      } else {
        throw new Error('نوع جدول نامعتبر است');
      }

      const { error } = await supabase
        .from(tableName)
        .insert(dataToInsert);

      if (error) throw error;

      toast({
        title: "موفق",
        description: "محصول با موفقیت اضافه شد",
      });

      resetForm();
    } catch (error: any) {
      console.error('Error saving drug:', error);
      toast({
        title: "خطا",
        description: error.message || "خطایی در ذخیره محصول رخ داد",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderChemicalDrugsForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="irc">IRC *</Label>
          <Input
            id="irc"
            value={chemicalData.irc}
            onChange={(e) => setChemicalData({...chemicalData, irc: e.target.value})}
            placeholder="کد IRC"
          />
        </div>
        <div>
          <Label htmlFor="full_brand_name">نام کامل دارو *</Label>
          <Input
            id="full_brand_name"
            value={chemicalData.full_brand_name}
            onChange={(e) => setChemicalData({...chemicalData, full_brand_name: e.target.value})}
            placeholder="نام کامل دارو"
          />
        </div>
        <div>
          <Label htmlFor="company_name">نام شرکت</Label>
          <Input
            id="company_name"
            value={chemicalData.license_owner_company_name}
            onChange={(e) => setChemicalData({...chemicalData, license_owner_company_name: e.target.value})}
            placeholder="نام شرکت صاحب پروانه"
          />
        </div>
        <div>
          <Label htmlFor="company_national_id">کد ملی شرکت</Label>
          <Input
            id="company_national_id"
            value={chemicalData.license_owner_company_national_id}
            onChange={(e) => setChemicalData({...chemicalData, license_owner_company_national_id: e.target.value})}
            placeholder="کد ملی شرکت"
          />
        </div>
        <div>
          <Label htmlFor="package_count">تعداد بسته</Label>
          <Input
            id="package_count"
            type="number"
            value={chemicalData.package_count}
            onChange={(e) => setChemicalData({...chemicalData, package_count: e.target.value})}
            placeholder="تعداد در بسته"
          />
        </div>
        <div>
          <Label htmlFor="erx_code">ERX Code</Label>
          <Input
            id="erx_code"
            value={chemicalData.erx_code}
            onChange={(e) => setChemicalData({...chemicalData, erx_code: e.target.value})}
            placeholder="کد ERX"
          />
        </div>
        <div>
          <Label htmlFor="gtin">GTIN</Label>
          <Input
            id="gtin"
            value={chemicalData.gtin}
            onChange={(e) => setChemicalData({...chemicalData, gtin: e.target.value})}
            placeholder="کد GTIN"
          />
        </div>
        <div>
          <Label htmlFor="generic_code">کد ژنریک</Label>
          <Input
            id="generic_code"
            value={chemicalData.generic_code}
            onChange={(e) => setChemicalData({...chemicalData, generic_code: e.target.value})}
            placeholder="کد ژنریک"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="action">وضعیت</Label>
          <Input
            id="action"
            value={chemicalData.action}
            onChange={(e) => setChemicalData({...chemicalData, action: e.target.value})}
            placeholder="وضعیت دارو"
          />
        </div>
      </div>
    </div>
  );

  const renderNaturalProductsForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="irc_natural">IRC *</Label>
          <Input
            id="irc_natural"
            value={naturalData.irc}
            onChange={(e) => setNaturalData({...naturalData, irc: e.target.value})}
            placeholder="کد IRC"
          />
        </div>
        <div>
          <Label htmlFor="full_en_brand_name">نام انگلیسی محصول *</Label>
          <Input
            id="full_en_brand_name"
            value={naturalData.full_en_brand_name}
            onChange={(e) => setNaturalData({...naturalData, full_en_brand_name: e.target.value})}
            placeholder="نام انگلیسی کامل"
          />
        </div>
        <div>
          <Label htmlFor="license_owner_name">نام صاحب پروانه</Label>
          <Input
            id="license_owner_name"
            value={naturalData.license_owner_name}
            onChange={(e) => setNaturalData({...naturalData, license_owner_name: e.target.value})}
            placeholder="نام صاحب پروانه"
          />
        </div>
        <div>
          <Label htmlFor="license_owner_national_code">کد ملی صاحب پروانه</Label>
          <Input
            id="license_owner_national_code"
            value={naturalData.license_owner_national_code}
            onChange={(e) => setNaturalData({...naturalData, license_owner_national_code: e.target.value})}
            placeholder="کد ملی صاحب پروانه"
          />
        </div>
        <div>
          <Label htmlFor="package_count_natural">تعداد بسته</Label>
          <Input
            id="package_count_natural"
            type="number"
            value={naturalData.package_count}
            onChange={(e) => setNaturalData({...naturalData, package_count: e.target.value})}
            placeholder="تعداد در بسته"
          />
        </div>
        <div>
          <Label htmlFor="erx_code_natural">ERX Code</Label>
          <Input
            id="erx_code_natural"
            value={naturalData.erx_code}
            onChange={(e) => setNaturalData({...naturalData, erx_code: e.target.value})}
            placeholder="کد ERX"
          />
        </div>
        <div>
          <Label htmlFor="gtin_natural">GTIN</Label>
          <Input
            id="gtin_natural"
            value={naturalData.gtin}
            onChange={(e) => setNaturalData({...naturalData, gtin: e.target.value})}
            placeholder="کد GTIN"
          />
        </div>
        <div>
          <Label htmlFor="atc_code">ATC Code</Label>
          <Input
            id="atc_code"
            value={naturalData.atc_code}
            onChange={(e) => setNaturalData({...naturalData, atc_code: e.target.value})}
            placeholder="کد ATC"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="action_natural">وضعیت</Label>
          <Input
            id="action_natural"
            value={naturalData.action}
            onChange={(e) => setNaturalData({...naturalData, action: e.target.value})}
            placeholder="وضعیت محصول"
          />
        </div>
      </div>
    </div>
  );

  const renderMedicalSuppliesForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="irc_medical">IRC *</Label>
          <Input
            id="irc_medical"
            value={medicalData.irc}
            onChange={(e) => setMedicalData({...medicalData, irc: e.target.value})}
            placeholder="کد IRC"
          />
        </div>
        <div>
          <Label htmlFor="title">عنوان *</Label>
          <Input
            id="title"
            value={medicalData.title}
            onChange={(e) => setMedicalData({...medicalData, title: e.target.value})}
            placeholder="عنوان ملزومات پزشکی"
          />
        </div>
        <div>
          <Label htmlFor="company_name_medical">نام شرکت</Label>
          <Input
            id="company_name_medical"
            value={medicalData.license_owner_company_name}
            onChange={(e) => setMedicalData({...medicalData, license_owner_company_name: e.target.value})}
            placeholder="نام شرکت صاحب پروانه"
          />
        </div>
        <div>
          <Label htmlFor="company_national_code_medical">کد ملی شرکت</Label>
          <Input
            id="company_national_code_medical"
            value={medicalData.license_owner_company_national_code}
            onChange={(e) => setMedicalData({...medicalData, license_owner_company_national_code: e.target.value})}
            placeholder="کد ملی شرکت"
          />
        </div>
        <div>
          <Label htmlFor="package_count_medical">تعداد بسته</Label>
          <Input
            id="package_count_medical"
            type="number"
            value={medicalData.package_count}
            onChange={(e) => setMedicalData({...medicalData, package_count: e.target.value})}
            placeholder="تعداد در بسته"
          />
        </div>
        <div>
          <Label htmlFor="erx_code_medical">ERX Code</Label>
          <Input
            id="erx_code_medical"
            value={medicalData.erx_code}
            onChange={(e) => setMedicalData({...medicalData, erx_code: e.target.value})}
            placeholder="کد ERX"
          />
        </div>
        <div>
          <Label htmlFor="gtin_medical">GTIN</Label>
          <Input
            id="gtin_medical"
            value={medicalData.gtin}
            onChange={(e) => setMedicalData({...medicalData, gtin: e.target.value})}
            placeholder="کد GTIN"
          />
        </div>
        <div>
          <Label htmlFor="action_medical">وضعیت</Label>
          <Input
            id="action_medical"
            value={medicalData.action}
            onChange={(e) => setMedicalData({...medicalData, action: e.target.value})}
            placeholder="وضعیت ملزومات"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            افزودن محصول جدید
          </CardTitle>
          <CardDescription>
            محصول جدید را به صورت دستی به دیتابیس اضافه کنید
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Table Type Selection */}
          <div>
            <Label htmlFor="tableType">نوع جدول *</Label>
            <Select value={tableType} onValueChange={setTableType}>
              <SelectTrigger>
                <SelectValue placeholder="نوع جدول را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chemical_drugs">داروهای شیمیایی</SelectItem>
                <SelectItem value="natural_products">محصولات طبیعی</SelectItem>
                <SelectItem value="medical_supplies">ملزومات پزشکی</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Form Fields */}
          {tableType === 'chemical_drugs' && renderChemicalDrugsForm()}
          {tableType === 'natural_products' && renderNaturalProductsForm()}
          {tableType === 'medical_supplies' && renderMedicalSuppliesForm()}

          {/* Save Button */}
          {tableType && (
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'در حال ذخیره...' : 'ذخیره محصول'}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForm}
                disabled={saving}
              >
                پاک کردن فرم
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAddDrug;