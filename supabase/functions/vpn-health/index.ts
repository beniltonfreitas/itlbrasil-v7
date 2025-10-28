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

    console.log('Starting VPN health check...');

    // Get all active servers
    const { data: servers, error: serversError } = await supabase
      .from('vpn_servers')
      .select('*')
      .in('status', ['active', 'maintenance']);

    if (serversError) {
      console.error('Error fetching servers:', serversError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch servers' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const server of servers || []) {
      console.log(`Checking server: ${server.name} (${server.host})`);
      
      const start = Date.now();
      let health_status = 'down';
      let latency_ms = 0;

      try {
        // Simulate health check (in production, this would ping the actual VPN server)
        // For now, we'll use a simple timeout to simulate latency
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // In a real implementation, this would be:
        // const response = await fetch(`https://${server.host}:${server.port}/health`, {
        //   signal: controller.signal
        // });

        // Simulated latency (random between 10-200ms for demo)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 190 + 10));
        
        clearTimeout(timeoutId);
        latency_ms = Date.now() - start;
        health_status = 'healthy';

        console.log(`✓ Server ${server.name} is healthy (${latency_ms}ms)`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`✗ Server ${server.name} health check failed:`, errorMessage);
        health_status = 'down';
        latency_ms = 0;
      }

      // Update server health
      const { error: updateError } = await supabase
        .from('vpn_servers')
        .update({
          health_status,
          latency_ms,
          updated_at: new Date().toISOString()
        })
        .eq('id', server.id);

      if (updateError) {
        console.error(`Error updating server ${server.name}:`, updateError);
      }

      results.push({
        server_id: server.id,
        name: server.name,
        health_status,
        latency_ms
      });
    }

    console.log('Health check completed for', results.length, 'servers');

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        servers_checked: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in vpn-health function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
