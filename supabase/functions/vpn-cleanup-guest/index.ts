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

    console.log('Starting VPN guest session cleanup...');

    // Find expired guest sessions
    const { data: expiredSessions, error: selectError } = await supabase
      .from('vpn_sessions')
      .select('id, user_id_hash, server_id, started_at, expires_at')
      .eq('is_guest', true)
      .eq('status', 'active')
      .lt('expires_at', new Date().toISOString());

    if (selectError) {
      console.error('Error finding expired sessions:', selectError);
      return new Response(
        JSON.stringify({ error: 'Failed to find expired sessions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!expiredSessions || expiredSessions.length === 0) {
      console.log('No expired guest sessions found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired sessions to clean up',
          cleaned: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${expiredSessions.length} expired guest sessions`);

    // Update expired sessions to disconnected status
    const sessionIds = expiredSessions.map(s => s.id);
    const { error: updateError } = await supabase
      .from('vpn_sessions')
      .update({
        status: 'disconnected',
        ended_at: new Date().toISOString()
      })
      .in('id', sessionIds);

    if (updateError) {
      console.error('Error updating expired sessions:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update expired sessions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log audit events for cleanup
    const auditEntries = expiredSessions.map(session => ({
      event_type: 'expire',
      session_id: session.id,
      user_id_hash: session.user_id_hash,
      meta: {
        expired_at: session.expires_at,
        auto_cleanup: true,
        duration_minutes: Math.round(
          (new Date().getTime() - new Date(session.started_at).getTime()) / 60000
        )
      }
    }));

    await supabase.from('vpn_audit').insert(auditEntries);

    console.log(`Successfully cleaned up ${expiredSessions.length} guest sessions`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Cleaned up ${expiredSessions.length} expired guest sessions`,
        cleaned: expiredSessions.length,
        sessions: sessionIds
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in vpn-cleanup-guest function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
