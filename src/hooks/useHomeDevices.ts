import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';

export interface HomeDevice {
  id: string;
  user_id: string;
  name: string;
  device_type: string;
  wattage: number;
  hours_per_day: number;
  is_active: boolean;
  is_charging: boolean;
  icon_type: string;
  created_at: string;
  updated_at: string;
}

export const HOME_DEVICE_PRESETS = [
  { type: 'laptop', name: 'Laptop Charger', wattage: 65, hours: 6, icon: 'laptop' },
  { type: 'laptop_gaming', name: 'Gaming Laptop Charger', wattage: 180, hours: 4, icon: 'laptop' },
  { type: 'macbook', name: 'MacBook Charger', wattage: 96, hours: 5, icon: 'laptop' },
  { type: 'phone', name: 'Phone Charger', wattage: 20, hours: 3, icon: 'smartphone' },
  { type: 'refrigerator', name: 'Refrigerator', wattage: 150, hours: 24, icon: 'refrigerator' },
  { type: 'ac', name: 'Air Conditioner', wattage: 1500, hours: 8, icon: 'air-vent' },
  { type: 'tv', name: 'Television', wattage: 100, hours: 5, icon: 'tv' },
  { type: 'washer', name: 'Washing Machine', wattage: 500, hours: 1, icon: 'washing-machine' },
  { type: 'light_led', name: 'LED Bulb (10W)', wattage: 10, hours: 8, icon: 'lightbulb' },
  { type: 'light_cfl', name: 'CFL Bulb (23W)', wattage: 23, hours: 8, icon: 'lightbulb' },
  { type: 'microwave', name: 'Microwave', wattage: 1000, hours: 0.5, icon: 'microwave' },
  { type: 'desktop', name: 'Desktop PC', wattage: 300, hours: 8, icon: 'monitor' },
  { type: 'monitor', name: 'Monitor', wattage: 40, hours: 8, icon: 'monitor' },
  { type: 'fan', name: 'Ceiling Fan', wattage: 75, hours: 10, icon: 'fan' },
  { type: 'router', name: 'WiFi Router', wattage: 12, hours: 24, icon: 'router' },
  { type: 'water_heater', name: 'Water Heater', wattage: 3000, hours: 1, icon: 'flame' },
  { type: 'iron', name: 'Iron', wattage: 1200, hours: 0.5, icon: 'plug' },
  { type: 'kettle', name: 'Electric Kettle', wattage: 1500, hours: 0.25, icon: 'cup-soda' },
  { type: 'gaming_console', name: 'Gaming Console', wattage: 200, hours: 3, icon: 'gamepad-2' },
  { type: 'other', name: 'Other', wattage: 100, hours: 4, icon: 'plug' },
] as const;

export const useHomeDevices = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<HomeDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDevices = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('home_devices')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Error fetching devices:', error);
    } else {
      setDevices((data as HomeDevice[]) || []);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDevices();

    const channel = supabase
      .channel('home-devices-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'home_devices' }, () => {
        fetchDevices();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchDevices]);

  const addDevice = useCallback(async (device: {
    name: string;
    device_type: string;
    wattage: number;
    hours_per_day: number;
    icon_type: string;
    is_charging?: boolean;
  }) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('home_devices')
      .insert({ ...device, user_id: user.id } as any)
      .select()
      .single();

    if (error) {
      logger.error('Error adding device:', error);
      return null;
    }
    return data as HomeDevice;
  }, [user]);

  const updateDevice = useCallback(async (id: string, updates: Partial<HomeDevice>) => {
    const { error } = await supabase
      .from('home_devices')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', id);

    if (error) logger.error('Error updating device:', error);
  }, []);

  const deleteDevice = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('home_devices')
      .delete()
      .eq('id', id);

    if (error) logger.error('Error deleting device:', error);
  }, []);

  const toggleDevice = useCallback(async (id: string) => {
    const device = devices.find(d => d.id === id);
    if (device) {
      await updateDevice(id, { is_active: !device.is_active } as any);
    }
  }, [devices, updateDevice]);

  const toggleCharging = useCallback(async (id: string) => {
    const device = devices.find(d => d.id === id);
    if (device) {
      await updateDevice(id, { is_charging: !device.is_charging } as any);
    }
  }, [devices, updateDevice]);

  // Computed stats
  const activeDevices = devices.filter(d => d.is_active);
  const totalDailyKwh = activeDevices.reduce((sum, d) => sum + (Number(d.wattage) * Number(d.hours_per_day)) / 1000, 0);
  const totalMonthlyKwh = totalDailyKwh * 30;
  const chargingDevices = devices.filter(d => d.is_charging);
  const currentDrawWatts = activeDevices.reduce((sum, d) => sum + Number(d.wattage), 0);

  return {
    devices,
    isLoading,
    addDevice,
    updateDevice,
    deleteDevice,
    toggleDevice,
    toggleCharging,
    activeDevices,
    totalDailyKwh,
    totalMonthlyKwh,
    chargingDevices,
    currentDrawWatts,
    refresh: fetchDevices,
  };
};
