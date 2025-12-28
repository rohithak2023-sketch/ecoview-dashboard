import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get allowed origins from environment or use a restrictive default
const getAllowedOrigins = (): string[] => {
  const origins = Deno.env.get('ALLOWED_ORIGINS');
  if (origins) {
    return origins.split(',').map(o => o.trim());
  }
  // Default to common Lovable preview domains
  return [
    'https://lovable.dev',
    'https://preview--*.lovable.app',
    'https://*.lovable.app'
  ];
};

const getCorsHeaders = (origin: string | null): Record<string, string> => {
  const allowedOrigins = getAllowedOrigins();
  
  // Check if the origin matches any allowed pattern
  const isAllowed = origin && allowedOrigins.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(origin);
    }
    return pattern === origin;
  });

  return {
    'Access-Control-Allow-Origin': isAllowed && origin ? origin : '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  };
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Verify authorization header exists (basic auth check)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.warn('Unauthorized request attempt - missing authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
      return new Response(JSON.stringify({ error: 'Failed to insert reading' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('New reading generated:', { consumption: consumption.toFixed(2), cost: cost.toFixed(2) });

    return new Response(JSON.stringify({ success: true, consumption, cost }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in energy-simulator function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
