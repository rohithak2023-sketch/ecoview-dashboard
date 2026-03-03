import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Refrigerator,
  AirVent,
  Tv,
  WashingMachine,
  Lightbulb,
  Microwave,
  Monitor,
  Fan,
  Plug,
  Plus,
  Trash2,
  Zap,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Appliance {
  id: string;
  name: string;
  type: string;
  wattage: number;
  hoursPerDay: number;
  isActive: boolean;
}

const APPLIANCE_PRESETS = [
  { type: 'refrigerator', name: 'Refrigerator', icon: Refrigerator, wattage: 150, hours: 24 },
  { type: 'ac', name: 'Air Conditioner', icon: AirVent, wattage: 1500, hours: 8 },
  { type: 'tv', name: 'Television', icon: Tv, wattage: 100, hours: 5 },
  { type: 'washer', name: 'Washing Machine', icon: WashingMachine, wattage: 500, hours: 1 },
  { type: 'light', name: 'Lighting', icon: Lightbulb, wattage: 60, hours: 8 },
  { type: 'microwave', name: 'Microwave', icon: Microwave, wattage: 1000, hours: 0.5 },
  { type: 'computer', name: 'Computer/Laptop', icon: Monitor, wattage: 200, hours: 8 },
  { type: 'fan', name: 'Fan', icon: Fan, wattage: 75, hours: 10 },
  { type: 'other', name: 'Other', icon: Plug, wattage: 100, hours: 4 },
];

const getIcon = (type: string) => {
  return APPLIANCE_PRESETS.find(p => p.type === type)?.icon || Plug;
};

interface ApplianceTrackerProps {
  className?: string;
}

