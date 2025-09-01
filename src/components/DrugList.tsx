import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pill, Package, Search } from "lucide-react";
import { toast } from "sonner";

interface Drug {
  id: string;
  name: string;
  irc: string;
  package_count: number | null;
  company_name: string | null;
  type: 'chemical' | 'medical' | 'natural';
  erx_code?: string;
  gtin?: string;
}

const DrugList: React.FC = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrugs();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDrugs(drugs);
    } else {
      const filtered = drugs.filter(drug => 
        drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.irc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (drug.company_name && drug.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDrugs(filtered);
    }
  }, [searchTerm, drugs]);

  const fetchDrugs = async () => {
    try {
      setLoading(true);
      
      // Fetch from all three tables
      const [chemicalResult, medicalResult, naturalResult] = await Promise.all([
        supabase
          .from('chemical_drugs')
          .select('id, full_brand_name, irc, package_count, license_owner_company_name, erx_code, gtin')
          .eq('is_active', true),
        supabase
          .from('medical_supplies')
          .select('id, title, irc, package_count, license_owner_company_name, erx_code, gtin')
          .eq('is_active', true),
        supabase
          .from('natural_products')
          .select('id, full_en_brand_name, irc, package_count, license_owner_name, erx_code, gtin')
          .eq('is_active', true)
      ]);

      const combinedDrugs: Drug[] = [
        ...(chemicalResult.data || []).map(item => ({
          id: item.id,
          name: item.full_brand_name,
          irc: item.irc,
          package_count: item.package_count,
          company_name: item.license_owner_company_name,
          type: 'chemical' as const,
          erx_code: item.erx_code || undefined,
          gtin: item.gtin || undefined
        })),
        ...(medicalResult.data || []).map(item => ({
          id: item.id,
          name: item.title,
          irc: item.irc,
          package_count: item.package_count,
          company_name: item.license_owner_company_name,
          type: 'medical' as const,
          erx_code: item.erx_code || undefined,
          gtin: item.gtin || undefined
        })),
        ...(naturalResult.data || []).map(item => ({
          id: item.id,
          name: item.full_en_brand_name,
          irc: item.irc,
          package_count: item.package_count,
          company_name: item.license_owner_name,
          type: 'natural' as const,
          erx_code: item.erx_code || undefined,
          gtin: item.gtin || undefined
        }))
      ];

      setDrugs(combinedDrugs);
      setFilteredDrugs(combinedDrugs);
    } catch (error) {
      console.error('Error fetching drugs:', error);
      toast.error('خطا در بارگذاری فهرست داروها');
    } finally {
      setLoading(false);
    }
  };

  const getDrugTypeBadge = (type: string) => {
    const typeMap = {
      'chemical': { label: 'دارو', variant: 'default' as const },
      'medical': { label: 'تجهیزات پزشکی', variant: 'secondary' as const },
      'natural': { label: 'محصولات طبیعی', variant: 'outline' as const }
    };
    
    const config = typeMap[type as keyof typeof typeMap] || { label: type, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">در حال بارگذاری فهرست داروها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            فهرست داروها و تجهیزات پزشکی
          </CardTitle>
          <CardDescription>
            مجموعه کامل داروها، تجهیزات پزشکی و محصولات طبیعی موجود در سیستم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجو در فهرست داروها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
          
          <div className="grid gap-4">
            {filteredDrugs.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'نتیجه‌ای یافت نشد' : 'هیچ دارویی در سیستم ثبت نشده است'}
                </p>
              </div>
            ) : (
              filteredDrugs.map((drug) => (
                <Card key={drug.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{drug.name}</h3>
                          {getDrugTypeBadge(drug.type)}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p><span className="font-medium">کد IRC:</span> {drug.irc}</p>
                          {drug.company_name && (
                            <p><span className="font-medium">شرکت سازنده:</span> {drug.company_name}</p>
                          )}
                          {drug.package_count && (
                            <p><span className="font-medium">تعداد در بسته:</span> {drug.package_count}</p>
                          )}
                          {drug.erx_code && (
                            <p><span className="font-medium">کد ERX:</span> {drug.erx_code}</p>
                          )}
                          {drug.gtin && (
                            <p><span className="font-medium">کد GTIN:</span> {drug.gtin}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DrugList;