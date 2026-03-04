import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Laptop, Smartphone, Refrigerator, AirVent, Tv, WashingMachine,
  Lightbulb, Microwave, Monitor, Fan, Plug, Plus, Trash2, Zap,
  BarChart3, BatteryCharging, Loader2, Router, Flame, CupSoda, Gamepad2,
} from 'lucide-react';
import { HomeDevice, HOME_DEVICE_PRESETS, useHomeDevices } from '@/hooks/useHomeDevices';
import { useToast } from '@/hooks/use-toast';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  laptop: Laptop,
  smartphone: Smartphone,
  refrigerator: Refrigerator,
  'air-vent': AirVent,
  tv: Tv,
  'washing-machine': WashingMachine,
  lightbulb: Lightbulb,
  microwave: Microwave,
  monitor: Monitor,
  fan: Fan,
  plug: Plug,
  router: Router,
  flame: Flame,
  'cup-soda': CupSoda,
  'gamepad-2': Gamepad2,
};

const getIcon = (iconType: string) => ICON_MAP[iconType] || Plug;

interface DeviceManagerProps {
  className?: string;
}

export const DeviceManager = ({ className }: DeviceManagerProps) => {
  const { toast } = useToast();
  const {
    devices, isLoading, addDevice, deleteDevice, toggleDevice,
    toggleCharging, activeDevices, totalDailyKwh,
  } = useHomeDevices();

  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '', device_type: 'other', wattage: 100, hours_per_day: 4, icon_type: 'plug',
  });

  const selectPreset = (type: string) => {
    const preset = HOME_DEVICE_PRESETS.find(p => p.type === type);
    if (preset) {
      setNewDevice({
        name: preset.name,
        device_type: preset.type,
        wattage: preset.wattage,
        hours_per_day: preset.hours,
        icon_type: preset.icon,
      });
    }
  };

  const handleAdd = async () => {
    if (!newDevice.name) return;
    setAdding(true);
    const result = await addDevice({
      ...newDevice,
      is_charging: newDevice.device_type.includes('laptop') || newDevice.device_type === 'phone',
    });
    setAdding(false);
    if (result) {
      toast({ title: 'Device Added', description: `${newDevice.name} (${newDevice.wattage}W) is now being tracked.` });
      setNewDevice({ name: '', device_type: 'other', wattage: 100, hours_per_day: 4, icon_type: 'plug' });
      setShowAddForm(false);
    }
  };

  const handleDelete = async (device: HomeDevice) => {
    await deleteDevice(device.id);
    toast({ title: 'Device Removed', description: `${device.name} removed from tracking.` });
  };

  // Per-appliance breakdown
  const breakdown = activeDevices
    .map(d => ({
      ...d,
      dailyKwh: (Number(d.wattage) * Number(d.hours_per_day)) / 1000,
      percentage: totalDailyKwh > 0
        ? ((Number(d.wattage) * Number(d.hours_per_day)) / 1000 / totalDailyKwh) * 100
        : 0,
    }))
    .sort((a, b) => b.dailyKwh - a.dailyKwh);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Home Device Manager
        </CardTitle>
        <CardDescription>
          Add your real home devices with actual wattage ratings to track consumption
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
            <p className="text-xs text-muted-foreground">Tracked</p>
            <p className="text-xl font-bold text-foreground">{devices.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
            <p className="text-xs text-muted-foreground">Daily</p>
            <p className="text-xl font-bold text-primary">{totalDailyKwh.toFixed(1)} kWh</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
            <p className="text-xs text-muted-foreground">Charging</p>
            <p className="text-xl font-bold text-foreground">{devices.filter(d => d.is_charging).length}</p>
          </div>
        </div>

        {/* Device Breakdown */}
        {breakdown.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Energy Breakdown</Label>
            {breakdown.map(device => {
              const Icon = getIcon(device.icon_type);
              return (
                <div key={device.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{device.name}</span>
                      {device.is_charging && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                          <BatteryCharging className="h-3 w-3 mr-0.5" />
                          Charging
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {device.wattage}W × {device.hours_per_day}h
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">
                        {device.dailyKwh.toFixed(2)} kWh
                      </span>
                      <Switch
                        checked={device.is_active}
                        onCheckedChange={() => toggleDevice(device.id)}
                        className="scale-75"
                      />
                      <button
                        onClick={() => handleDelete(device as HomeDevice)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <Progress value={device.percentage} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground text-right">
                    {device.percentage.toFixed(1)}% of total • ${(device.dailyKwh * 0.12).toFixed(2)}/day
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Inactive Devices */}
        {devices.filter(d => !d.is_active).length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Inactive Devices</Label>
            {devices.filter(d => !d.is_active).map(d => {
              const Icon = getIcon(d.icon_type);
              return (
                <div key={d.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30 opacity-60">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={false} onCheckedChange={() => toggleDevice(d.id)} className="scale-75" />
                    <button onClick={() => handleDelete(d)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Device Form */}
        {showAddForm ? (
          <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-2">
              <Label className="text-xs">Quick Preset (with real wattage)</Label>
              <Select onValueChange={selectPreset}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select device..." />
                </SelectTrigger>
                <SelectContent>
                  {HOME_DEVICE_PRESETS.map(p => (
                    <SelectItem key={p.type} value={p.type}>
                      {p.name} ({p.wattage}W)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input
                  className="h-8 text-sm"
                  value={newDevice.name}
                  onChange={e => setNewDevice(p => ({ ...p, name: e.target.value }))}
                  placeholder="Device name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Wattage (W)</Label>
                <Input
                  className="h-8 text-sm"
                  type="number"
                  min="1"
                  value={newDevice.wattage}
                  onChange={e => setNewDevice(p => ({ ...p, wattage: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hours Used Per Day</Label>
              <Input
                className="h-8 text-sm"
                type="number"
                min="0.1"
                max="24"
                step="0.5"
                value={newDevice.hours_per_day}
                onChange={e => setNewDevice(p => ({ ...p, hours_per_day: Number(e.target.value) }))}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={adding} className="gap-1">
                {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Add Device
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full gap-2" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4" />
            Add Home Device
          </Button>
        )}

        {/* Real Wattage Info */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
          <p className="font-medium text-primary mb-1">
            <Zap className="h-3 w-3 inline mr-1" />
            Real Wattage Guide
          </p>
          <p>
            Check your device's charger or label for actual wattage. Laptop chargers range from 45W–180W.
            A typical home uses 1,000–1,500 kWh/month.
          </p>
          {breakdown.length > 0 && (
            <p className="mt-1">
              Your top consumer: <strong className="text-foreground">{breakdown[0]?.name}</strong> at {breakdown[0]?.dailyKwh.toFixed(1)} kWh/day
              (${((breakdown[0]?.dailyKwh || 0) * 0.12 * 30).toFixed(2)}/month).
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
