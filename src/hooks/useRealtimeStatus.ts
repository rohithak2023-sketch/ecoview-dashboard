import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemComponent {
  id: string;
  component_name: string;
  status: string;
  last_update: string;
  uptime_percentage: number;
  data_points: number;
}

export const useRealtimeStatus = () => {
  const [components, setComponents] = useState<SystemComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial status
    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('system_status')
        .select('*')
        .order('component_name');

      if (error) {
        console.error('Error fetching status:', error);
      } else {
        setComponents(data?.map(c => ({
          ...c,
          uptime_percentage: Number(c.uptime_percentage),
          data_points: c.data_points || 0
        })) || []);
      }
      setIsLoading(false);
    };

    fetchStatus();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('system-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_status'
        },
        (payload) => {
          console.log('Status update received:', payload);
          if (payload.eventType === 'UPDATE') {
            const newData = payload.new as SystemComponent;
            setComponents(prev => 
              prev.map(c => 
                c.id === newData.id 
                  ? { 
                      id: newData.id,
                      component_name: newData.component_name,
                      status: newData.status,
                      last_update: newData.last_update,
                      uptime_percentage: Number(newData.uptime_percentage),
                      data_points: newData.data_points || 0
                    } 
                  : c
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { components, isLoading };
};
