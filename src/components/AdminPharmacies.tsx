import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, Phone, MapPin, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Pharmacy {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  license_number?: string;
  created_at: string;
  user_id: string;
}

const AdminPharmacies = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPharmacies();
  }, []);

  useEffect(() => {
    const filtered = pharmacies.filter(pharmacy =>
      pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pharmacy.license_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPharmacies(filtered);
  }, [searchTerm, pharmacies]);

  const fetchPharmacies = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPharmacies(data || []);
    } catch (error) {
      console.error('Error fetching pharmacies:', error);
      toast({
        title: "خطا",
        description: "خطا در دریافت لیست داروخانه‌ها",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">مدیریت داروخانه‌ها</h2>
        <Badge variant="secondary" className="text-sm">
          {pharmacies.length} داروخانه
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="جستجو در داروخانه‌ها..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPharmacies.map((pharmacy) => (
          <Card key={pharmacy.id} className="hover:shadow-elegant transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-primary" />
                {pharmacy.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">

              {pharmacy.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>{pharmacy.address}</span>
                </div>
              )}

              {pharmacy.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{pharmacy.phone}</span>
                </div>
              )}

              {pharmacy.license_number && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>شماره مجوز: {pharmacy.license_number}</span>
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  تاریخ ثبت: {formatDate(pharmacy.created_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPharmacies.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            {searchTerm ? 'داروخانه‌ای یافت نشد' : 'هیچ داروخانه‌ای ثبت نشده'}
          </h3>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              جستجوی دیگری امتحان کنید
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPharmacies;