import { Sale } from '@/types/inventory';
import { format } from 'date-fns';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentSalesProps {
  sales: Sale[];
}

export function RecentSales({ sales }: RecentSalesProps) {
  if (sales.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/20">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold">Recent Sales</h3>
        </div>
        <p className="text-sm text-muted-foreground">No sales recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold">Recent Sales</h3>
        </div>
        <Link to="/sales" className="text-xs text-primary hover:underline">
          View all →
        </Link>
      </div>
      <div className="space-y-3">
        {sales.slice(0, 5).map((sale) => (
          <div 
            key={sale.id}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <div>
              <p className="text-sm font-medium">{sale.productName}</p>
              <p className="text-xs text-muted-foreground">
                {sale.customerName || 'Walk-in'} · {format(new Date(sale.createdAt), 'MMM d, h:mm a')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-success">${sale.totalAmount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Qty: {sale.quantity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
