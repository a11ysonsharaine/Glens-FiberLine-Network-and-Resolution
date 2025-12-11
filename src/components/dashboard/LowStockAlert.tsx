import { AlertTriangle } from 'lucide-react';
import { Product } from '@/types/inventory';
import { Link } from 'react-router-dom';

interface LowStockAlertProps {
  products: Product[];
}

export function LowStockAlert({ products }: LowStockAlertProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-success/20">
            <AlertTriangle className="w-5 h-5 text-success" />
          </div>
          <h3 className="font-semibold">Stock Status</h3>
        </div>
        <p className="text-sm text-muted-foreground">All products are well-stocked!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-warning/20">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <h3 className="font-semibold">Low Stock Alert</h3>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-warning/20 text-warning">
          {products.length} items
        </span>
      </div>
      <div className="space-y-3">
        {products.slice(0, 5).map((product) => (
          <div 
            key={product.id}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <div>
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.category}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-warning">{product.quantity} left</p>
              <p className="text-xs text-muted-foreground">Min: {product.minStockLevel}</p>
            </div>
          </div>
        ))}
      </div>
      {products.length > 5 && (
        <Link 
          to="/products?filter=low-stock"
          className="mt-4 block text-center text-sm text-primary hover:underline"
        >
          View all {products.length} low stock items →
        </Link>
      )}
    </div>
  );
}
