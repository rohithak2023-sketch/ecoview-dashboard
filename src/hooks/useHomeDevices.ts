import { useState, useEffect, useCallback } from 'react';
export const HOME_DEVICE_PRESETS = [
  { type: 'laptop', name: 'Laptop Charger', wattage: 65, hours: 6, icon: 'laptop' },
  { type: 'phone', name: 'Phone Charger', wattage: 20, hours: 3, icon: 'smartphone' },
  { type: 'refrigerator', name: 'Refrigerator', wattage: 150, hours: 24, icon: 'refrigerator' },
  { type: 'ac', name: 'Air Conditioner', wattage: 1500, hours: 8, icon: 'air-vent' },
  { type: 'tv', name: 'Television', wattage: 100, hours: 5, icon: 'tv' },
  { type: 'light', name: 'LED Bulb', wattage: 10, hours: 8, icon: 'lightbulb' },
  { type: 'fan', name: 'Fan', wattage: 75, hours: 10, icon: 'fan' },
  { type: 'router', name: 'WiFi Router', wattage: 12, hours: 24, icon: 'router' },
  { type: 'other', name: 'Other', wattage: 100, hours: 4, icon: 'plug' },
];

export const useHomeDevices = () => {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ FETCH DEVICES
  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/devices");
      const data = await res.json();
      setDevices(data);
    } catch (err) {
      console.error("Error fetching devices", err);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // ✅ ADD DEVICE
  const addDevice = useCallback(async (device) => {
    try {
      await fetch("http://localhost:5000/api/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(device)
      });

      fetchDevices();
      return true;
    } catch (err) {
      console.error("Error adding device", err);
      return null;
    }
  }, [fetchDevices]);

  // ✅ DELETE DEVICE
  const deleteDevice = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/devices/${id}`, {
        method: "DELETE"
      });

      fetchDevices();
    } catch (err) {
      console.error("Error deleting device", err);
    }
  };

  // ✅ TOGGLE DEVICE (active/inactive)
  const toggleDevice = async (id) => {
    try {
      const device = devices.find(d => d.id === id);
      if (!device) return;

      await fetch(`http://localhost:5000/api/devices/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          is_active: !device.is_active
        })
      });

      fetchDevices();
    } catch (err) {
      console.error("Error updating device", err);
    }
  };

  // (optional for now)
  const updateDevice = async () => {};
  const toggleCharging = async () => {};

  // ✅ Computed values
  const activeDevices = devices.filter(d => d.is_active);
  const totalDailyKwh = activeDevices.reduce(
    (sum, d) => sum + (Number(d.wattage) * Number(d.hours_per_day)) / 1000,
    0
  );
  const totalMonthlyKwh = totalDailyKwh * 30;
  const chargingDevices = devices.filter(d => d.is_charging);
  const currentDrawWatts = activeDevices.reduce(
    (sum, d) => sum + Number(d.wattage),
    0
  );

  return {
    devices,
    isLoading,
    addDevice,
    deleteDevice,
    updateDevice,
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