import { useState, useEffect, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SaleForm } from '@/components/sales/SaleForm';
import { Sale, Product } from '@/types/inventory';
import { getSales, getProducts, addSale, deleteSale } from '@/modules/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, ShoppingCart, Trash2, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);
  const [locallyDeletedIds, setLocallyDeletedIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const s = await getSales();
      const p = await getProducts();
      if (!mounted) return;
      setSales(s);
      setProducts(p);
    })();
    return () => { mounted = false; };
  }, []);

  // Fetch latest products when opening the sale form to avoid stale/empty lists
  const handleOpenForm = async () => {
    const p = await getProducts();
    setProducts(p);
    setFormOpen(true);
  };

  const filteredSales = useMemo(() => {
    return sales.filter(sale =>
      sale.productName.toLowerCase().includes(search.toLowerCase()) ||
      sale.customerName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [sales, search]);
  
  // Exclude sales that were hidden locally due to server-side inconsistencies
  const visibleSales = useMemo(() => filteredSales.filter(s => !locallyDeletedIds.includes(s.id)), [filteredSales, locallyDeletedIds]);

  const handleDeleteSale = async (saleId: string, productName: string, qty: number) => {
    const ok = window.confirm(`Delete sale of ${qty} x ${productName}? This will restore ${qty} units back to inventory.`);
    if (!ok) return;

    // Optimistic UI update: remove sale locally immediately and mark deleting
    const prevSales = sales;
    const prevProducts = products;
    setSales(s => s.filter(sale => sale.id !== saleId));
    setDeletingSaleId(saleId);
    try {
      await deleteSale(saleId);

      // Try to refresh authoritative server state a few times to handle eventual consistency/caching
      let fetched: Sale[] = [];
      let found = true;
      for (let i = 0; i < 3; i++) {
        // small delay between retries
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, 400 * (i + 1)));
        // eslint-disable-next-line no-await-in-loop
        fetched = await getSales();
        found = fetched.some(s => s.id === saleId);
        if (!found) break;
      }

      if (!found) {
        setSales(fetched);
        setProducts(await getProducts());
        toast({ title: 'Sale deleted', description: `Restored ${qty} units to inventory for ${productName}.` });
      } else {
        // Server still returns the sale (possible permission/caching issue).
        // Hide it locally to avoid repeated restores and warn the user.
        setLocallyDeletedIds(ids => Array.from(new Set([...ids, saleId])));
        setProducts(await getProducts());
        toast({ title: 'Sale deleted (local)', description: `Restored ${qty} units to inventory for ${productName}. The sale is still present on the server — refresh the page or check server permissions.`, });
      }
    } catch (err) {
      // rollback UI on error
      console.error('deleteSale error', err);
      setSales(prevSales);
      setProducts(prevProducts);
      toast({ title: 'Delete failed', description: 'Unable to delete sale. See console for details.', variant: 'destructive' });
    } finally {
      setDeletingSaleId(null);
    }
  };

  const handleAddSale = async (saleData: { productId: string; productName: string; quantity: number; unitPrice: number; totalAmount: number; customerName?: string }) => {
    console.debug('handleAddSale: sending', saleData);
    try {
      const result = await addSale(saleData);
      console.debug('handleAddSale: result', result);
      if (result) {
        setSales(await getSales());
        setProducts(await getProducts());
        toast({
          title: 'Sale Recorded',
          description: `Sale of ${saleData.quantity}x ${saleData.productName} for ₱${saleData.totalAmount.toFixed(2)}`,
        });
      } else {
        // If addSale returned null, try refetching after a short delay in case of eventual consistency
        console.warn('addSale returned null; retrying fetch after delay');
        setTimeout(async () => {
          setSales(await getSales());
          setProducts(await getProducts());
        }, 500);
        toast({
          title: 'Sale Recorded',
          description: `Sale may have been recorded (database shows entries). If it doesn't appear refresh the page.`,
        });
      }
    } catch (err) {
      console.error('handleAddSale error', err);
      toast({
        title: 'Sale Failed',
        description: 'Unable to process sale. Check stock availability.',
        variant: 'destructive',
      });
    }
  };

  const todaySales = sales.filter(s => {
    const today = new Date();
    const saleDate = new Date(s.createdAt);
    return saleDate.toDateString() === today.toDateString();
  });

  const todayTotal = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
  const todayTransactions = todaySales.length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-12 lg:pt-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
            <p className="text-muted-foreground">Record and track all sales transactions</p>
          </div>
          <Button onClick={handleOpenForm} className="gap-2">
            <Plus className="w-4 h-4" />
            New Sale
          </Button>
        </div>

        {/* Today's Summary */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/20">
                <ShoppingCart className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold">₱{todayTotal.toFixed(2)}</p>
              </div>
          </div>
          <div className="rounded-2xl border bg-card p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Transactions</p>
              <p className="text-2xl font-bold">{todayTransactions}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sales by product or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sales Table */}
        {filteredSales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No sales found</h3>
            <p className="text-muted-foreground max-w-sm">
              {search
                ? 'Try adjusting your search to find what you\'re looking for.'
                : 'Start recording sales to see them here.'}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleSales.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div>
                        <p className="text-sm">{format(new Date(sale.createdAt), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(sale.createdAt), 'h:mm a')}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{sale.productName}</p>
                    </TableCell>
                    <TableCell>
                      {sale.customerName ? (
                        <span>{sale.customerName}</span>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Walk-in</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{sale.quantity}</TableCell>
                    <TableCell className="text-right">₱{sale.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold text-success">
                      ₱{sale.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right w-24">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSale(sale.id, sale.productName, sale.quantity)}
                          disabled={deletingSaleId === sale.id}
                          aria-busy={deletingSaleId === sale.id}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Sale Form Modal */}
        <SaleForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleAddSale}
          products={products}
        />
      </div>
    </MainLayout>
  );
};

export default Sales;
