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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, serverId, sessionId, isGuest, userId } = await req.json();

    // CREATE SESSION (supports guest mode)
    if (action === 'create') {
      const userIdHash = isGuest ? `guest_${crypto.randomUUID()}` : user.id;
      console.log('Creating VPN session:', { isGuest, userIdHash, serverId });

      // Terminate any existing active sessions for this user/guest
      if (!isGuest && user) {
        await supabase
          .from('vpn_sessions')
          .update({ status: 'disconnected', ended_at: new Date().toISOString() })
          .eq('user_id_hash', user.id)
          .eq('status', 'active');
      }

      // Get server info
      let server;
      if (serverId) {
        const { data } = await supabase
          .from('vpn_servers')
          .select('*')
          .eq('id', serverId)
          .eq('status', 'active')
          .single();
        server = data;
      } else {
        // Auto-select best server (lowest latency)
        const { data: servers } = await supabase
          .from('vpn_servers')
          .select('*')
          .eq('status', 'active')
          .eq('health_status', 'healthy')
          .order('latency_ms', { ascending: true })
          .limit(1);
        server = servers?.[0];
      }

      if (!server) {
        return new Response(
          JSON.stringify({ error: 'No available VPN servers' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate session token
      const sessionToken = crypto.randomUUID();

      // Calculate expiration for guest sessions (30 minutes)
      const expiresAt = isGuest 
        ? new Date(Date.now() + 30 * 60 * 1000).toISOString() 
        : null;

      // Create session
      const { data: session, error: sessionError } = await supabase
        .from('vpn_sessions')
        .insert({
          user_id_hash: userIdHash,
          server_id: server.id,
          protocol: server.protocol,
          session_token: sessionToken,
          status: 'active',
          is_guest: isGuest,
          expires_at: expiresAt
        })
        .select('*, vpn_servers(*)')
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create VPN session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log audit event
      await supabase.from('vpn_audit').insert({
        event_type: 'connect',
        session_id: session.id,
        user_id_hash: userIdHash,
        meta: { 
          server_name: server.name, 
          region: server.region,
          is_guest: isGuest,
          expires_at: expiresAt
        }
      });

      console.log('VPN session created:', session.id);

      return new Response(
        JSON.stringify({
          success: true,
          session: {
            id: session.id,
            token: sessionToken,
            server: server,
            wsUrl: `wss://${server.host}:${server.port}/vpn`,
            status: 'active',
            is_guest: isGuest,
            expires_at: expiresAt
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // TERMINATE SESSION
    if (action === 'terminate') {
      console.log('Terminating VPN session:', sessionId);

      const { data: session, error: updateError } = await supabase
        .from('vpn_sessions')
        .update({
          status: 'disconnected',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError) {
        console.error('Error terminating session:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to terminate session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log audit event
      await supabase.from('vpn_audit').insert({
        event_type: 'disconnect',
        session_id: sessionId,
        user_id_hash: session.user_id_hash,
        meta: { manual_disconnect: true }
      });

      console.log('VPN session terminated:', sessionId);

      return new Response(
        JSON.stringify({ success: true, session }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // UPGRADE SESSION (guest to authenticated)
    if (action === 'upgrade') {
      console.log('Upgrading VPN session:', sessionId, 'to user:', userId);

      const { data: session, error: upgradeError } = await supabase
        .from('vpn_sessions')
        .update({
          user_id_hash: userId,
          is_guest: false,
          expires_at: null // Remove expiration
        })
        .eq('id', sessionId)
        .eq('is_guest', true) // Only upgrade guest sessions
        .select()
        .single();

      if (upgradeError) {
        console.error('Error upgrading session:', upgradeError);
        return new Response(
          JSON.stringify({ error: 'Failed to upgrade session' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log audit event
      await supabase.from('vpn_audit').insert({
        event_type: 'upgrade',
        session_id: sessionId,
        user_id_hash: userId,
        meta: { upgraded_from_guest: true }
      });

      console.log('VPN session upgraded:', sessionId);

      return new Response(
        JSON.stringify({ success: true, session }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET STATUS
    if (action === 'status') {
      const { data: session } = await supabase
        .from('vpn_sessions')
        .select('*, vpn_servers(*)')
        .eq('id', sessionId)
        .single();

      return new Response(
        JSON.stringify({ success: true, session }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in vpn-session function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
