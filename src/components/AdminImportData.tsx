import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AdminImportData = () => {
  const [importing, setImporting] = useState(false);

  const handleImportChemicalDrugs = async () => {
    setImporting(true);
    try {
      console.log('Starting import process...');
      
      const { data, error } = await supabase.functions.invoke('import-csv-data');
      
      if (error) {
        console.error('Import error:', error);
        toast.error(`خطا در وارد کردن داده‌ها: ${error.message}`);
        return;
      }
      
      console.log('Import result:', data);
      
      if (data.success) {
        toast.success(`داده‌ها با موفقیت وارد شدند. تعداد پردازش شده: ${data.processedCount}, خطا: ${data.errorCount}`);
      } else {
        toast.error(`خطا در وارد کردن داده‌ها: ${data.error}`);
      }
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('خطای غیرمنتظره در وارد کردن داده‌ها');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>وارد کردن داده‌های CSV</CardTitle>
        <CardDescription>
          داده‌های فایل‌های CSV را به دیتابیس وارد کنید
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">داروهای شیمیایی</h3>
          <p className="text-sm text-muted-foreground">
            وارد کردن داده‌های داروهای شیمیایی از فایل CSV
          </p>
          <Button 
            onClick={handleImportChemicalDrugs}
            disabled={importing}
            className="w-full"
          >
            {importing ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                در حال وارد کردن...
              </>
            ) : (
              'وارد کردن داروهای شیمیایی'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminImportData;