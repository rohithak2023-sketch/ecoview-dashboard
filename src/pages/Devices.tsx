import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SmartDeviceConnect } from '@/components/dashboard/SmartDeviceConnect';
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
          <h1 className="text-3xl font-bold text-foreground">Smart Devices</h1>
          <p className="text-muted-foreground mt-1">
            Connect your smart energy meters and appliances to monitor real usage
          </p>
        </div>
        <SmartDeviceConnect />
      </div>
    </DashboardLayout>
  );
};

export default Devices;
