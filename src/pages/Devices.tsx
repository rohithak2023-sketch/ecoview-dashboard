import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DeviceManager } from '@/components/dashboard/DeviceManager';
import { HomeCurrentMonitor } from '@/components/dashboard/HomeCurrentMonitor';
import { ChargingStatus } from '@/components/dashboard/ChargingStatus';
import { SmartDeviceConnect } from '@/components/dashboard/SmartDeviceConnect';
import { useHomeDevices } from '@/hooks/useHomeDevices';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Devices = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    isLoading, activeDevices, totalDailyKwh, totalMonthlyKwh,
    chargingDevices, currentDrawWatts,
  } = useHomeDevices();

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user, navigate]);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Home Energy Monitor</h1>
          <p className="text-muted-foreground mt-1">
            Track real-time power draw from your home devices — laptops, appliances, and more
          </p>
        </div>

        {/* Live Current Monitor + Charging Status */}
        <div className="grid gap-6 lg:grid-cols-2">
          <HomeCurrentMonitor
            currentDrawWatts={currentDrawWatts}
            totalDailyKwh={totalDailyKwh}
            totalMonthlyKwh={totalMonthlyKwh}
            activeCount={activeDevices.length}
            chargingCount={chargingDevices.length}
          />
          <ChargingStatus chargingDevices={chargingDevices} />
        </div>

        {/* Device Manager + Smart Device Connect */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DeviceManager />
          <SmartDeviceConnect />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Devices;
