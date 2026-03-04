import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Activity, BatteryCharging, Gauge, TrendingDown, Clock } from 'lucide-react';

interface HomeCurrentMonitorProps {
  currentDrawWatts: number;
  totalDailyKwh: number;
  totalMonthlyKwh: number;
  activeCount: number;
  chargingCount: number;
  ratePerKwh?: number;
}

export const HomeCurrentMonitor = ({
  currentDrawWatts,
  totalDailyKwh,
  totalMonthlyKwh,
  activeCount,
  chargingCount,
  ratePerKwh = 0.12,
}: HomeCurrentMonitorProps) => {
  const [liveWatts, setLiveWatts] = useState(currentDrawWatts);
  const [amps, setAmps] = useState(0);

  // Simulate live fluctuation around actual wattage
  useEffect(() => {
    const interval = setInterval(() => {
      const fluctuation = (Math.random() - 0.5) * currentDrawWatts * 0.05;
      const newWatts = Math.max(0, currentDrawWatts + fluctuation);
      setLiveWatts(newWatts);
      setAmps(newWatts / 220); // 220V standard
    }, 2000);
    return () => clearInterval(interval);
  }, [currentDrawWatts]);

  const maxCapacity = 5000; // 5kW typical home circuit
  const loadPercent = Math.min((liveWatts / maxCapacity) * 100, 100);
  const loadColor = loadPercent > 80 ? 'text-destructive' : loadPercent > 50 ? 'text-accent' : 'text-primary';
  const monthlyCost = totalMonthlyKwh * ratePerKwh;

  return (
    <Card className="eco-card-elevated overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Activity className="h-5 w-5 text-primary" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-primary rounded-full animate-pulse" />
            </div>
            <span>Home Current Monitor</span>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-1">
            <Activity className="h-3 w-3" />
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Main Power Display */}
        <div className="text-center p-6 rounded-xl bg-muted/50 border border-border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="relative">
            <Gauge className={`h-8 w-8 mx-auto mb-2 ${loadColor}`} />
            <p className="text-5xl font-bold tracking-tight text-foreground">
              {liveWatts.toFixed(0)}
              <span className="text-lg font-normal text-muted-foreground ml-1">W</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">Current Power Draw</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-xs text-muted-foreground">
                {amps.toFixed(1)}A @ 220V
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {(liveWatts / 1000).toFixed(2)} kW
              </span>
            </div>
          </div>
        </div>

        {/* Load Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Circuit Load</span>
            <span className={`font-medium ${loadColor}`}>{loadPercent.toFixed(0)}%</span>
          </div>
          <Progress value={loadPercent} className="h-2.5" />
          <p className="text-[10px] text-muted-foreground text-right">
            of {(maxCapacity / 1000).toFixed(0)} kW max capacity
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              Daily Usage
            </div>
            <p className="text-lg font-bold text-foreground">{totalDailyKwh.toFixed(1)} kWh</p>
            <p className="text-[10px] text-muted-foreground">${(totalDailyKwh * ratePerKwh).toFixed(2)}/day</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Monthly Est.
            </div>
            <p className="text-lg font-bold text-foreground">{totalMonthlyKwh.toFixed(0)} kWh</p>
            <p className="text-[10px] text-muted-foreground">${monthlyCost.toFixed(2)}/month</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3" />
              Active Devices
            </div>
            <p className="text-lg font-bold text-foreground">{activeCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BatteryCharging className="h-3 w-3" />
              Charging Now
            </div>
            <p className="text-lg font-bold text-primary">{chargingCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
