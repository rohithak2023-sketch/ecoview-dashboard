import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  className?: string;
}

export const LiveIndicator = ({ className }: LiveIndicatorProps) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-1 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-chart-1"></span>
      </span>
      <span className="text-xs font-medium text-chart-1 uppercase tracking-wide">Live</span>
    </div>
  );
};
