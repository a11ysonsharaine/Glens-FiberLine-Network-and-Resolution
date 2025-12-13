import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { RecentSales } from '@/components/dashboard/RecentSales';
import { getDashboardStats, getLowStockProducts, getSales } from '@/modules/storage';
import { Product, Sale } from '@/types/inventory';
import { Package, AlertTriangle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    todaySales: 0,
    weeklySales: 0,
    monthlySales: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getDashboardStats();
        const low = await getLowStockProducts();
        const recent = (await getSales()).slice(0, 5);
        if (!mounted) return;
        setStats(s as any);
        setLowStockProducts(low);
        setRecentSales(recent);
      } catch (err: any) {
        // Show helpful guidance if permissions prevent reading sales/products
        // Import toast lazily to avoid circular deps
        try {
          const { toast } = await import('@/hooks/use-toast');
          toast({
            title: 'Dashboard data unavailable',
            description: err?.message || 'Unable to load dashboard data. Check database policies or keys.',
            variant: 'destructive',
          });
        } catch (e) {
          // ignore
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="pt-12 lg:pt-0">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your inventory overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Products"
            value={stats.totalProducts}
            subtitle="Items in inventory"
            icon={<Package className="w-5 h-5" />}
            variant="info"
          />
          <StatsCard
            title="Inventory Value"
            value={`₱${stats.totalValue.toLocaleString()}`}
            subtitle="Total cost value"
            icon={
              <span className="text-sm font-semibold">₱</span>
            }
            variant="primary"
          />
          <StatsCard
            title="Low Stock Items"
            value={stats.lowStockItems}
            subtitle="Need reordering"
            icon={<AlertTriangle className="w-5 h-5" />}
            variant={stats.lowStockItems > 0 ? 'warning' : 'default'}
          />
          <StatsCard
            title="Today's Sales"
            value={`₱${stats.todaySales.toFixed(2)}`}
            subtitle={`Weekly: ₱${stats.weeklySales.toFixed(2)}`}
            icon={<TrendingUp className="w-5 h-5" />}
            variant="success"
          />
        </div>

        {/* Sales Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Daily Sales</p>
            <p className="text-3xl font-bold">₱{stats.todaySales.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Weekly Sales</p>
            <p className="text-3xl font-bold">₱{stats.weeklySales.toFixed(2)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-1">Monthly Sales</p>
            <p className="text-3xl font-bold">₱{stats.monthlySales.toFixed(2)}</p>
          </div>
        </div>

        {/* Alerts and Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <LowStockAlert products={lowStockProducts} />
          <RecentSales sales={recentSales} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
