import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
  className?: string;
  delay?: number;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  className,
  delay = 0,
}: StatCardProps) => {
  const isPositive = trend !== undefined && trend >= 0;
  
  return (
    <div 
      className={cn("stat-card opacity-0 animate-slide-up", className)}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            isPositive ? "text-chart-1" : "text-destructive"
          )}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
          {trendLabel && (
            <span className="text-sm text-muted-foreground">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};
