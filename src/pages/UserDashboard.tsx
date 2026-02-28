import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useRealtimeReadings } from '@/hooks/useRealtimeReadings';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Zap, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { RealtimeStats } from '@/components/dashboard/RealtimeStats';
import { EnergyChart } from '@/components/dashboard/EnergyChart';
import { LiveIndicator } from '@/components/dashboard/LiveIndicator';
import { BillEstimation } from '@/components/dashboard/BillEstimation';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { role, isAdmin, isLoading: roleLoading } = useUserRole();
  const { readings, isLoading: readingsLoading, refresh } = useRealtimeReadings();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    // Redirect admins to admin dashboard
    if (!roleLoading && isAdmin) {
      navigate('/admin');
    }
  }, [authLoading, roleLoading, user, isAdmin, navigate]);

  // Transform readings for chart
  const chartData = readings.slice(-20).map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    consumption: Number(reading.consumption),
  }));

  // Calculate stats
  const totalConsumption = readings.reduce(
    (sum, r) => sum + Number(r.consumption),
    0
  );
  const avgConsumption = readings.length > 0 ? totalConsumption / readings.length : 0;
  const latestReading = readings[readings.length - 1];

  if (authLoading || roleLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              My Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your energy overview.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <LiveIndicator />
            <Button variant="outline" onClick={() => refresh()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Personal Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Usage</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {readingsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {latestReading ? Number(latestReading.consumption).toFixed(2) : '0.00'} kWh
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Usage</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {readingsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{avgConsumption.toFixed(2)} kWh</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Readings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {readingsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{readings.length}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Realtime Stats */}
        <RealtimeStats readings={readings} />

        {/* Energy Chart */}
        {readingsLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>My Energy Usage</CardTitle>
              <CardDescription>Your real-time energy consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ) : chartData.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>My Energy Usage</CardTitle>
              <CardDescription>Your real-time energy consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No readings available yet. Start monitoring to see your data.
              </div>
            </CardContent>
          </Card>
        ) : (
          <EnergyChart 
            data={chartData} 
            dataKey="consumption"
            xAxisKey="time"
            title="My Energy Usage"
            subtitle="Your real-time energy consumption"
          />
        )}

        {/* Bill Estimation */}
        <BillEstimation readings={readings} />

        {/* Tips Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Energy Saving Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Turn off lights and appliances when not in use</li>
              <li>• Use energy-efficient LED bulbs</li>
              <li>• Set your thermostat to optimal temperatures</li>
              <li>• Unplug devices that draw phantom power</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
