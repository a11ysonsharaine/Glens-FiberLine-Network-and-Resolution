import { useState, useEffect } from 'react';
import { Product } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface SaleFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (sale: { productId: string; productName: string; quantity: number; unitPrice: number; totalAmount: number; customerName?: string }) => void;
  products: Product[];
}

export function SaleForm({ open, onClose, onSave, products }: SaleFormProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  // keep quantity as a string so the user can clear the field while typing
  const [quantity, setQuantity] = useState<string>('1');
  const [customerName, setCustomerName] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const maxQuantity = selectedProduct?.quantity || 0;
  const quantityNum = Number.parseInt(quantity || '0', 10) || 0;
  const totalAmount = selectedProduct ? selectedProduct.sellingPrice * quantityNum : 0;

  const availableProducts = products.filter(p => p.quantity > 0);

  useEffect(() => {
    if (open) {
      setSelectedProductId('');
      setQuantity('1');
      setCustomerName('');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = Number.parseInt(quantity || '0', 10);
    if (!selectedProduct || Number.isNaN(v) || v < 1 || v > maxQuantity) return;

    onSave({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: v,
      unitPrice: selectedProduct.sellingPrice,
      totalAmount: selectedProduct.sellingPrice * v,
      customerName: customerName || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
            <DialogTitle>Record New Sale</DialogTitle>
            <DialogDescription>Fill out the form to record a new sales transaction.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="product">Product</Label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{product.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({product.quantity} in stock)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableProducts.length === 0 && (
                <p className="text-xs text-destructive">No products available in stock</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => {
                    // allow empty string so user can delete the current value
                    const val = e.target.value;
                    // avoid leading zeros
                    setQuantity(val.replace(/^0+(?=\d)/, ''));
                  }}
                  onBlur={() => {
                    // clamp on blur to ensure we don't exceed stock
                    if (!selectedProduct) return;
                    const v = Number.parseInt(quantity || '0', 10);
                    if (Number.isNaN(v) || v < 1) setQuantity('1');
                    else if (v > maxQuantity) setQuantity(String(maxQuantity));
                  }}
                  disabled={!selectedProduct}
                  required
                />
                {selectedProduct && (
                  <p className={`text-xs ${quantityNum > maxQuantity ? 'text-destructive' : 'text-muted-foreground'}`}>
                    Max: {maxQuantity}{quantityNum > maxQuantity ? ' — exceeds stock' : ''}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Unit Price (₱)</Label>
                <Input
                  value={selectedProduct ? `₱${selectedProduct.sellingPrice.toFixed(2)}` : '-'}
                  disabled
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customerName">Customer Name (Optional)</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
              />
            </div>

            {selectedProduct && (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">₱{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedProduct || quantityNum < 1 || quantityNum > maxQuantity}>
              Complete Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
