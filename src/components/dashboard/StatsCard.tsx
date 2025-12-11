import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'warning' | 'success' | 'primary';
}

const variantStyles = {
  default: 'bg-card',
  warning: 'bg-warning/10 border-warning/20',
  success: 'bg-success/10 border-success/20',
  primary: 'bg-primary/10 border-primary/20',
};

const iconVariantStyles = {
  default: 'bg-muted text-muted-foreground',
  warning: 'bg-warning/20 text-warning',
  success: 'bg-success/20 text-success',
  primary: 'bg-primary/20 text-primary',
};

export function StatsCard({ title, value, subtitle, icon, trend, variant = 'default' }: StatsCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border p-6 transition-all duration-200 hover:shadow-lg animate-fade-in",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "inline-flex items-center text-xs font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          iconVariantStyles[variant]
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
