import { DailyConsumption, EnergyStats, SystemStatus, EnergyReading } from '@/types';

export const generateHourlyData = (): { hour: string; consumption: number }[] => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0') + ':00';
    // Simulate realistic energy pattern: low at night, peaks at morning and evening
    let base = 20;
    if (i >= 6 && i <= 9) base = 45 + Math.random() * 20; // Morning peak
    else if (i >= 17 && i <= 21) base = 55 + Math.random() * 25; // Evening peak
    else if (i >= 10 && i <= 16) base = 35 + Math.random() * 15; // Daytime
    else base = 15 + Math.random() * 10; // Night
    
    hours.push({ hour, consumption: Math.round(base * 10) / 10 });
  }
  return hours;
};

export const generateWeeklyData = (): DailyConsumption[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((date, index) => {
    const isWeekend = index >= 5;
    const baseConsumption = isWeekend ? 650 : 820;
    const consumption = baseConsumption + Math.random() * 150 - 75;
    return {
      date,
      consumption: Math.round(consumption),
      peak: Math.round(consumption * 0.08 + Math.random() * 10),
      average: Math.round(consumption / 24),
    };
  });
};

export const generateMonthlyData = (): { month: string; consumption: number; cost: number }[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, index) => {
    // Higher consumption in winter and summer (heating/cooling)
    let base = 22000;
    if (index <= 2 || index >= 10) base = 28000; // Winter
    else if (index >= 5 && index <= 7) base = 26000; // Summer
    
    const consumption = base + Math.random() * 4000 - 2000;
    return {
      month,
      consumption: Math.round(consumption),
      cost: Math.round(consumption * 0.12),
    };
  });
};

export const mockStats: EnergyStats = {
  totalConsumption: 24856,
  dailyAverage: 827,
  peakUsage: 78.5,
  peakTime: '19:30',
  trend: -4.2,
  costEstimate: 2983,
};

export const mockSystemStatus: SystemStatus = {
  status: 'healthy',
  lastUpdate: new Date().toISOString(),
  uptime: '99.9%',
  dataPoints: 142857,
};

export const generateRecentReadings = (): EnergyReading[] => {
  const readings: EnergyReading[] = [];
  const now = new Date();
  
  for (let i = 0; i < 10; i++) {
    const timestamp = new Date(now.getTime() - i * 3600000);
    readings.push({
      id: `reading-${i}`,
      timestamp: timestamp.toISOString(),
      consumption: Math.round((30 + Math.random() * 40) * 10) / 10,
      cost: Math.round((30 + Math.random() * 40) * 0.12 * 100) / 100,
    });
  }
  
  return readings;
};
