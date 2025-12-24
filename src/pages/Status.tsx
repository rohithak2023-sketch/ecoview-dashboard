import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockSystemStatus } from '@/lib/mockData';
import { CheckCircle, Clock, Database, Server, Wifi, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const Status = () => {
  const statusItems = [
    {
      name: 'API Server',
      status: 'operational',
      icon: Server,
      description: 'All endpoints responding normally',
      latency: '45ms',
    },
    {
      name: 'Database',
      status: 'operational',
      icon: Database,
      description: 'PostgreSQL cluster healthy',
      latency: '12ms',
    },
    {
      name: 'Data Ingestion',
      status: 'operational',
      icon: Activity,
      description: 'Processing readings in real-time',
      latency: '120ms',
    },
    {
      name: 'Network',
      status: 'operational',
      icon: Wifi,
      description: 'All regions connected',
      latency: '28ms',
    },
  ];

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">System Status</h1>
          <p className="text-muted-foreground mt-1">
            Monitor the health and performance of EcoVigil services
          </p>
        </div>

        {/* Overall Status */}
        <div className={cn(
          "eco-card p-6 animate-slide-up",
          mockSystemStatus.status === 'healthy' 
            ? "border-chart-1/30 bg-chart-1/5" 
            : "border-accent/30 bg-accent/5"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl",
              mockSystemStatus.status === 'healthy' ? "bg-chart-1/20" : "bg-accent/20"
            )}>
              <CheckCircle className={cn(
                "h-7 w-7",
                mockSystemStatus.status === 'healthy' ? "text-chart-1" : "text-accent"
              )} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                All Systems Operational
              </h2>
              <p className="text-sm text-muted-foreground">
                Last updated: {formatDate(mockSystemStatus.lastUpdate)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {statusItems.map((item, index) => (
            <div 
              key={item.name}
              className="eco-card p-5 opacity-0 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <item.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-chart-1 animate-pulse-slow" />
                  <span className="text-xs font-medium text-chart-1 capitalize">
                    {item.status}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Response time: {item.latency}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="eco-card p-6 opacity-0 animate-slide-up delay-300">
          <h3 className="text-lg font-semibold text-foreground mb-4">System Metrics</h3>
          
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-3xl font-bold text-foreground">{mockSystemStatus.uptime}</p>
              <p className="text-sm text-muted-foreground mt-1">Uptime</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/50">
              <p className="text-3xl font-bold text-foreground">
                {mockSystemStatus.dataPoints.toLocaleString()}
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
      </div>
    </DashboardLayout>
  );
};

export default Status;
