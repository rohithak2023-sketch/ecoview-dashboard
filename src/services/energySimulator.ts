import { supabase } from '@/integrations/supabase/client';

let simulatorInterval: NodeJS.Timeout | null = null;

export const startEnergySimulator = () => {
  if (simulatorInterval) return;

  // Generate initial reading immediately
  generateReading();

  // Then generate a new reading every 1 minute
  simulatorInterval = setInterval(generateReading, 60 * 1000);
};

export const stopEnergySimulator = () => {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }
};

const generateReading = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('energy-simulator');
    
    if (error) {
      console.error('Error calling energy-simulator:', error);
    } else {
      console.log('New reading generated via edge function:', data);
    }
  } catch (error) {
    console.error('Error invoking energy-simulator function:', error);
  }
};
