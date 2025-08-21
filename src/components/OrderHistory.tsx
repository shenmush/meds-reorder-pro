import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Calendar, Package, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  drug_id: string;
  quantity: number;
  drugName?: string;
  drugCompany?: string;
  drugType?: string;
  drugDetails?: {
    irc?: string;
    erxCode?: string;
    gtin?: string;
    packageCount?: number;
    action?: string;
    genericCode?: string;
    atcCode?: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  total_items: number;
  status: string;
  notes?: string;
  items?: OrderItem[];
  itemCount?: number;
}

interface OrderHistoryProps {
  pharmacyId: string;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ pharmacyId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [loadingProductDetails, setLoadingProductDetails] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, [pharmacyId]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('pharmacy_id', pharmacyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch item counts for each order
      const ordersWithCounts = await Promise.all((data || []).map(async (order) => {
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('id')
          .eq('order_id', order.id);
        
        if (itemsError) {
          console.error('Error fetching item count:', itemsError);
          return { ...order, itemCount: 0 };
        }
        
        return { ...order, itemCount: itemsData?.length || 0 };
      }));
      
      setOrders(ordersWithCounts);
    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری تاریخچه سفارشات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: string) => {
    setLoadingItems(prev => new Set(prev).add(orderId));
    
    try {
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;

      // Fetch drug details from all three tables
      const drugDetails = await Promise.all((orderItems || []).map(async (item) => {
        // Try to find the drug in each table
        const [chemicalResult, medicalResult, naturalResult] = await Promise.all([
          supabase.from('chemical_drugs').select('full_brand_name, license_owner_company_name').eq('id', item.drug_id).single(),
          supabase.from('medical_supplies').select('title, license_owner_company_name').eq('id', item.drug_id).single(),
          supabase.from('natural_products').select('full_en_brand_name, license_owner_name').eq('id', item.drug_id).single()
        ]);

        let drugName = 'نامشخص';
        let drugCompany = 'نامشخص';
        let drugType = 'نامشخص';

        if (chemicalResult.data) {
          drugName = chemicalResult.data.full_brand_name;
          drugCompany = chemicalResult.data.license_owner_company_name || 'نامشخص';
          drugType = 'شیمیایی';
        } else if (medicalResult.data) {
          drugName = medicalResult.data.title;
          drugCompany = medicalResult.data.license_owner_company_name || 'نامشخص';
          drugType = 'ملزومات پزشکی';
        } else if (naturalResult.data) {
          drugName = naturalResult.data.full_en_brand_name;
          drugCompany = naturalResult.data.license_owner_name || 'نامشخص';
          drugType = 'طبیعی';
        }

        return {
          ...item,
          drugName,
          drugCompany,
          drugType
        };
      }));

      // Update the order with items
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, items: drugDetails }
          : order
      ));

    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری جزئیات سفارش",
        variant: "destructive",
      });
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const fetchProductDetails = async (drugId: string, drugType: string) => {
    setLoadingProductDetails(prev => new Set(prev).add(drugId));
    
    try {
      let productDetails = {};
      
      if (drugType === 'شیمیایی') {
        const { data, error } = await supabase
          .from('chemical_drugs')
          .select('irc, erx_code, gtin, package_count, action, generic_code')
          .eq('id', drugId)
          .single();
        
        if (!error && data) {
          productDetails = {
            irc: data.irc,
            erxCode: data.erx_code,
            gtin: data.gtin,
            packageCount: data.package_count,
            action: data.action,
            genericCode: data.generic_code
          };
        }
      } else if (drugType === 'ملزومات پزشکی') {
        const { data, error } = await supabase
          .from('medical_supplies')
          .select('irc, erx_code, gtin, package_count, action')
          .eq('id', drugId)
          .single();
        
        if (!error && data) {
          productDetails = {
            irc: data.irc,
            erxCode: data.erx_code,
            gtin: data.gtin,
            packageCount: data.package_count,
            action: data.action
          };
        }
      } else if (drugType === 'طبیعی') {
        const { data, error } = await supabase
          .from('natural_products')
          .select('irc, erx_code, gtin, package_count, action, atc_code')
          .eq('id', drugId)
          .single();
        
        if (!error && data) {
          productDetails = {
            irc: data.irc,
            erxCode: data.erx_code,
            gtin: data.gtin,
            packageCount: data.package_count,
            action: data.action,
            atcCode: data.atc_code
          };
        }
      }

      // Update the product with detailed information
      setOrders(prev => prev.map(order => ({
        ...order,
        items: order.items?.map(item => 
          item.drug_id === drugId 
            ? { ...item, drugDetails: productDetails }
            : item
        )
      })));

    } catch (error) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری جزئیات محصول",
        variant: "destructive",
      });
    } finally {
      setLoadingProductDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(drugId);
        return newSet;
      });
    }
  };

  const toggleProductExpanded = async (drugId: string, drugType: string) => {
    const newExpanded = new Set(expandedProducts);
    
    if (expandedProducts.has(drugId)) {
      newExpanded.delete(drugId);
    } else {
      newExpanded.add(drugId);
      
      // Fetch product details if not already loaded
      const allItems = orders.flatMap(order => order.items || []);
      const product = allItems.find(item => item.drug_id === drugId);
      if (product && !product.drugDetails) {
        await fetchProductDetails(drugId, drugType);
      }
    }
    
    setExpandedProducts(newExpanded);
  };

  const toggleOrderExpanded = async (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    
    if (expandedOrders.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
      
      // Fetch items if not already loaded
      const order = orders.find(o => o.id === orderId);
      if (order && !order.items) {
        await fetchOrderItems(orderId);
      }
    }
    
    setExpandedOrders(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'در انتظار', variant: 'default' as const },
      'confirmed': { label: 'تایید شده', variant: 'secondary' as const },
      'shipped': { label: 'ارسال شده', variant: 'outline' as const },
      'delivered': { label: 'تحویل داده شده', variant: 'default' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'default' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <ShoppingCart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">در حال بارگذاری تاریخچه سفارشات...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          تاریخچه سفارشات
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">هنوز سفارشی ثبت نکرده‌اید</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">تاریخ سفارش</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">تعداد محصولات</TableHead>
                <TableHead className="text-right">مجموع اقلام</TableHead>
                <TableHead className="text-right">جزئیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <TableRow className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="text-right">
                      {formatDate(order.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {order.itemCount !== undefined ? order.itemCount : '-'} نوع
                    </TableCell>
                    <TableCell className="text-right">
                      {order.total_items} عدد
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleOrderExpanded(order.id)}
                        disabled={loadingItems.has(order.id)}
                        className="gap-2"
                      >
                        {loadingItems.has(order.id) ? (
                          'در حال بارگذاری...'
                        ) : expandedOrders.has(order.id) ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            بستن
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            مشاهده
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  
                  {expandedOrders.has(order.id) && order.items && (
                    <TableRow>
                      <TableCell colSpan={5} className="p-0">
                        <div className="bg-muted/30 p-4">
                          <h4 className="font-medium text-right mb-3">جزئیات سفارش</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-right">نام محصول</TableHead>
                                <TableHead className="text-right">شرکت</TableHead>
                                <TableHead className="text-right">نوع</TableHead>
                                <TableHead className="text-right">تعداد</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {order.items.map((item) => (
                                <React.Fragment key={item.id}>
                                  <TableRow 
                                    className="cursor-pointer hover:bg-muted/20"
                                    onClick={() => toggleProductExpanded(item.drug_id, item.drugType || '')}
                                  >
                                    <TableCell className="text-right font-medium">
                                      <div className="flex items-center justify-between">
                                        <span>{item.drugName}</span>
                                        <div className="flex items-center gap-2">
                                          {loadingProductDetails.has(item.drug_id) ? (
                                            <span className="text-xs text-muted-foreground">در حال بارگذاری...</span>
                                          ) : expandedProducts.has(item.drug_id) ? (
                                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                          ) : (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {item.drugCompany}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Badge variant="secondary" className="text-xs">
                                        {item.drugType}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {item.quantity} عدد
                                    </TableCell>
                                  </TableRow>
                                  
                                  {expandedProducts.has(item.drug_id) && item.drugDetails && (
                                    <TableRow>
                                      <TableCell colSpan={4} className="p-0">
                                        <div className="bg-muted/20 p-3 border-t">
                                          <h5 className="font-medium text-sm text-right mb-2">مشخصات تکمیلی محصول</h5>
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                            {item.drugDetails.irc && (
                                              <div className="text-right">
                                                <span className="font-medium">کد IRC:</span>
                                                <div className="font-mono">{item.drugDetails.irc}</div>
                                              </div>
                                            )}
                                            {item.drugDetails.erxCode && (
                                              <div className="text-right">
                                                <span className="font-medium">کد ERX:</span>
                                                <div className="font-mono">{item.drugDetails.erxCode}</div>
                                              </div>
                                            )}
                                            {item.drugDetails.gtin && (
                                              <div className="text-right">
                                                <span className="font-medium">کد GTIN:</span>
                                                <div className="font-mono">{item.drugDetails.gtin}</div>
                                              </div>
                                            )}
                                            {item.drugDetails.packageCount && (
                                              <div className="text-right">
                                                <span className="font-medium">تعداد بسته:</span>
                                                <div>{item.drugDetails.packageCount}</div>
                                              </div>
                                            )}
                                            {item.drugDetails.genericCode && (
                                              <div className="text-right">
                                                <span className="font-medium">کد ژنریک:</span>
                                                <div className="font-mono">{item.drugDetails.genericCode}</div>
                                              </div>
                                            )}
                                            {item.drugDetails.atcCode && (
                                              <div className="text-right">
                                                <span className="font-medium">کد ATC:</span>
                                                <div className="font-mono">{item.drugDetails.atcCode}</div>
                                              </div>
                                            )}
                                            {item.drugDetails.action && (
                                              <div className="text-right md:col-span-2">
                                                <span className="font-medium">اثر دارویی:</span>
                                                <div>{item.drugDetails.action}</div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </React.Fragment>
                              ))}
                            </TableBody>
                          </Table>
                          {order.notes && (
                            <div className="mt-3 p-3 bg-background rounded-md">
                              <p className="text-sm text-right">
                                <strong>یادداشت:</strong> {order.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;