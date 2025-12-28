import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { EnergyReading } from '@/types';

interface AlertSettingsProps {
  readings: EnergyReading[];
}

const ALERT_THRESHOLD_KEY = 'energy_alert_threshold';
const ALERT_ENABLED_KEY = 'energy_alert_enabled';

export const AlertSettings = ({ readings }: AlertSettingsProps) => {
  const [threshold, setThreshold] = useState(() => {
    const saved = localStorage.getItem(ALERT_THRESHOLD_KEY);
    return saved ? parseFloat(saved) : 5.0;
  });
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem(ALERT_ENABLED_KEY);
    return saved === 'true';
  });
  const [lastAlertId, setLastAlertId] = useState<string | null>(null);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(ALERT_THRESHOLD_KEY, threshold.toString());
    localStorage.setItem(ALERT_ENABLED_KEY, enabled.toString());
  }, [threshold, enabled]);

  // Check for threshold exceedance
  useEffect(() => {
    if (!enabled || readings.length === 0) return;

    const latestReading = readings[0];
    if (latestReading.id === lastAlertId) return;

    if (latestReading.consumption > threshold) {
      setLastAlertId(latestReading.id);
      toast({
        title: "⚠️ High Energy Usage Alert",
        description: `Current consumption (${latestReading.consumption.toFixed(2)} kWh) exceeds your threshold of ${threshold} kWh`,
        variant: "destructive",
      });
    }
  }, [readings, threshold, enabled, lastAlertId]);

  const currentUsage = readings[0]?.consumption || 0;
  const isAboveThreshold = enabled && currentUsage > threshold;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-primary" />
          Usage Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="alert-enabled" className="text-sm text-muted-foreground">
            Enable Alerts
          </Label>
          <Switch
            id="alert-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="threshold" className="text-sm text-muted-foreground">
            Threshold (kWh)
          </Label>
          <Input
            id="threshold"
            type="number"
            step="0.1"
            min="0"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value) || 0)}
            disabled={!enabled}
            className="bg-background/50"
          />
        </div>

        {isAboveThreshold && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 text-destructive text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Usage exceeds threshold!</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Current: {currentUsage.toFixed(2)} kWh
        </div>
      </CardContent>
    </Card>
  );
};
