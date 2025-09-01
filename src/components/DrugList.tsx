import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Pill, Package, Search, Filter, Plus } from "lucide-react";
import { toast } from "sonner";
import DrugCard from './DrugCard';

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
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrugs();
  }, []);

  useEffect(() => {
    let filtered = drugs;

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(drug => 
        drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.irc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (drug.company_name && drug.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(drug => drug.type === typeFilter);
    }

    setFilteredDrugs(filtered);
  }, [searchTerm, typeFilter, drugs]);

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
            جستجو و سفارش داروها، تجهیزات پزشکی و محصولات طبیعی
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو در فهرست داروها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="نوع محصول" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه محصولات</SelectItem>
                  <SelectItem value="chemical">داروهای شیمیایی</SelectItem>
                  <SelectItem value="medical">تجهیزات پزشکی</SelectItem>
                  <SelectItem value="natural">محصولات طبیعی</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDrugs.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || typeFilter !== "all" ? 'نتیجه‌ای یافت نشد' : 'هیچ دارویی در سیستم ثبت نشده است'}
                </p>
              </div>
            ) : (
              filteredDrugs.map((drug) => (
                <DrugCard key={drug.id} drug={drug} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DrugList;