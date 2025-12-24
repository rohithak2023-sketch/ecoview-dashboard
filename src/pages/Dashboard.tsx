import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { EnergyChart } from '@/components/dashboard/EnergyChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { 
  generateHourlyData, 
  generateWeeklyData, 
  mockStats, 
  generateRecentReadings 
} from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { useMemo } from 'react';

const Dashboard = () => {
  const { user } = useAuth();
  const hourlyData = useMemo(() => generateHourlyData(), []);
  const weeklyData = useMemo(() => generateWeeklyData(), []);
  const recentReadings = useMemo(() => generateRecentReadings(), []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your energy consumption overview for today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Consumption"
            value={`${mockStats.totalConsumption.toLocaleString()} kWh`}
            subtitle="This month"
            icon={<Zap className="h-6 w-6" />}
            trend={mockStats.trend}
            trendLabel="vs last month"
            delay={0}
          />
          <StatCard
            title="Daily Average"
            value={`${mockStats.dailyAverage} kWh`}
            subtitle="Per day"
            icon={<TrendingUp className="h-6 w-6" />}
            trend={2.8}
            trendLabel="vs last week"
            delay={100}
          />
          <StatCard
            title="Peak Usage"
            value={`${mockStats.peakUsage} kWh`}
            subtitle={`at ${mockStats.peakTime}`}
            icon={<Clock className="h-6 w-6" />}
            delay={200}
          />
          <StatCard
            title="Est. Monthly Cost"
            value={`$${mockStats.costEstimate.toLocaleString()}`}
            subtitle="Based on current usage"
            icon={<DollarSign className="h-6 w-6" />}
            trend={-5.3}
            trendLabel="vs last month"
            delay={300}
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          <EnergyChart
            data={hourlyData}
            type="area"
            dataKey="consumption"
            xAxisKey="hour"
            title="Today's Energy Usage"
            subtitle="Hourly consumption in kWh"
            className="lg:col-span-2 opacity-0 animate-slide-up delay-200"
            height={320}
          />
          <RecentActivity 
            readings={recentReadings} 
            className="opacity-0 animate-slide-up delay-300"
          />
        </div>

        {/* Weekly Chart */}
        <EnergyChart
          data={weeklyData}
          type="bar"
          dataKey="consumption"
          xAxisKey="date"
          title="Weekly Overview"
          subtitle="Daily consumption and peak values"
          className="opacity-0 animate-slide-up delay-400"
          height={280}
          showSecondary
          secondaryKey="peak"
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
