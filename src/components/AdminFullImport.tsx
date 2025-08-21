import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';

const AdminFullImport = () => {
  const [importing, setImporting] = useState(false);

  const handleFullImport = async () => {
    setImporting(true);
    try {
      console.log('Starting full import process...');
      
      const { data, error } = await supabase.functions.invoke('import-all-csv-data');
      
      if (error) {
        console.error('Import error:', error);
        toast.error(`خطا در شروع وارد کردن داده‌ها: ${error.message}`);
        return;
      }
      
      console.log('Import result:', data);
      
      if (data.success) {
        toast.success('فرآیند وارد کردن تمام داده‌ها شروع شد. این کار چند دقیقه طول می‌کشد.');
        toast.info('می‌توانید صفحه را بسته و بعداً برگردید. فرآیند در پس‌زمینه ادامه خواهد یافت.');
      } else {
        toast.error(`خطا در شروع فرآیند: ${data.error}`);
      }
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('خطای غیرمنتظره در شروع فرآیند وارد کردن');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          وارد کردن کامل داده‌های CSV
        </CardTitle>
        <CardDescription>
          وارد کردن تمام ۲۹ هزار رکورد داروهای شیمیایی از فایل CSV
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">توجه:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• این فرآیند تمام داده‌های فایل CSV را وارد می‌کند</li>
            <li>• حدود ۲۹ هزار رکورد پردازش خواهد شد</li>
            <li>• فرآیند در پس‌زمینه اجرا می‌شود</li>
            <li>• ممکن است چند دقیقه طول بکشد</li>
          </ul>
        </div>
        
        <Button 
          onClick={handleFullImport}
          disabled={importing}
          className="w-full"
          size="lg"
        >
          {importing ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              در حال شروع...
            </>
          ) : (
            <>
              <Upload className="ml-2 h-4 w-4" />
              وارد کردن تمام داده‌ها
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminFullImport;