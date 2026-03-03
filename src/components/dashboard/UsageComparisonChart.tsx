import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageComparisonChartProps {
  readings: { consumption: number; timestamp: string }[];
  className?: string;
}

type Period = 'daily' | 'weekly' | 'monthly';

export const UsageComparisonChart = ({ readings, className }: UsageComparisonChartProps) => {
  const [period, setPeriod] = useState<Period>('daily');

  const chartData = useMemo(() => {
    if (readings.length === 0) return { data: [], change: 0, currentTotal: 0, previousTotal: 0 };

    const now = new Date();

    if (period === 'daily') {
      // Build hourly buckets for today vs yesterday
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);

      const hours = Array.from({ length: 24 }, (_, i) => {
        const todayReadings = readings.filter(r => {
          const d = new Date(r.timestamp);
          return d >= todayStart && d.getHours() === i;
        });
        const yesterdayReadings = readings.filter(r => {
          const d = new Date(r.timestamp);
          return d >= yesterdayStart && d < todayStart && d.getHours() === i;
        });

        const todaySum = todayReadings.reduce((s, r) => s + Number(r.consumption), 0);
        const yesterdaySum = yesterdayReadings.reduce((s, r) => s + Number(r.consumption), 0);

        return {
          label: `${i}:00`,
          current: Number(todaySum.toFixed(2)),
          previous: Number(yesterdaySum.toFixed(2)),
        };
      });

      const currentTotal = hours.reduce((s, h) => s + h.current, 0);
      const previousTotal = hours.reduce((s, h) => s + h.previous, 0);
      const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

      return { data: hours, change, currentTotal, previousTotal };
    }

    if (period === 'weekly') {
      // Build daily buckets for this week vs last week
      const dayOfWeek = now.getDay();
      const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const days = dayNames.map((name, i) => {
        const thisDay = new Date(thisWeekStart.getTime() + i * 24 * 60 * 60 * 1000);
        const lastDay = new Date(lastWeekStart.getTime() + i * 24 * 60 * 60 * 1000);
        const nextThisDay = new Date(thisDay.getTime() + 24 * 60 * 60 * 1000);
        const nextLastDay = new Date(lastDay.getTime() + 24 * 60 * 60 * 1000);

        const thisWeekReadings = readings.filter(r => {
          const d = new Date(r.timestamp);
          return d >= thisDay && d < nextThisDay;
        });
        const lastWeekReadings = readings.filter(r => {
          const d = new Date(r.timestamp);
          return d >= lastDay && d < nextLastDay;
        });

        return {
          label: name,
          current: Number(thisWeekReadings.reduce((s, r) => s + Number(r.consumption), 0).toFixed(2)),
          previous: Number(lastWeekReadings.reduce((s, r) => s + Number(r.consumption), 0).toFixed(2)),
        };
      });

      const currentTotal = days.reduce((s, d) => s + d.current, 0);
      const previousTotal = days.reduce((s, d) => s + d.previous, 0);
      const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

      return { data: days, change, currentTotal, previousTotal };
    }

    // Monthly: build weekly buckets for this month vs last month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const weeks = Array.from({ length: 4 }, (_, i) => {
      const thisStart = new Date(thisMonthStart.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const thisEnd = new Date(thisStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const lastStart = new Date(lastMonthStart.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const lastEnd = new Date(lastStart.getTime() + 7 * 24 * 60 * 60 * 1000);

      const thisMonthReadings = readings.filter(r => {
        const d = new Date(r.timestamp);
        return d >= thisStart && d < thisEnd;
      });
      const lastMonthReadings = readings.filter(r => {
        const d = new Date(r.timestamp);
        return d >= lastStart && d < lastEnd;
      });

      return {
        label: `Week ${i + 1}`,
        current: Number(thisMonthReadings.reduce((s, r) => s + Number(r.consumption), 0).toFixed(2)),
        previous: Number(lastMonthReadings.reduce((s, r) => s + Number(r.consumption), 0).toFixed(2)),
      };
    });

    const currentTotal = weeks.reduce((s, w) => s + w.current, 0);
    const previousTotal = weeks.reduce((s, w) => s + w.previous, 0);
    const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    return { data: weeks, change, currentTotal, previousTotal };
  }, [readings, period]);

  const periodLabels: Record<Period, { current: string; previous: string }> = {
    daily: { current: 'Today', previous: 'Yesterday' },
    weekly: { current: 'This Week', previous: 'Last Week' },
    monthly: { current: 'This Month', previous: 'Last Month' },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Usage Comparison
            </CardTitle>
            <CardDescription>
              Compare energy consumption across time periods
            </CardDescription>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-[130px] h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
            <p className="text-xs text-muted-foreground">{periodLabels[period].current}</p>
            <p className="text-lg font-bold text-primary">{chartData.currentTotal.toFixed(1)} kWh</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
            <p className="text-xs text-muted-foreground">{periodLabels[period].previous}</p>
            <p className="text-lg font-bold text-foreground">{chartData.previousTotal.toFixed(1)} kWh</p>
          </div>
          <div className="p-3 rounded-lg border border-border text-center">
            <p className="text-xs text-muted-foreground">Change</p>
            <div
              className={cn(
                'flex items-center justify-center gap-1 text-lg font-bold',
                chartData.change > 1
                  ? 'text-destructive'
                  : chartData.change < -1
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-muted-foreground'
              )}
            >
              {chartData.change > 1 ? (
                <ArrowUp className="h-4 w-4" />
              ) : chartData.change < -1 ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
              {Math.abs(chartData.change).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.data} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar
                dataKey="current"
                name={periodLabels[period].current}
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="previous"
                name={periodLabels[period].previous}
                fill="hsl(var(--muted-foreground))"
                opacity={0.4}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insight */}
        <div
          className={cn(
            'p-3 rounded-lg border text-xs',
            chartData.change > 5
              ? 'bg-destructive/10 border-destructive/20 text-destructive'
              : chartData.change < -5
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
              : 'bg-muted/50 border-border text-muted-foreground'
          )}
        >
          {chartData.change > 5 ? (
            <p>
              <TrendingUp className="h-3.5 w-3.5 inline mr-1" />
              Your usage increased by {chartData.change.toFixed(1)}% compared to the previous period.
              Consider reviewing your high-consumption appliances.
            </p>
          ) : chartData.change < -5 ? (
            <p>
              <TrendingDown className="h-3.5 w-3.5 inline mr-1" />
              Great job! Your usage decreased by {Math.abs(chartData.change).toFixed(1)}% compared to the
              previous period. Keep up the energy-saving habits!
            </p>
          ) : (
            <p>
              <Minus className="h-3.5 w-3.5 inline mr-1" />
              Your usage is stable compared to the previous period. Monitoring consistently helps
              identify savings opportunities.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
