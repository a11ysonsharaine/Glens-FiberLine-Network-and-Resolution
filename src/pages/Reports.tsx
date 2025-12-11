import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { getProducts, getSales } from '@/lib/storage';
import { Product, Sale } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Package, ShoppingCart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const Reports = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    setProducts(getProducts());
    setSales(getSales());
  }, []);

  const exportInventoryCSV = () => {
    const headers = ['Name', 'Category', 'Quantity', 'Cost Price', 'Selling Price', 'Supplier', 'Serial Number', 'Min Stock Level'];
    const rows = products.map(p => [
      p.name,
      p.category,
      p.quantity,
      p.costPrice,
      p.sellingPrice,
      p.supplier,
      p.serialNumber || '',
      p.minStockLevel
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csv, `inventory-report-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
    
    toast({
      title: 'Export Successful',
      description: 'Inventory report has been downloaded.',
    });
  };

  const exportSalesCSV = () => {
    const headers = ['Date', 'Product', 'Customer', 'Quantity', 'Unit Price', 'Total Amount'];
    const rows = sales.map(s => [
      format(new Date(s.createdAt), 'yyyy-MM-dd HH:mm'),
      s.productName,
      s.customerName || 'Walk-in',
      s.quantity,
      s.unitPrice,
      s.totalAmount
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csv, `sales-report-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
    
    toast({
      title: 'Export Successful',
      description: 'Sales report has been downloaded.',
    });
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalInventoryValue = products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);
  const totalRetailValue = products.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0);
  const potentialProfit = totalRetailValue - totalInventoryValue;
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalItemsSold = sales.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="pt-12 lg:pt-0">
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">View summaries and export data</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Inventory Value</CardDescription>
              <CardTitle className="text-2xl">${totalInventoryValue.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Cost value of all items</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Potential Retail Value</CardDescription>
              <CardTitle className="text-2xl">${totalRetailValue.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">If all items sold at selling price</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Potential Profit</CardDescription>
              <CardTitle className="text-2xl text-success">${potentialProfit.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Retail value minus cost</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Sales Revenue</CardDescription>
              <CardTitle className="text-2xl">${totalSalesRevenue.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{totalItemsSold} items sold</p>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Inventory Report</CardTitle>
                  <CardDescription>Export all products with details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Products</p>
                      <p className="font-semibold">{products.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Low Stock Items</p>
                      <p className="font-semibold text-warning">
                        {products.filter(p => p.quantity <= p.minStockLevel).length}
                      </p>
                    </div>
                  </div>
                </div>
                <Button onClick={exportInventoryCSV} className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Export as CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-success/20">
                  <ShoppingCart className="w-6 h-6 text-success" />
                </div>
                <div>
                  <CardTitle>Sales Report</CardTitle>
                  <CardDescription>Export all sales transactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Transactions</p>
                      <p className="font-semibold">{sales.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Items Sold</p>
                      <p className="font-semibold">{totalItemsSold}</p>
                    </div>
                  </div>
                </div>
                <Button onClick={exportSalesCSV} className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Export as CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-muted">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Products by category</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from(new Set(products.map(p => p.category))).map(category => {
                const categoryProducts = products.filter(p => p.category === category);
                const categoryValue = categoryProducts.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0);
                return (
                  <div key={category} className="p-4 rounded-xl bg-muted/50">
                    <p className="font-medium">{category}</p>
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>{categoryProducts.length} products</span>
                      <span>${categoryValue.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Reports;
