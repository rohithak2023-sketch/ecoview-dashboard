import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Save, RefreshCw, DollarSign, Zap, Bell, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  updated_at: string;
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<Record<string, string>>({
    energy_price_per_kwh: '0.12',
    alert_threshold_kwh: '500',
    email_alerts_enabled: 'false',
    system_name: 'EcoVigil',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (!roleLoading && !isAdmin) {
      navigate('/dashboard');
      toast({
        title: 'Access Denied',
        description: 'You do not have admin privileges.',
        variant: 'destructive',
      });
    }
  }, [authLoading, roleLoading, user, isAdmin, navigate, toast]);

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load settings.',
          variant: 'destructive',
        });
      } else if (data) {
        const settingsMap: Record<string, string> = {};
        data.forEach((s: AdminSetting) => {
          settingsMap[s.setting_key] = s.setting_value || '';
        });
        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
      setLoading(false);
    };

    fetchSettings();
  }, [isAdmin, toast]);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('admin_settings')
          .update({ setting_value: value, updated_at: new Date().toISOString(), updated_by: user?.id })
          .eq('setting_key', key);

        if (error) {
          throw error;
        }
      }

      toast({
        title: 'Settings Saved',
        description: 'All settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    }
    
    setSaving(false);
  };

  if (authLoading || roleLoading || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
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
              <Settings className="h-8 w-8 text-primary" />
              Admin Settings
            </h1>
            <p className="text-muted-foreground">
              Configure system-wide settings and preferences
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                System Information
              </CardTitle>
              <CardDescription>
                Basic system configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system_name">System Name</Label>
                <Input
                  id="system_name"
                  value={settings.system_name}
                  onChange={(e) => setSettings(prev => ({ ...prev, system_name: e.target.value }))}
                  placeholder="Enter system name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Configuration
              </CardTitle>
              <CardDescription>
                Set energy pricing for cost calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="energy_price">Energy Price (per kWh)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="energy_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.energy_price_per_kwh}
                    onChange={(e) => setSettings(prev => ({ ...prev, energy_price_per_kwh: e.target.value }))}
                    className="pl-7"
                    placeholder="0.12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Alert Thresholds
              </CardTitle>
              <CardDescription>
                Configure consumption alert levels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alert_threshold">Alert Threshold (kWh)</Label>
                <Input
                  id="alert_threshold"
                  type="number"
                  min="0"
                  value={settings.alert_threshold_kwh}
                  onChange={(e) => setSettings(prev => ({ ...prev, alert_threshold_kwh: e.target.value }))}
                  placeholder="500"
                />
                <p className="text-xs text-muted-foreground">
                  Users will be alerted when consumption exceeds this value
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure email and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Send email notifications for threshold breaches
                  </p>
                </div>
                <Switch
                  checked={settings.email_alerts_enabled === 'true'}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, email_alerts_enabled: checked ? 'true' : 'false' }))
                  }
                />
              </div>
              {settings.email_alerts_enabled === 'true' && (
                <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                  ⚠️ Email alerts require additional configuration. Contact support to set up email integration.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
