import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, Trash2, Plus, Minus, Package, Pill } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  quantity: number;
  drug_id: string;
  drug_name: string;
  drug_type: string;
  drug_company?: string;
  drug_irc?: string;
  drug_gtin?: string;
  drug_erx_code?: string;
}

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

interface EditOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderItems: OrderItem[];
  orderNotes: string | null;
  onOrderUpdated: () => void;
}

const EditOrderDialog: React.FC<EditOrderDialogProps> = ({
  isOpen,
  onClose,
  orderId,
  orderItems,
  orderNotes,
  onOrderUpdated
}) => {
  const [currentItems, setCurrentItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Drug search states
  const [drugSearchTerm, setDrugSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showAddDrug, setShowAddDrug] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log('EditOrderDialog opened with orderItems:', orderItems);
      console.log('Current items before update:', currentItems);
      
      // Reset and initialize items only when dialog opens
      setCurrentItems([...orderItems]);
      setNotes(orderNotes || "");
      
      console.log('Setting currentItems to:', [...orderItems]);
    } else {
      // Clear when dialog closes to prevent stale data
      setCurrentItems([]);
      setNotes("");
      setDrugSearchTerm("");
      setSearchResults([]);
      setShowAddDrug(false);
    }
  }, [isOpen]); // Only depend on isOpen to prevent re-initialization

  // Search for drugs when search term changes
  useEffect(() => {
    if (drugSearchTerm.trim() && showAddDrug) {
      searchDrugs();
    } else {
      setSearchResults([]);
    }
  }, [drugSearchTerm, showAddDrug]);

  const searchDrugs = async () => {
    try {
      setSearchLoading(true);
      
      // Search in all three drug tables
      const [chemicalResults, medicalResults, naturalResults] = await Promise.all([
        supabase
          .from('chemical_drugs')
          .select('id, full_brand_name, irc, package_count, license_owner_company_name, erx_code, gtin')
          .eq('is_active', true)
          .or(`full_brand_name.ilike.%${drugSearchTerm}%,irc.ilike.%${drugSearchTerm}%`)
          .limit(10),
        supabase
          .from('medical_supplies')
          .select('id, title, irc, package_count, license_owner_company_name, erx_code, gtin')
          .eq('is_active', true)
          .or(`title.ilike.%${drugSearchTerm}%,irc.ilike.%${drugSearchTerm}%`)
          .limit(10),
        supabase
          .from('natural_products')
          .select('id, full_en_brand_name, irc, license_owner_name, erx_code, gtin')
          .eq('is_active', true)
          .or(`full_en_brand_name.ilike.%${drugSearchTerm}%,irc.ilike.%${drugSearchTerm}%`)
          .limit(10)
      ]);

      const allResults: Drug[] = [];

      // Add chemical drugs
      if (chemicalResults.data) {
        allResults.push(...chemicalResults.data.map(drug => ({
          id: drug.id,
          name: drug.full_brand_name,
          irc: drug.irc,
          package_count: drug.package_count,
          company_name: drug.license_owner_company_name,
          type: 'chemical' as const,
          erx_code: drug.erx_code,
          gtin: drug.gtin
        })));
      }

      // Add medical supplies
      if (medicalResults.data) {
        allResults.push(...medicalResults.data.map(drug => ({
          id: drug.id,
          name: drug.title,
          irc: drug.irc,
          package_count: drug.package_count,
          company_name: drug.license_owner_company_name,
          type: 'medical' as const,
          erx_code: drug.erx_code,
          gtin: drug.gtin
        })));
      }

      // Add natural products
      if (naturalResults.data) {
        allResults.push(...naturalResults.data.map(drug => ({
          id: drug.id,
          name: drug.full_en_brand_name,
          irc: drug.irc,
          package_count: null,
          company_name: drug.license_owner_name,
          type: 'natural' as const,
          erx_code: drug.erx_code,
          gtin: drug.gtin
        })));
      }

      // Filter out drugs already in the order
      const filteredResults = allResults.filter(drug => 
        !currentItems.some(item => item.drug_id === drug.id)
      );

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching drugs:', error);
      toast.error('خطا در جستجوی داروها');
    } finally {
      setSearchLoading(false);
    }
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    setCurrentItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCurrentItems(prev => prev.filter(item => item.id !== itemId));
  };

  const addDrugToOrder = async (drug: Drug) => {
    try {
      // Create a new order item structure
      const newItem: OrderItem = {
        id: `temp-${Date.now()}`, // Temporary ID
        quantity: 1,
        drug_id: drug.id,
        drug_name: drug.name,
        drug_type: drug.type === 'chemical' ? 'دارو شیمیایی' : 
                  drug.type === 'medical' ? 'تجهیزات پزشکی' : 'محصولات طبیعی',
        drug_company: drug.company_name || undefined,
        drug_irc: drug.irc,
        drug_gtin: drug.gtin,
        drug_erx_code: drug.erx_code
      };

      setCurrentItems(prev => [...prev, newItem]);
      setDrugSearchTerm("");
      setSearchResults([]);
      setShowAddDrug(false);
      
      toast.success(`${drug.name} به سفارش اضافه شد`);
    } catch (error) {
      console.error('Error adding drug to order:', error);
      toast.error('خطا در افزودن دارو');
    }
  };

  const saveOrder = async () => {
    if (currentItems.length === 0) {
      toast.error('سفارش نمی‌تواند خالی باشد');
      return;
    }

    try {
      setSaving(true);
      console.log('Starting save order process...');
      console.log('Current items to save:', currentItems);

      // First, delete ALL existing order items for this order
      console.log('Deleting existing order items for order:', orderId);
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }
      console.log('Successfully deleted existing order items');

      // Then insert new order items
      const itemsToInsert = currentItems.map(item => ({
        order_id: orderId,
        drug_id: item.drug_id,
        quantity: item.quantity
      }));

      console.log('Inserting new items:', itemsToInsert);
      const { error: insertError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
      console.log('Successfully inserted new order items');

      // Update order notes and total items
      const totalItems = currentItems.reduce((sum, item) => sum + item.quantity, 0);
      console.log('Updating order with total items:', totalItems);
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          notes: notes || null,
          total_items: totalItems,
          workflow_status: 'pending', // Reset to pending after edit
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }
      console.log('Successfully updated order');

      toast.success('سفارش با موفقیت به‌روزرسانی شد');
      onOrderUpdated();
      onClose();
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('خطا در ذخیره سفارش');
    } finally {
      setSaving(false);
    }
  };

  const getDrugTypeBadge = (type: string) => {
    const typeMap = {
      'دارو شیمیایی': { label: 'دارو', variant: 'default' as const },
      'تجهیزات پزشکی': { label: 'تجهیزات', variant: 'secondary' as const },
      'محصولات طبیعی': { label: 'طبیعی', variant: 'outline' as const }
    };
    
    const config = typeMap[type as keyof typeof typeMap] || { label: type, variant: 'secondary' as const };
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ویرایش سفارش</DialogTitle>
          <DialogDescription>
            می‌توانید داروها را حذف، اضافه یا تعداد آن‌ها را تغییر دهید
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">آیتم‌های سفارش</h3>
              <Button
                variant="outline"
                onClick={() => setShowAddDrug(!showAddDrug)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                افزودن دارو
              </Button>
            </div>

            {currentItems.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">هیچ آیتمی در سفارش وجود ندارد</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {currentItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{item.drug_name}</h4>
                            {getDrugTypeBadge(item.drug_type)}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            {item.drug_company && (
                              <div>شرکت: {item.drug_company}</div>
                            )}
                            {item.drug_irc && (
                              <div>IRC: {item.drug_irc}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center h-8"
                          />
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Add Drug Section */}
          {showAddDrug && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <h3 className="font-medium">افزودن دارو جدید</h3>
              
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="جستجو در فهرست داروها..."
                  value={drugSearchTerm}
                  onChange={(e) => setDrugSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              {searchLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((drug) => (
                    <Card key={drug.id} className="cursor-pointer hover:bg-muted/50" onClick={() => addDrugToOrder(drug)}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Pill className="h-4 w-4 text-primary" />
                              <span className="font-medium">{drug.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {drug.type === 'chemical' ? 'دارو' : 
                                 drug.type === 'medical' ? 'تجهیزات' : 'طبیعی'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {drug.company_name} • IRC: {drug.irc}
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Order Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">یادداشت سفارش</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="یادداشت اختیاری..."
              rows={3}
            />
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">مجموع آیتم‌ها:</span>
              <span className="text-lg font-bold">
                {currentItems.reduce((sum, item) => sum + item.quantity, 0)} عدد
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            انصراف
          </Button>
          <Button onClick={saveOrder} disabled={saving || currentItems.length === 0}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            ذخیره تغییرات
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog;