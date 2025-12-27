import { useEffect, useState } from 'react';
import { EnergyReading } from '@/types';
import { StatCard } from './StatCard';
import { Zap, TrendingUp, Activity, DollarSign } from 'lucide-react';

interface RealtimeStatsProps {
  readings: EnergyReading[];
}

export const RealtimeStats = ({ readings }: RealtimeStatsProps) => {
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    peak: 0,
    cost: 0
  });

  useEffect(() => {
    if (readings.length === 0) return;

    const total = readings.reduce((sum, r) => sum + r.consumption, 0);
    const average = total / readings.length;
    const peak = Math.max(...readings.map(r => r.consumption));
    const cost = readings.reduce((sum, r) => sum + (r.cost || 0), 0);

    setStats({ total, average, peak, cost });
  }, [readings]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Consumption"
        value={`${stats.total.toFixed(1)} kWh`}
        subtitle="Last 20 readings"
        icon={<Zap className="h-6 w-6" />}
        delay={0}
      />
      <StatCard
        title="Average Usage"
        value={`${stats.average.toFixed(2)} kWh`}
        subtitle="Per reading"
        icon={<TrendingUp className="h-6 w-6" />}
        delay={100}
      />
      <StatCard
        title="Peak Usage"
        value={`${stats.peak.toFixed(2)} kWh`}
        subtitle="Maximum recorded"
        icon={<Activity className="h-6 w-6" />}
        delay={200}
      />
      <StatCard
        title="Total Cost"
        value={`$${stats.cost.toFixed(2)}`}
        subtitle="Estimated"
        icon={<DollarSign className="h-6 w-6" />}
        delay={300}
      />
    </div>
  );
};
