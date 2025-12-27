import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnergyReading } from '@/types';

export const useRealtimeReadings = () => {
  const [readings, setReadings] = useState<EnergyReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial readings
    const fetchReadings = async () => {
      const { data, error } = await supabase
        .from('energy_readings')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching readings:', error);
      } else {
        setReadings(data?.map(r => ({
          id: r.id,
          timestamp: r.timestamp,
          consumption: Number(r.consumption),
          cost: r.cost ? Number(r.cost) : undefined
        })) || []);
      }
      setIsLoading(false);
    };

    fetchReadings();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('energy-readings-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'energy_readings'
        },
        (payload) => {
          console.log('New reading received:', payload);
          const newReading: EnergyReading = {
            id: payload.new.id,
            timestamp: payload.new.timestamp,
            consumption: Number(payload.new.consumption),
            cost: payload.new.cost ? Number(payload.new.cost) : undefined
          };
          setReadings(prev => [newReading, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { readings, isLoading };
};
