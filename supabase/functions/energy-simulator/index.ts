import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
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
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.warn('Missing or invalid authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create client with user's token for proper JWT verification
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify JWT and extract claims using getClaims() - this cryptographically verifies the token
    const token = authHeader.replace('Bearer ', '');
    const { data, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !data?.claims) {
      console.error('Invalid JWT token:', claimsError?.message);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = data.claims.sub;
    if (!userId) {
      console.error('No user ID in token claims');
      return new Response(JSON.stringify({ error: 'Invalid token - no user ID' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Verified user: ${userId}`);

    const hour = new Date().getHours();
    
    // Simulate realistic consumption based on time of day
    let baseConsumption = 2.5;
    if (hour >= 6 && hour <= 9) baseConsumption = 4.5;
    if (hour >= 17 && hour <= 21) baseConsumption = 5.5;
    if (hour >= 23 || hour <= 5) baseConsumption = 1.5;

    const consumption = baseConsumption + (Math.random() - 0.5) * 2;
    const cost = consumption * 0.12;

    // Insert reading - RLS will enforce user can only insert for themselves
    const { error } = await supabase
      .from('energy_readings')
      .insert({
        user_id: userId,
        consumption: Math.round(consumption * 100) / 100,
        cost: Math.round(cost * 100) / 100,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Error inserting reading:', error);
      return new Response(JSON.stringify({ error: 'Failed to insert reading', details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`New reading generated for user ${userId}:`, { 
      consumption: consumption.toFixed(2), 
      cost: cost.toFixed(2) 
    });

    return new Response(JSON.stringify({ success: true, consumption, cost }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in energy-simulator function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Internal server error', details: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
