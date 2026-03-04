import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BatteryCharging, Battery, BatteryFull, Laptop, Smartphone, Clock, Zap } from 'lucide-react';
import { HomeDevice } from '@/hooks/useHomeDevices';

interface ChargingStatusProps {
  chargingDevices: HomeDevice[];
  ratePerKwh?: number;
}

export const ChargingStatus = ({ chargingDevices, ratePerKwh = 0.12 }: ChargingStatusProps) => {
  const [chargeSimulations, setChargeSimulations] = useState<Record<string, number>>({});

  // Simulate charging progress for visual feedback
  useEffect(() => {
    const interval = setInterval(() => {
      setChargeSimulations(prev => {
        const next = { ...prev };
        chargingDevices.forEach(d => {
          const current = next[d.id] || Math.random() * 60 + 20;
          const increment = (Number(d.wattage) / 100) * 0.3;
          next[d.id] = Math.min(100, current + increment);
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [chargingDevices]);

  if (chargingDevices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Battery className="h-5 w-5 text-muted-foreground" />
            Charging Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground text-sm">
            <Battery className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No devices currently charging</p>
            <p className="text-xs mt-1">Toggle "Charging" on your devices to track charge status</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalChargingWatts = chargingDevices.reduce((sum, d) => sum + Number(d.wattage), 0);
  const chargingCostPerHour = (totalChargingWatts / 1000) * ratePerKwh;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            <BatteryCharging className="h-5 w-5 text-primary animate-pulse" />
            Charging Status
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
            {totalChargingWatts}W total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {chargingDevices.map(device => {
          const chargeLevel = chargeSimulations[device.id] || 50;
          const isAlmostFull = chargeLevel > 90;
          const deviceCostPerHour = (Number(device.wattage) / 1000) * ratePerKwh;
          const DeviceIcon = device.device_type.includes('laptop') ? Laptop :
            device.device_type === 'phone' ? Smartphone : Zap;

          return (
            <div key={device.id} className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DeviceIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{device.name}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {device.wattage}W
                  </Badge>
                </div>
                {isAlmostFull ? (
                  <BatteryFull className="h-4 w-4 text-primary" />
                ) : (
                  <BatteryCharging className="h-4 w-4 text-primary animate-pulse" />
                )}
              </div>
              <Progress value={chargeLevel} className="h-2" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{chargeLevel.toFixed(0)}% charged
                </span>
                <span>${deviceCostPerHour.toFixed(3)}/hr to charge</span>
              </div>
            </div>
          );
        })}

        <div className="p-2 rounded-md bg-accent/10 border border-accent/20 text-xs text-muted-foreground text-center">
          <span className="font-medium text-accent-foreground">
            Charging cost: ${chargingCostPerHour.toFixed(3)}/hour
          </span>
          {' • '}
          <span>${(chargingCostPerHour * 24).toFixed(2)}/day if left plugged in</span>
        </div>
      </CardContent>
    </Card>
  );
};
