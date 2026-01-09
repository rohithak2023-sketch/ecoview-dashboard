import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendComparisonWidgetProps {
  readings: { consumption: number; timestamp: string }[];
  className?: string;
}

export const TrendComparisonWidget = ({ readings, className }: TrendComparisonWidgetProps) => {
  const stats = useMemo(() => {
    if (readings.length === 0) return null;

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const todayReadings = readings.filter(r => new Date(r.timestamp) >= oneDayAgo);
    const yesterdayReadings = readings.filter(r => {
      const date = new Date(r.timestamp);
      return date >= twoDaysAgo && date < oneDayAgo;
    });

    const thisWeekReadings = readings.filter(r => new Date(r.timestamp) >= oneWeekAgo);
    const lastWeekReadings = readings.filter(r => {
      const date = new Date(r.timestamp);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    });

    const sum = (arr: { consumption: number }[]) =>
      arr.reduce((s, r) => s + Number(r.consumption), 0);
    const avg = (arr: { consumption: number }[]) =>
      arr.length > 0 ? sum(arr) / arr.length : 0;

    const todayTotal = sum(todayReadings);
    const yesterdayTotal = sum(yesterdayReadings);
    const thisWeekTotal = sum(thisWeekReadings);
    const lastWeekTotal = sum(lastWeekReadings);

    const todayAvg = avg(todayReadings);
    const yesterdayAvg = avg(yesterdayReadings);
    const thisWeekAvg = avg(thisWeekReadings);
    const lastWeekAvg = avg(lastWeekReadings);

    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      today: {
        total: todayTotal,
        avg: todayAvg,
        count: todayReadings.length,
        change: calcChange(todayTotal, yesterdayTotal),
      },
      thisWeek: {
        total: thisWeekTotal,
        avg: thisWeekAvg,
        count: thisWeekReadings.length,
        change: calcChange(thisWeekTotal, lastWeekTotal),
      },
    };
  }, [readings]);

  if (!stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Trend Comparison
          </CardTitle>
          <CardDescription>No data available yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const TrendIndicator = ({ change }: { change: number }) => {
    if (Math.abs(change) < 1) {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
    if (change > 0) {
      return <ArrowUp className="h-4 w-4 text-red-500" />;
    }
    return <ArrowDown className="h-4 w-4 text-green-500" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trend Comparison
        </CardTitle>
        <CardDescription>Compare your usage over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Comparison */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Today vs Yesterday</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.today.total.toFixed(1)} kWh</p>
              <p className="text-xs text-muted-foreground">{stats.today.count} readings</p>
            </div>
            <div className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
              stats.today.change > 1 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
              stats.today.change < -1 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
              "bg-muted text-muted-foreground"
            )}>
              <TrendIndicator change={stats.today.change} />
              {Math.abs(stats.today.change).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Weekly Comparison */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">This Week vs Last Week</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.thisWeek.total.toFixed(1)} kWh</p>
              <p className="text-xs text-muted-foreground">{stats.thisWeek.count} readings</p>
            </div>
            <div className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
              stats.thisWeek.change > 1 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
              stats.thisWeek.change < -1 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
              "bg-muted text-muted-foreground"
            )}>
              <TrendIndicator change={stats.thisWeek.change} />
              {Math.abs(stats.thisWeek.change).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Average Comparison */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-lg font-semibold">{stats.today.avg.toFixed(2)} kWh</p>
            <p className="text-xs text-muted-foreground">Avg Today</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{stats.thisWeek.avg.toFixed(2)} kWh</p>
            <p className="text-xs text-muted-foreground">Avg This Week</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
