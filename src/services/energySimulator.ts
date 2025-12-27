import { supabase } from '@/integrations/supabase/client';

let simulatorInterval: NodeJS.Timeout | null = null;

export const startEnergySimulator = () => {
  if (simulatorInterval) return;

  // Generate initial reading immediately
  generateReading();

  // Then generate a new reading every 5 seconds
  simulatorInterval = setInterval(generateReading, 5000);
};

export const stopEnergySimulator = () => {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }
};

const generateReading = async () => {
  const hour = new Date().getHours();
  
  // Simulate realistic consumption based on time of day
  let baseConsumption = 2.5;
  if (hour >= 6 && hour <= 9) baseConsumption = 4.5; // Morning peak
  if (hour >= 17 && hour <= 21) baseConsumption = 5.5; // Evening peak
  if (hour >= 23 || hour <= 5) baseConsumption = 1.5; // Night low

  const consumption = baseConsumption + (Math.random() - 0.5) * 2;
  const cost = consumption * 0.12; // $0.12 per kWh

  const { error } = await supabase
    .from('energy_readings')
    .insert({
      consumption: Math.round(consumption * 100) / 100,
      cost: Math.round(cost * 100) / 100,
      timestamp: new Date().toISOString()
    });

  if (error) {
    console.error('Error inserting reading:', error);
  } else {
    console.log('New reading generated:', { consumption: consumption.toFixed(2), cost: cost.toFixed(2) });
  }
};
