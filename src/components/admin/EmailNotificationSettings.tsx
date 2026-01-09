import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Bell, AlertTriangle, Users, Loader2 } from 'lucide-react';

export const EmailNotificationSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    email_alerts_enabled: false,
    admin_email: '',
    notify_high_consumption: true,
    notify_new_users: true,
    notify_system_issues: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'email_alerts_enabled',
          'admin_email',
          'notify_high_consumption',
          'notify_new_users',
          'notify_system_issues',
        ]);

      if (!error && data) {
        const settingsMap: Record<string, string> = {};
        data.forEach((s) => {
          settingsMap[s.setting_key] = s.setting_value || '';
        });

        setSettings({
          email_alerts_enabled: settingsMap.email_alerts_enabled === 'true',
          admin_email: settingsMap.admin_email || '',
          notify_high_consumption: settingsMap.notify_high_consumption !== 'false',
          notify_new_users: settingsMap.notify_new_users !== 'false',
          notify_system_issues: settingsMap.notify_system_issues !== 'false',
        });
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const saveSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('admin_settings')
      .upsert(
        { setting_key: key, setting_value: value, updated_at: new Date().toISOString() },
        { onConflict: 'setting_key' }
      );

    if (error) {
      console.error('Error saving setting:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        saveSetting('email_alerts_enabled', String(settings.email_alerts_enabled)),
        saveSetting('admin_email', settings.admin_email),
        saveSetting('notify_high_consumption', String(settings.notify_high_consumption)),
        saveSetting('notify_new_users', String(settings.notify_new_users)),
        saveSetting('notify_system_issues', String(settings.notify_system_issues)),
      ]);

      toast({
        title: 'Settings Saved',
        description: 'Email notification settings updated successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    }
    setSaving(false);
  };

  const handleTestEmail = async () => {
    if (!settings.admin_email) {
      toast({
        title: 'Error',
        description: 'Please enter an admin email address first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-notification-email', {
        body: {
          to: settings.admin_email,
          subject: 'Test Email from Energy Dashboard',
          type: 'test',
          message: 'This is a test email to verify your notification settings are working correctly.',
        },
      });

      if (error) throw error;

      toast({
        title: 'Test Email Sent',
        description: `A test email was sent to ${settings.admin_email}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send test email. Please check your configuration.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Configure email alerts for important system events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <Label htmlFor="email_enabled" className="font-medium">Enable Email Alerts</Label>
              <p className="text-xs text-muted-foreground">Receive email notifications for system events</p>
            </div>
          </div>
          <Switch
            id="email_enabled"
            checked={settings.email_alerts_enabled}
            onCheckedChange={(checked) =>
              setSettings((prev) => ({ ...prev, email_alerts_enabled: checked }))
            }
          />
        </div>

        {/* Admin Email */}
        <div className="space-y-2">
          <Label htmlFor="admin_email">Admin Email Address</Label>
          <Input
            id="admin_email"
            type="email"
            placeholder="admin@example.com"
            value={settings.admin_email}
            onChange={(e) =>
              setSettings((prev) => ({ ...prev, admin_email: e.target.value }))
            }
          />
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Notification Types</Label>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <div>
                <p className="text-sm font-medium">High Consumption Alerts</p>
                <p className="text-xs text-muted-foreground">When users exceed threshold</p>
              </div>
            </div>
            <Switch
              checked={settings.notify_high_consumption}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, notify_high_consumption: checked }))
              }
              disabled={!settings.email_alerts_enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">New User Registrations</p>
                <p className="text-xs text-muted-foreground">When new users sign up</p>
              </div>
            </div>
            <Switch
              checked={settings.notify_new_users}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, notify_new_users: checked }))
              }
              disabled={!settings.email_alerts_enabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">System Issues</p>
                <p className="text-xs text-muted-foreground">When components have problems</p>
              </div>
            </div>
            <Switch
              checked={settings.notify_system_issues}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, notify_system_issues: checked }))
              }
              disabled={!settings.email_alerts_enabled}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
          <Button
            variant="outline"
            onClick={handleTestEmail}
            disabled={!settings.email_alerts_enabled || !settings.admin_email}
          >
            Send Test Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
