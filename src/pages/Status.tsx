import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LiveIndicator } from '@/components/dashboard/LiveIndicator';
import { useRealtimeStatus } from '@/hooks/useRealtimeStatus';
import { CheckCircle, Clock, Database, Server, Wifi, Activity, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Data Collector': Activity,
  'Analytics Engine': Server,
  'API Gateway': Wifi,
  'Database': Database,
};

const Status = () => {
  const { components, isLoading } = useRealtimeStatus();

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const allOperational = components.every(c => c.status === 'operational');

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="animate-fade-in flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Status</h1>
            <p className="text-muted-foreground mt-1">
              Monitor the health and performance of EcoVigil services in real-time
            </p>
          </div>
          <LiveIndicator />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Overall Status */}
            <div className={cn(
              "eco-card p-6 animate-slide-up",
              allOperational 
                ? "border-chart-1/30 bg-chart-1/5" 
                : "border-accent/30 bg-accent/5"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl",
                  allOperational ? "bg-chart-1/20" : "bg-accent/20"
                )}>
                  <CheckCircle className={cn(
                    "h-7 w-7",
                    allOperational ? "text-chart-1" : "text-accent"
                  )} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {allOperational ? 'All Systems Operational' : 'Some Systems Need Attention'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {formatDate(new Date().toISOString())}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {components.map((item, index) => {
                const Icon = iconMap[item.component_name] || Server;
                return (
                  <div 
                    key={item.id}
                    className="eco-card p-5 opacity-0 animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{item.component_name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {item.data_points.toLocaleString()} data points
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-2 w-2 rounded-full animate-pulse-slow",
                          item.status === 'operational' ? "bg-chart-1" : "bg-accent"
                        )} />
                        <span className={cn(
                          "text-xs font-medium capitalize",
                          item.status === 'operational' ? "text-chart-1" : "text-accent"
                        )}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Uptime: {item.uptime_percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="eco-card p-6 opacity-0 animate-slide-up delay-300">
              <h3 className="text-lg font-semibold text-foreground mb-4">System Metrics</h3>
              
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-3xl font-bold text-foreground">
                    {components.length > 0 
                      ? (components.reduce((sum, c) => sum + c.uptime_percentage, 0) / components.length).toFixed(1)
                      : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Average Uptime</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-3xl font-bold text-foreground">
                    {components.reduce((sum, c) => sum + c.data_points, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Data Points Processed</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-3xl font-bold text-foreground">24/7</p>
                  <p className="text-sm text-muted-foreground mt-1">Monitoring</p>
                </div>
              </div>
            </div>

            {/* Recent Incidents */}
            <div className="eco-card p-6 opacity-0 animate-slide-up delay-400">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Incidents</h3>
              
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <div className="text-center">
                  <CheckCircle className="h-10 w-10 mx-auto mb-3 text-chart-1" />
                  <p className="font-medium">No incidents reported</p>
                  <p className="text-sm">System has been stable for the past 30 days</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Status;
