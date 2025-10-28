import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotifyRequest {
  title: string;
  body: string;
  url?: string;
  severity?: 'info' | 'warning' | 'critical';
  send_email?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { title, body, url, severity, send_email }: NotifyRequest = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: 'title and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Notifying superadmins: ${title}`);

    // Buscar todos os super_admins
    const { data: superAdmins, error: adminsError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'superadmin');

    if (adminsError) {
      console.error('Error fetching superadmins:', adminsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch superadmins' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!superAdmins || superAdmins.length === 0) {
      console.log('No superadmins found');
      return new Response(
        JSON.stringify({ success: true, message: 'No superadmins found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userIds = superAdmins.map(admin => admin.user_id);
    console.log(`Found ${userIds.length} superadmins`);

    // Montar payload da notificação
    const notificationPayload = {
      user_ids: userIds,
      notification: {
        title,
        body,
        icon: '/logo-itl-brasil.png',
        badge: '/logo-itl-brasil.png',
        data: {
          url: url || '/admin/security',
          type: 'security_alert',
          severity: severity || 'info',
          timestamp: new Date().toISOString(),
        },
      },
    };

    // Chamar push-broadcast (sem autenticação pois é função interna)
    const broadcastResponse = await fetch(
      `${supabaseUrl}/functions/v1/push-broadcast`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify(notificationPayload),
      }
    );

    const broadcastResult = await broadcastResponse.json();

    if (!broadcastResponse.ok) {
      console.error('Failed to broadcast notifications:', broadcastResult);
    } else {
      console.log(`Notifications sent: ${broadcastResult.sent}/${broadcastResult.total}`);
    }

    // TODO: Enviar email se send_email === true
    // Implementar integração com Resend ou outro serviço de email

    return new Response(
      JSON.stringify({ 
        success: true, 
        superadmins_notified: userIds.length,
        push_sent: broadcastResult.sent || 0,
        push_failed: broadcastResult.failed || 0,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in notify-superadmins:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
