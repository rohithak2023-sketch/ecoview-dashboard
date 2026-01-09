import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Bell, UserPlus, Zap, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'new_user' | 'high_consumption' | 'system_alert' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export const AdminNotificationsWidget = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);

      // Fetch recent profiles (new user signups)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch high consumption readings (above threshold)
      const { data: settings } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .eq('setting_key', 'alert_threshold_kwh')
        .single();

      const threshold = settings?.setting_value ? parseFloat(settings.setting_value) : 100;

      const { data: highReadings } = await supabase
        .from('energy_readings')
        .select('*')
        .gt('consumption', threshold)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch system status issues
      const { data: statusIssues } = await supabase
        .from('system_status')
        .select('*')
        .neq('status', 'operational')
        .limit(3);

      const allNotifications: Notification[] = [];

      // Add new user notifications
      profiles?.forEach((p) => {
        allNotifications.push({
          id: `user-${p.id}`,
          type: 'new_user',
          title: 'New User Registered',
          message: `${p.full_name || p.email || 'A new user'} joined the platform`,
          timestamp: new Date(p.created_at),
          read: false,
        });
      });

      // Add high consumption alerts
      highReadings?.forEach((r) => {
        allNotifications.push({
          id: `consumption-${r.id}`,
          type: 'high_consumption',
          title: 'High Consumption Alert',
          message: `User consumed ${r.consumption.toFixed(1)} kWh (threshold: ${threshold} kWh)`,
          timestamp: new Date(r.created_at),
          read: false,
        });
      });

      // Add system alerts
      statusIssues?.forEach((s) => {
        allNotifications.push({
          id: `system-${s.id}`,
          type: 'system_alert',
          title: `${s.component_name} Issue`,
          message: `Status: ${s.status} - Last update: ${format(new Date(s.last_update), 'PPp')}`,
          timestamp: new Date(s.last_update),
          read: false,
        });
      });

      // Sort by timestamp descending
      allNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setNotifications(allNotifications.slice(0, 10));
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_user':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'high_consumption':
        return <Zap className="h-4 w-4 text-amber-500" />;
      case 'system_alert':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBadgeVariant = (type: Notification['type']) => {
    switch (type) {
      case 'new_user':
        return 'default';
      case 'high_consumption':
        return 'secondary';
      case 'system_alert':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Notifications</CardTitle>
            {notifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notifications.length}
              </Badge>
            )}
          </div>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs">
              Clear All
            </Button>
          )}
        </div>
        <CardDescription>Recent system activity and alerts</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CheckCircle className="h-10 w-10 mb-2 text-green-500" />
            <p className="text-sm">All caught up!</p>
            <p className="text-xs">No new notifications</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{notification.title}</p>
                      <Badge variant={getBadgeVariant(notification.type)} className="text-xs shrink-0">
                        {notification.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