export const ApplianceTracker = ({ className }: ApplianceTrackerProps) => {
  const [appliances, setAppliances] = useState<Appliance[]>([
    { id: '1', name: 'Refrigerator', type: 'refrigerator', wattage: 150, hoursPerDay: 24, isActive: true },
    { id: '2', name: 'Air Conditioner', type: 'ac', wattage: 1500, hoursPerDay: 6, isActive: true },
    { id: '3', name: 'Living Room TV', type: 'tv', wattage: 100, hoursPerDay: 4, isActive: true },
    { id: '4', name: 'LED Lights', type: 'light', wattage: 40, hoursPerDay: 8, isActive: true },
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAppliance, setNewAppliance] = useState({
    name: '',
    type: 'other',
    wattage: 100,
    hoursPerDay: 4,
  });

  const stats = useMemo(() => {
    const active = appliances.filter(a => a.isActive);
    const totalDailyKwh = active.reduce((sum, a) => sum + (a.wattage * a.hoursPerDay) / 1000, 0);
    const totalMonthlyKwh = totalDailyKwh * 30;
    const perAppliance = active.map(a => ({
      ...a,
      dailyKwh: (a.wattage * a.hoursPerDay) / 1000,
      percentage: totalDailyKwh > 0 ? ((a.wattage * a.hoursPerDay) / 1000 / totalDailyKwh) * 100 : 0,
    })).sort((a, b) => b.dailyKwh - a.dailyKwh);

    return { totalDailyKwh, totalMonthlyKwh, perAppliance, activeCount: active.length };
  }, [appliances]);

  const addAppliance = () => {
    if (!newAppliance.name) return;
    setAppliances(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newAppliance.name,
        type: newAppliance.type,
        wattage: newAppliance.wattage,
        hoursPerDay: newAppliance.hoursPerDay,
        isActive: true,
      },
    ]);
    setNewAppliance({ name: '', type: 'other', wattage: 100, hoursPerDay: 4 });
    setShowAddForm(false);
  };

  const removeAppliance = (id: string) => {
    setAppliances(prev => prev.filter(a => a.id !== id));
  };

  const toggleAppliance = (id: string) => {
    setAppliances(prev =>
      prev.map(a => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const selectPreset = (type: string) => {
    const preset = APPLIANCE_PRESETS.find(p => p.type === type);
    if (preset) {
      setNewAppliance({
        name: preset.name,
        type: preset.type,
        wattage: preset.wattage,
        hoursPerDay: preset.hours,
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Appliance-Level Tracking
        </CardTitle>
        <CardDescription>
          Monitor energy consumption per appliance to find the biggest consumers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
            <p className="text-xs text-muted-foreground">Active Devices</p>
            <p className="text-xl font-bold text-foreground">{stats.activeCount}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
            <p className="text-xs text-muted-foreground">Daily Usage</p>
            <p className="text-xl font-bold text-primary">{stats.totalDailyKwh.toFixed(1)} kWh</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
            <p className="text-xs text-muted-foreground">Monthly Est.</p>
            <p className="text-xl font-bold text-foreground">{stats.totalMonthlyKwh.toFixed(0)} kWh</p>
          </div>
        </div>

        {/* Appliance Breakdown */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Consumption Breakdown</Label>
          {stats.perAppliance.map(appliance => {
            const Icon = getIcon(appliance.type);
            return (
              <div key={appliance.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{appliance.name}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {appliance.wattage}W × {appliance.hoursPerDay}h
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">
                      {appliance.dailyKwh.toFixed(2)} kWh
                    </span>
                    <Switch
                      checked={appliance.isActive}
                      onCheckedChange={() => toggleAppliance(appliance.id)}
                      className="scale-75"
                    />
                    <button
                      onClick={() => removeAppliance(appliance.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <Progress value={appliance.percentage} className="h-1.5" />
                <p className="text-[10px] text-muted-foreground text-right">
                  {appliance.percentage.toFixed(1)}% of total
                </p>
              </div>
            );
          })}
        </div>

        {/* Inactive appliances */}
        {appliances.filter(a => !a.isActive).length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Inactive Devices</Label>
            {appliances
              .filter(a => !a.isActive)
              .map(a => {
                const Icon = getIcon(a.type);
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/30 opacity-60"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{a.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={false}
                        onCheckedChange={() => toggleAppliance(a.id)}
                        className="scale-75"
                      />
                      <button
                        onClick={() => removeAppliance(a.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Add Appliance Form */}
        {showAddForm ? (
          <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-2">
              <Label className="text-xs">Quick Preset</Label>
              <Select onValueChange={selectPreset}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select a preset..." />
                </SelectTrigger>
                <SelectContent>
                  {APPLIANCE_PRESETS.map(p => (
                    <SelectItem key={p.type} value={p.type}>
                      <span className="flex items-center gap-2">
                        <p.icon className="h-3.5 w-3.5" />
                        {p.name} ({p.wattage}W)
                      </span>
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
                  value={newAppliance.name}
                  onChange={e => setNewAppliance(p => ({ ...p, name: e.target.value }))}
                  placeholder="Appliance name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Wattage (W)</Label>
                <Input
                  className="h-8 text-sm"
                  type="number"
                  min="1"
                  value={newAppliance.wattage}
                  onChange={e => setNewAppliance(p => ({ ...p, wattage: Number(e.target.value) }))}
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
                value={newAppliance.hoursPerDay}
                onChange={e => setNewAppliance(p => ({ ...p, hoursPerDay: Number(e.target.value) }))}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addAppliance} className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4" />
            Add Appliance
          </Button>
        )}

        {/* Tip */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
          <p className="font-medium text-primary mb-1">
            <Zap className="h-3 w-3 inline mr-1" />
            Energy Saving Tip
          </p>
          {stats.perAppliance.length > 0 && (
            <p>
              Your <strong className="text-foreground">{stats.perAppliance[0]?.name}</strong> is your
              biggest energy consumer at {stats.perAppliance[0]?.dailyKwh.toFixed(1)} kWh/day (
              {stats.perAppliance[0]?.percentage.toFixed(0)}%). Consider reducing usage hours or
              upgrading to an energy-efficient model.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
