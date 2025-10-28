import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, eventType, eventData, viewerCount, platform } = await req.json();

    if (!sessionId || !eventType) {
      return new Response(
        JSON.stringify({ error: 'Session ID and event type are required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Record the analytics event
    const { data, error } = await supabase
      .from('stream_analytics')
      .insert([{
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData || {},
        viewer_count: viewerCount || 0,
        platform: platform || null
      }])
      .select()
      .single();

    if (error) {
      console.error('Analytics error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to record analytics' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update the session with current viewer count if provided
    if (viewerCount !== undefined) {
      const { error: updateError } = await supabase
        .from('studio_sessions')
        .update({ viewer_count: viewerCount })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Session update error:', updateError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        analytics: data 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Stream analytics error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});