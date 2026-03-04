import { useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EnergyChart } from '@/components/dashboard/EnergyChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { RealtimeStats } from '@/components/dashboard/RealtimeStats';
import { LiveIndicator } from '@/components/dashboard/LiveIndicator';
import { BillEstimation } from '@/components/dashboard/BillEstimation';
import { HomeCurrentMonitor } from '@/components/dashboard/HomeCurrentMonitor';
import { UsageComparisonChart } from '@/components/dashboard/UsageComparisonChart';
import { TrendComparisonWidget } from '@/components/dashboard/TrendComparisonWidget';
import { AlertSettings } from '@/components/dashboard/AlertSettings';
import { generateWeeklyData } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeReadings } from '@/hooks/useRealtimeReadings';
import { useHomeDevices } from '@/hooks/useHomeDevices';
import { startEnergySimulator, stopEnergySimulator } from '@/services/energySimulator';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user } = useAuth();
  const { readings, isLoading, isRefreshing, refresh } = useRealtimeReadings();
  const { activeDevices, totalDailyKwh, totalMonthlyKwh, chargingDevices, currentDrawWatts } = useHomeDevices();
  const weeklyData = useMemo(() => generateWeeklyData(), []);

  // Start simulator when dashboard mounts
  useEffect(() => {
    startEnergySimulator();
    return () => stopEnergySimulator();
  }, []);

  // Transform readings for chart
  const chartData = useMemo(() => {
    return readings
      .slice(0, 12)
      .reverse()
      .map(r => ({
        time: new Date(r.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        consumption: r.consumption
      }));
  }, [readings]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your real-time energy consumption overview
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <LiveIndicator />
          </div>
        </div>

        {/* Real-time Stats */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <RealtimeStats readings={readings} />
        )}

        {/* Charts and Alerts Section */}
        <div className="grid gap-6 lg:grid-cols-4">
          <EnergyChart
            data={chartData}
            type="area"
            dataKey="consumption"
            xAxisKey="time"
            title="Live Energy Usage"
            subtitle="Real-time consumption in kWh"
            className="lg:col-span-2 opacity-0 animate-slide-up delay-200"
            height={320}
          />
          <RecentActivity 
            readings={readings} 
            className="opacity-0 animate-slide-up delay-300"
          />
          <AlertSettings 
            readings={readings}
          />
        </div>

        {/* Bill Estimation & Weekly Chart */}
        <div className="grid gap-6 lg:grid-cols-3">
          <BillEstimation readings={readings} />
          <EnergyChart
            data={weeklyData}
            type="bar"
            dataKey="consumption"
            xAxisKey="date"
            title="Weekly Overview"
            subtitle="Daily consumption and peak values"
            className="lg:col-span-2 opacity-0 animate-slide-up delay-400"
            height={280}
            showSecondary
            secondaryKey="peak"
          />
        </div>

        {/* Home Current Monitor */}
        <HomeCurrentMonitor
          currentDrawWatts={currentDrawWatts}
          totalDailyKwh={totalDailyKwh}
          totalMonthlyKwh={totalMonthlyKwh}
          activeCount={activeDevices.length}
          chargingCount={chargingDevices.length}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
