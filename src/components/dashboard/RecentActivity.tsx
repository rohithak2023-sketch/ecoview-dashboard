import { EnergyReading } from '@/types';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

interface RecentActivityProps {
  readings: EnergyReading[];
  className?: string;
}

export const RecentActivity = ({ readings, className }: RecentActivityProps) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn("eco-card p-6", className)}>
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Readings</h3>
      
      <div className="space-y-3">
        {readings.slice(0, 6).map((reading, index) => (
          <div 
            key={reading.id}
            className="flex items-center justify-between py-3 border-b border-border last:border-0 opacity-0 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chart-1/10">
                <Zap className="h-4 w-4 text-chart-1" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {reading.consumption} kWh
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTime(reading.timestamp)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                ${reading.cost?.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">cost</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
