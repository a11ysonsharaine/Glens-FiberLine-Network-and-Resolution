import { Product } from '@/types/inventory';
import { cn } from '@/lib/utils';
import { Edit2, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const isLowStock = product.quantity <= product.minStockLevel;
  const isOutOfStock = product.quantity === 0;
  const profit = product.sellingPrice - product.costPrice;
  const profitMargin = ((profit / product.costPrice) * 100).toFixed(0);

  return (
    <div className="group rounded-2xl border bg-card p-5 hover:shadow-lg transition-all duration-200 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-xl",
            isOutOfStock ? "bg-destructive/20" : isLowStock ? "bg-warning/20" : "bg-primary/20"
          )}>
            <Package className={cn(
              "w-5 h-5",
              isOutOfStock ? "text-destructive" : isLowStock ? "text-warning" : "text-primary"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
            <p className="text-xs text-muted-foreground">{product.category}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(product)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(product.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Quantity</p>
          <p className={cn(
            "text-lg font-bold",
            isOutOfStock ? "text-destructive" : isLowStock ? "text-warning" : ""
          )}>
            {product.quantity}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-muted/50">
          <p className="text-xs text-muted-foreground mb-1">Sell Price</p>
          <p className="text-lg font-bold">${product.sellingPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Cost: ${product.costPrice.toFixed(2)}
        </span>
        <Badge variant="secondary" className="text-xs">
          +{profitMargin}% margin
        </Badge>
      </div>

      {isLowStock && !isOutOfStock && (
        <div className="mt-3 p-2 rounded-lg bg-warning/10 border border-warning/20">
          <p className="text-xs text-warning font-medium">⚠️ Low stock - reorder soon</p>
        </div>
      )}

      {isOutOfStock && (
        <div className="mt-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive font-medium">❌ Out of stock</p>
        </div>
      )}
    </div>
  );
}
