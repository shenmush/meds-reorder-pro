import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [tableType, setTableType] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus({ type: null, message: '' });
    }
  };

  const handleUpload = async () => {
    if (!file || !tableType) {
      toast({
        title: "خطا",
        description: "لطفاً فایل و نوع جدول را انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tableType', tableType);

      const { data, error } = await supabase.functions.invoke('upload-drugs-excel', {
        body: formData,
      });

      if (error) throw error;

      if (data.success) {
        setUploadStatus({ type: 'success', message: data.message });
        toast({
          title: "موفقیت",
          description: data.message,
        });
        setFile(null);
        setTableType('');
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(data.error || 'خطا در آپلود فایل');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطا در آپلود فایل';
      setUploadStatus({ type: 'error', message: errorMessage });
      toast({
        title: "خطا",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const tableOptions = [
    { value: 'chemical_drugs', label: 'داروهای شیمیایی (Chemical Drugs)' },
    { value: 'natural_products', label: 'محصولات طبیعی (Natural Products)' },
    { value: 'medical_supplies', label: 'ملزومات پزشکی (Medical Supplies)' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            آپلود فایل اکسل داروها
          </CardTitle>
          <CardDescription>
            فایل اکسل خود را برای وارد کردن داروها به دیتابیس انتخاب کنید
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="table-type">نوع جدول</Label>
            <Select value={tableType} onValueChange={setTableType}>
              <SelectTrigger>
                <SelectValue placeholder="نوع جدول را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {tableOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">فایل اکسل</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,.csv,.txt"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>

          {uploadStatus.type && (
            <div className={`flex items-center gap-2 p-3 rounded-md ${
              uploadStatus.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {uploadStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span className="text-sm">{uploadStatus.message}</span>
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={!file || !tableType || uploading}
            className="w-full"
          >
            {uploading ? 'در حال آپلود...' : 'آپلود فایل'}
          </Button>

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>فرمت مورد انتظار:</strong></p>
            <p>• فایل باید در فرمت اکسل یا CSV باشد</p>
            <p>• ستون‌ها باید به ترتیب: IRC، نام، شرکت، کد ملی، تعداد، ERX Code، GTIN، وضعیت باشند</p>
            <p>• اولین سطر باید هدر باشد</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUpload;