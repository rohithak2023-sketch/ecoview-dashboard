import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, BatteryWarning, Zap, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { HomeDevice } from '@/hooks/useHomeDevices';

interface SmartChargingAlertsProps {
  chargingDevices: HomeDevice[];
  currentDrawWatts: number;
  totalDailyKwh: number;
  ratePerKwh: number;
  symbol: string;
}

const ALERTS_KEY = 'smart_charging_alerts';

interface AlertConfig {
  overchargeEnabled: boolean;
  overchargeMinutes: number;
  budgetEnabled: boolean;
  dailyBudget: number;
  highLoadEnabled: boolean;
  highLoadWatts: number;
}

const DEFAULT_CONFIG: AlertConfig = {
  overchargeEnabled: true,
  overchargeMinutes: 120,
  budgetEnabled: true,
  dailyBudget: 5,
  highLoadEnabled: true,
  highLoadWatts: 3000,
};

export const SmartChargingAlerts = ({
  chargingDevices, currentDrawWatts, totalDailyKwh, ratePerKwh, symbol,
}: SmartChargingAlertsProps) => {
  const [config, setConfig] = useState<AlertConfig>(() => {
    try {
      const saved = localStorage.getItem(ALERTS_KEY);
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch { return DEFAULT_CONFIG; }
  });

  const [chargingTimers, setChargingTimers] = useState<Record<string, number>>({});
  const [alerts, setAlerts] = useState<{ id: string; type: string; message: string; time: string }[]>([]);

  useEffect(() => {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(config));
  }, [config]);

  const update = useCallback((key: keyof AlertConfig, val: any) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  }, []);

  // Track charging duration
  useEffect(() => {
    const interval = setInterval(() => {
      setChargingTimers(prev => {
        const next = { ...prev };
        chargingDevices.forEach(d => {
          next[d.id] = (next[d.id] || 0) + 1;
        });
        // Clean devices no longer charging
        Object.keys(next).forEach(id => {
          if (!chargingDevices.find(d => d.id === id)) delete next[id];
        });
        return next;
      });
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, [chargingDevices]);

  // Overcharge alerts
  useEffect(() => {
    if (!config.overchargeEnabled) return;
    chargingDevices.forEach(d => {
      const mins = chargingTimers[d.id] || 0;
      if (mins >= config.overchargeMinutes) {
        const alertId = `overcharge-${d.id}`;
        if (!alerts.find(a => a.id === alertId)) {
          const newAlert = {
            id: alertId,
            type: 'overcharge',
            message: `${d.name} has been charging for ${mins} minutes. Consider unplugging.`,
            time: new Date().toLocaleTimeString(),
          };
          setAlerts(prev => [newAlert, ...prev].slice(0, 10));
          toast({ title: '🔋 Overcharge Warning', description: newAlert.message, variant: 'destructive' });
        }
      }
    });
  }, [chargingTimers, config.overchargeEnabled, config.overchargeMinutes, chargingDevices, alerts]);

  // Budget alerts
  useEffect(() => {
    if (!config.budgetEnabled) return;
    const dailyCost = totalDailyKwh * ratePerKwh;
    if (dailyCost > config.dailyBudget) {
      const alertId = `budget-${new Date().toDateString()}`;
      if (!alerts.find(a => a.id === alertId)) {
        const newAlert = {
          id: alertId,
          type: 'budget',
          message: `Daily energy cost (${symbol}${dailyCost.toFixed(2)}) exceeds budget of ${symbol}${config.dailyBudget.toFixed(2)}`,
          time: new Date().toLocaleTimeString(),
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 10));
        toast({ title: '💰 Budget Alert', description: newAlert.message });
      }
    }
  }, [totalDailyKwh, ratePerKwh, config.budgetEnabled, config.dailyBudget, symbol, alerts]);

  // High load alerts
  useEffect(() => {
    if (!config.highLoadEnabled) return;
    if (currentDrawWatts > config.highLoadWatts) {
      const alertId = `highload-${Math.floor(Date.now() / 300000)}`;
      if (!alerts.find(a => a.id === alertId)) {
        const newAlert = {
          id: alertId,
          type: 'highload',
          message: `Current load (${currentDrawWatts}W) exceeds ${config.highLoadWatts}W limit`,
          time: new Date().toLocaleTimeString(),
        };
        setAlerts(prev => [newAlert, ...prev].slice(0, 10));
        toast({ title: '⚡ High Load Alert', description: newAlert.message, variant: 'destructive' });
      }
    }
  }, [currentDrawWatts, config.highLoadEnabled, config.highLoadWatts, alerts]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5 text-primary" />
            Smart Charging Alerts
          </div>
          <Badge variant="outline" className="text-[10px]">
            {alerts.length} alerts
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overcharge Alert */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <BatteryWarning className="h-4 w-4 text-accent shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">Overcharge Protection</p>
              <p className="text-[10px] text-muted-foreground">Alert after charging too long</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Input
              type="number" min="10" value={config.overchargeMinutes}
              onChange={e => update('overchargeMinutes', Number(e.target.value))}
              className="h-7 w-16 text-xs" disabled={!config.overchargeEnabled}
            />
            <span className="text-[10px] text-muted-foreground">min</span>
            <Switch checked={config.overchargeEnabled} onCheckedChange={v => update('overchargeEnabled', v)} />
          </div>
        </div>

        {/* Budget Alert */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Zap className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">Daily Budget Limit</p>
              <p className="text-[10px] text-muted-foreground">Alert when daily cost exceeds</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-muted-foreground">{symbol}</span>
            <Input
              type="number" min="0" step="0.5" value={config.dailyBudget}
              onChange={e => update('dailyBudget', Number(e.target.value))}
              className="h-7 w-16 text-xs" disabled={!config.budgetEnabled}
            />
            <Switch checked={config.budgetEnabled} onCheckedChange={v => update('budgetEnabled', v)} />
          </div>
        </div>

        {/* High Load Alert */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">High Load Warning</p>
              <p className="text-[10px] text-muted-foreground">Alert when watts exceed</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Input
              type="number" min="500" step="100" value={config.highLoadWatts}
              onChange={e => update('highLoadWatts', Number(e.target.value))}
              className="h-7 w-20 text-xs" disabled={!config.highLoadEnabled}
            />
            <span className="text-[10px] text-muted-foreground">W</span>
            <Switch checked={config.highLoadEnabled} onCheckedChange={v => update('highLoadEnabled', v)} />
          </div>
        </div>

        {/* Recent Alerts Log */}
        {alerts.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground">Recent Alerts</p>
            <div className="max-h-32 overflow-y-auto space-y-1.5">
              {alerts.map(alert => (
                <div key={alert.id} className="flex items-start gap-2 text-[11px] p-1.5 rounded bg-muted/50">
                  {alert.type === 'overcharge' && <BatteryWarning className="h-3 w-3 text-accent shrink-0 mt-0.5" />}
                  {alert.type === 'budget' && <Zap className="h-3 w-3 text-primary shrink-0 mt-0.5" />}
                  {alert.type === 'highload' && <AlertTriangle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <p className="text-foreground">{alert.message}</p>
                    <p className="text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {alerts.length === 0 && (
          <div className="text-center py-2 text-[11px] text-muted-foreground">
            <CheckCircle className="h-4 w-4 mx-auto mb-1 text-primary" />
            All systems normal
          </div>
        )}
      </CardContent>
    </Card>
  );
};
