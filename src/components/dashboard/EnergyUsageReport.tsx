import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingDown, TrendingUp, Zap, Award } from 'lucide-react';
import { HomeDevice } from '@/hooks/useHomeDevices';
import { Progress } from '@/components/ui/progress';

interface EnergyUsageReportProps {
  devices: HomeDevice[];
  ratePerKwh: number;
  symbol: string;
}

export const EnergyUsageReport = ({ devices, ratePerKwh, symbol }: EnergyUsageReportProps) => {
  const report = useMemo(() => {
    const active = devices.filter(d => d.is_active);
    const perDevice = active.map(d => {
      const dailyKwh = (Number(d.wattage) * Number(d.hours_per_day)) / 1000;
      const monthlyKwh = dailyKwh * 30;
      const monthlyCost = monthlyKwh * ratePerKwh;
      return { ...d, dailyKwh, monthlyKwh, monthlyCost };
    }).sort((a, b) => b.monthlyKwh - a.monthlyKwh);

    const totalMonthlyKwh = perDevice.reduce((s, d) => s + d.monthlyKwh, 0);
    const totalMonthlyCost = perDevice.reduce((s, d) => s + d.monthlyCost, 0);
    const topConsumer = perDevice[0] || null;

    // Category breakdown
    const categories: Record<string, { kwh: number; cost: number; count: number }> = {};
    perDevice.forEach(d => {
      const cat = getCategoryLabel(d.device_type);
      if (!categories[cat]) categories[cat] = { kwh: 0, cost: 0, count: 0 };
      categories[cat].kwh += d.monthlyKwh;
      categories[cat].cost += d.monthlyCost;
      categories[cat].count += 1;
    });

    const categoryList = Object.entries(categories)
      .map(([name, data]) => ({ name, ...data, percent: totalMonthlyKwh > 0 ? (data.kwh / totalMonthlyKwh) * 100 : 0 }))
      .sort((a, b) => b.kwh - a.kwh);

    // Tips
    const tips: string[] = [];
    perDevice.forEach(d => {
      if (d.device_type === 'ac' && d.hours_per_day > 10) tips.push(`Reduce AC usage from ${d.hours_per_day}h to 8h to save ${symbol}${((d.hours_per_day - 8) * d.wattage / 1000 * ratePerKwh * 30).toFixed(0)}/month`);
      if (d.device_type === 'water_heater' && d.hours_per_day > 1) tips.push('Use a timer for your water heater — 1 hour/day is typically sufficient');
      if (d.wattage > 1000 && d.hours_per_day > 4) tips.push(`${d.name} (${d.wattage}W) runs ${d.hours_per_day}h/day — consider reducing usage`);
    });
    if (perDevice.some(d => d.device_type.includes('light_cfl'))) tips.push('Switch CFL bulbs to LED to save ~60% on lighting energy');

    return { perDevice, totalMonthlyKwh, totalMonthlyCost, topConsumer, categoryList, tips };
  }, [devices, ratePerKwh, symbol]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-primary" />
            Energy Usage Report
          </div>
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
            {report.perDevice.length} active devices
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-[10px] text-muted-foreground">Monthly Usage</p>
            <p className="text-xl font-bold text-foreground">{report.totalMonthlyKwh.toFixed(0)} kWh</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-[10px] text-muted-foreground">Monthly Cost</p>
            <p className="text-xl font-bold text-primary">{symbol}{report.totalMonthlyCost.toFixed(2)}</p>
          </div>
        </div>

        {/* Category Breakdown */}
        {report.categoryList.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">By Category</p>
            {report.categoryList.map(cat => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">{cat.name} ({cat.count})</span>
                  <span className="text-muted-foreground">{cat.kwh.toFixed(0)} kWh • {symbol}{cat.cost.toFixed(2)}</span>
                </div>
                <Progress value={cat.percent} className="h-1.5" />
              </div>
            ))}
          </div>
        )}

        {/* Top Consumers */}
        {report.perDevice.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Top Consumers</p>
            {report.perDevice.slice(0, 5).map((d, i) => (
              <div key={d.id} className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/30">
                <div className="flex items-center gap-2">
                  {i === 0 && <Award className="h-3.5 w-3.5 text-accent" />}
                  <span className="font-medium text-foreground">{d.name}</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0">{d.wattage}W</Badge>
                </div>
                <span className="text-muted-foreground">{d.monthlyKwh.toFixed(1)} kWh • {symbol}{d.monthlyCost.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Energy Saving Tips */}
        {report.tips.length > 0 && (
          <div className="space-y-1.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs font-medium text-primary flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5" />
              Energy Saving Tips
            </p>
            {report.tips.map((tip, i) => (
              <p key={i} className="text-[11px] text-muted-foreground">• {tip}</p>
            ))}
          </div>
        )}

        {report.perDevice.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <Zap className="h-6 w-6 mx-auto mb-2 opacity-50" />
            Add devices to generate your energy report
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function getCategoryLabel(type: string): string {
  if (['laptop', 'laptop_gaming', 'macbook', 'desktop', 'monitor', 'gaming_console'].includes(type)) return 'Computing & Gaming';
  if (['phone'].includes(type)) return 'Mobile Devices';
  if (['refrigerator', 'microwave', 'kettle', 'water_heater'].includes(type)) return 'Kitchen & Heating';
  if (['ac', 'fan'].includes(type)) return 'Climate Control';
  if (['washer', 'iron'].includes(type)) return 'Laundry';
  if (['tv'].includes(type)) return 'Entertainment';
  if (['light_led', 'light_cfl'].includes(type)) return 'Lighting';
  if (['router'].includes(type)) return 'Networking';
  return 'Other';
}
