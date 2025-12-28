import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const hour = new Date().getHours();
    
    // Simulate realistic consumption based on time of day
    let baseConsumption = 2.5;
    if (hour >= 6 && hour <= 9) baseConsumption = 4.5;
    if (hour >= 17 && hour <= 21) baseConsumption = 5.5;
    if (hour >= 23 || hour <= 5) baseConsumption = 1.5;

    const consumption = baseConsumption + (Math.random() - 0.5) * 2;
    const cost = consumption * 0.12;

    const { error } = await supabase
      .from('energy_readings')
      .insert({
        consumption: Math.round(consumption * 100) / 100,
        cost: Math.round(cost * 100) / 100,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Error inserting reading:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('New reading generated:', { consumption: consumption.toFixed(2), cost: cost.toFixed(2) });

    return new Response(JSON.stringify({ success: true, consumption, cost }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in energy-simulator function:', error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
