import { useState, useEffect } from 'react';
import { Product, Category, CATEGORIES } from '@/types/inventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// using native datalist for editable category input
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  product?: Product | null;
}

export function ProductForm({ open, onClose, onSave, product }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '' as Category,
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    supplier: '',
    serialNumber: '',
    minStockLevel: 5,
  });

  const [categories, setCategories] = useState<Category[]>(() => [...CATEGORIES]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        supplier: product.supplier || '',
        serialNumber: product.serialNumber || '',
        minStockLevel: product.minStockLevel,
      });
    } else {
      setFormData({
        name: '',
        category: '',
        quantity: 0,
        costPrice: 0,
        sellingPrice: 0,
        supplier: '',
        serialNumber: '',
        minStockLevel: 5,
      });
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      serialNumber: formData.serialNumber || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    list="category-list"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    onBlur={(e) => {
                      const val = (e.currentTarget.value || '').trim();
                      if (val && !categories.includes(val)) {
                        setCategories((prev) => {
                          const next = [...prev, val];
                          try {
                            // also update exported CATEGORIES in-memory so other components see it
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (CATEGORIES as any).push(val);
                          } catch (err) {
                            // ignore if not writable
                          }
                          return next;
                        });
                      }
                    }}
                    placeholder="Type or choose category"
                    required
                  />
                  <datalist id="category-list">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={String(formData.quantity)}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value || '0', 10) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="costPrice">Cost Price (₱)</Label>
                <Input
                  id="costPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={String(formData.costPrice)}
                  onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value || '0') || 0 })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sellingPrice">Selling Price (₱)</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={String(formData.sellingPrice)}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value || '0') || 0 })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Supplier name (optional)"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="minStockLevel">Min Stock Level</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  min="0"
                  value={String(formData.minStockLevel)}
                  onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value || '0', 10) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="serialNumber">Serial Number (Optional)</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="Enter serial number"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {product ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
