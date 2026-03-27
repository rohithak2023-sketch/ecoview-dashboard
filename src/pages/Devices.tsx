import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DeviceManager } from '@/components/dashboard/DeviceManager';
import { HomeCurrentMonitor } from '@/components/dashboard/HomeCurrentMonitor';
import { ChargingStatus } from '@/components/dashboard/ChargingStatus';
import { SmartDeviceConnect } from '@/components/dashboard/SmartDeviceConnect';
import { RegionalRates, useElectricityRate } from '@/components/dashboard/RegionalRates';
import { SmartChargingAlerts } from '@/components/dashboard/SmartChargingAlerts';
import { EnergyUsageReport } from '@/components/dashboard/EnergyUsageReport';
import { useHomeDevices } from '@/hooks/useHomeDevices';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const Devices = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    devices, isLoading, activeDevices, totalDailyKwh, totalMonthlyKwh,
    chargingDevices, currentDrawWatts,
  } = useHomeDevices();

  const {
    regionId, setRegionId, customRate, setCustomRate,
    customSymbol, setCustomSymbol, ratePerKwh, symbol,
  } = useElectricityRate();

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
            ratePerKwh={ratePerKwh}
          />
          <ChargingStatus chargingDevices={chargingDevices} ratePerKwh={ratePerKwh} />
        </div>

        {/* Regional Rates + Smart Charging Alerts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RegionalRates
            regionId={regionId}
            onRegionChange={setRegionId}
            customRate={customRate}
            onCustomRateChange={setCustomRate}
            customSymbol={customSymbol}
            onCustomSymbolChange={setCustomSymbol}
          />
          <SmartChargingAlerts
            chargingDevices={chargingDevices}
            currentDrawWatts={currentDrawWatts}
            totalDailyKwh={totalDailyKwh}
            ratePerKwh={ratePerKwh}
            symbol={symbol}
          />
        </div>

        {/* Energy Usage Report */}
        <EnergyUsageReport devices={devices} ratePerKwh={ratePerKwh} symbol={symbol} />

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
