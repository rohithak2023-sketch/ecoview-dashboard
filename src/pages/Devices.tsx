import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SmartDeviceConnect } from '@/components/dashboard/SmartDeviceConnect';
import { ApplianceTracker } from '@/components/dashboard/ApplianceTracker';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Devices = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate('/auth');
  }, [isLoading, user, navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Smart Devices & Appliances</h1>
          <p className="text-muted-foreground mt-1">
            Connect smart meters and track individual appliance energy consumption
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SmartDeviceConnect />
          <ApplianceTracker />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Devices;
