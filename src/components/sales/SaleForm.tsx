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
} from '@/components/ui/dialog';

interface SaleFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (sale: { productId: string; productName: string; quantity: number; unitPrice: number; totalAmount: number; customerName?: string }) => void;
  products: Product[];
}

export function SaleForm({ open, onClose, onSave, products }: SaleFormProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const maxQuantity = selectedProduct?.quantity || 0;
  const totalAmount = selectedProduct ? selectedProduct.sellingPrice * quantity : 0;

  const availableProducts = products.filter(p => p.quantity > 0);

  useEffect(() => {
    if (open) {
      setSelectedProductId('');
      setQuantity(1);
      setCustomerName('');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || quantity > maxQuantity) return;

    onSave({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      unitPrice: selectedProduct.sellingPrice,
      totalAmount,
      customerName: customerName || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
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
                  max={maxQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, maxQuantity))}
                  disabled={!selectedProduct}
                  required
                />
                {selectedProduct && (
                  <p className="text-xs text-muted-foreground">Max: {maxQuantity}</p>
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
            <Button type="submit" disabled={!selectedProduct || quantity > maxQuantity}>
              Complete Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
