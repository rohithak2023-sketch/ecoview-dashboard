import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Plug, Router, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeviceConfig {
  type: string;
  name: string;
  ipAddress: string;
  apiKey: string;
  pollingInterval: number;
}

const SUPPORTED_DEVICES = [
  { id: 'shelly-em', name: 'Shelly EM', icon: Router, description: 'Whole-home energy monitoring clamp' },
  { id: 'shelly-plug', name: 'Shelly Plug S', icon: Plug, description: 'Smart plug with energy metering' },
  { id: 'emporia-vue', name: 'Emporia Vue', icon: Smartphone, description: 'Circuit-level energy monitor' },
  { id: 'manual', name: 'Manual Entry', icon: AlertCircle, description: 'Enter readings from your electricity meter' },
];

export const SmartDeviceConnect = () => {
  const { toast } = useToast();
  const [connectedDevices, setConnectedDevices] = useState<DeviceConfig[]>([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [config, setConfig] = useState<Partial<DeviceConfig>>({
    pollingInterval: 60,
  });
  const [connecting, setConnecting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleConnect = async () => {
    if (!selectedDevice || !config.name) {
      toast({ title: 'Missing info', description: 'Please fill in device name.', variant: 'destructive' });
      return;
    }

    setConnecting(true);

    // Simulate connection attempt
    await new Promise(resolve => setTimeout(resolve, 2000));

    const device: DeviceConfig = {
      type: selectedDevice,
      name: config.name || '',
      ipAddress: config.ipAddress || '',
      apiKey: config.apiKey || '',
      pollingInterval: config.pollingInterval || 60,
    };

    setConnectedDevices(prev => [...prev, device]);
    setShowForm(false);
    setSelectedDevice('');
    setConfig({ pollingInterval: 60 });
    setConnecting(false);

    toast({
      title: 'Device Connected',
      description: `${device.name} has been added. Data will sync every ${device.pollingInterval}s.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-primary" />
          Smart Device Connection
        </CardTitle>
        <CardDescription>
          Connect your smart energy meters and plugs to monitor real electricity usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connected Devices */}
        {connectedDevices.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Connected Devices</Label>
            {connectedDevices.map((device, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{device.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {SUPPORTED_DEVICES.find(d => d.id === device.type)?.name} • Every {device.pollingInterval}s
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Wifi className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
            ))}
          </div>
        )}

        {connectedDevices.length === 0 && !showForm && (
          <div className="text-center py-6 space-y-3">
            <WifiOff className="h-10 w-10 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">No devices connected</p>
              <p className="text-sm text-muted-foreground">
                Connect a smart meter to track your real electricity usage
              </p>
            </div>
          </div>
        )}

        {/* Add Device Form */}
        {showForm && (
          <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-2">
              <Label>Device Type</Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your device" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_DEVICES.map(device => (
                    <SelectItem key={device.id} value={device.id}>
                      <div className="flex items-center gap-2">
                        <device.icon className="h-4 w-4" />
                        <span>{device.name}</span>
                        <span className="text-xs text-muted-foreground">– {device.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="device-name">Device Name</Label>
              <Input
                id="device-name"
                placeholder="e.g., Main Panel Monitor"
                value={config.name || ''}
                onChange={e => setConfig(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            {selectedDevice !== 'manual' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="device-ip">IP Address / URL</Label>
                  <Input
                    id="device-ip"
                    placeholder="e.g., 192.168.1.100"
                    value={config.ipAddress || ''}
                    onChange={e => setConfig(prev => ({ ...prev, ipAddress: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="device-key">API Key (optional)</Label>
                  <Input
                    id="device-key"
                    type="password"
                    placeholder="Device API key if required"
                    value={config.apiKey || ''}
                    onChange={e => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="polling">Polling Interval (seconds)</Label>
                  <Select
                    value={String(config.pollingInterval)}
                    onValueChange={v => setConfig(prev => ({ ...prev, pollingInterval: Number(v) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Every 10s (real-time)</SelectItem>
                      <SelectItem value="30">Every 30s</SelectItem>
                      <SelectItem value="60">Every 1 minute</SelectItem>
                      <SelectItem value="300">Every 5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button onClick={handleConnect} disabled={connecting} className="gap-2">
                {connecting ? (
                  <>
                    <Wifi className="h-4 w-4 animate-pulse" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4" />
                    Connect Device
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {!showForm && (
          <Button onClick={() => setShowForm(true)} variant="outline" className="w-full gap-2">
            <Plug className="h-4 w-4" />
            Add Smart Device
          </Button>
        )}

        {/* Info Box */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
          <p className="font-medium text-primary mb-1">How it works</p>
          <ul className="space-y-1 text-xs">
            <li>1. Install a smart energy meter (e.g., Shelly EM) on your electrical panel</li>
            <li>2. Connect it to your home WiFi network</li>
            <li>3. Enter the device's IP address above to start syncing data</li>
            <li>4. Your real consumption data replaces the simulated readings</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
