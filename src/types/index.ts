export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface EnergyReading {
  id: string;
  timestamp: string;
  consumption: number; // kWh
  cost?: number;
}

export interface DailyConsumption {
  date: string;
  consumption: number;
  peak: number;
  average: number;
}

export interface EnergyStats {
  totalConsumption: number;
  dailyAverage: number;
  peakUsage: number;
  peakTime: string;
  trend: number; // percentage change
  costEstimate: number;
}

export interface SystemStatus {
  status: 'healthy' | 'warning' | 'error';
  lastUpdate: string;
  uptime: string;
  dataPoints: number;
}
