import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const firebaseServerKey = Deno.env.get('FIREBASE_SERVER_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

interface BroadcastRequest {
  user_ids: string[];
  notification: NotificationPayload;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
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

    // Verificar se o usuário é super_admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isSuperAdmin = roles?.some(r => r.role === 'superadmin');
    if (!isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: 'Only superadmins can broadcast notifications' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { user_ids, notification }: BroadcastRequest = await req.json();

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'user_ids array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!notification || !notification.title || !notification.body) {
      return new Response(
        JSON.stringify({ error: 'notification with title and body is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Broadcasting notification to ${user_ids.length} users`);

    // Buscar tokens FCM ativos dos usuários
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('fcm_token, user_id')
      .in('user_id', user_ids)
      .eq('active', true);

    if (tokensError) {
      console.error('Error fetching tokens:', tokensError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push tokens' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tokens || tokens.length === 0) {
      console.log('No active push tokens found for specified users');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No active tokens found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${tokens.length} active tokens`);

    // Enviar notificações via Firebase Cloud Messaging
    const results = await Promise.allSettled(
      tokens.map(async ({ fcm_token, user_id }) => {
        try {
          const fcmPayload = {
            to: fcm_token,
            notification: {
              title: notification.title,
              body: notification.body,
              icon: notification.icon || '/logo-itl-brasil.png',
              badge: notification.badge || '/logo-itl-brasil.png',
            },
            data: notification.data || {},
          };

          const response = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Authorization': `key=${firebaseServerKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(fcmPayload),
          });

          const result = await response.json();

          if (!response.ok || result.failure === 1) {
            console.error(`Failed to send to ${user_id}:`, result);
            
            // Se o token for inválido, marcar como inativo
            if (result.results?.[0]?.error === 'InvalidRegistration' || 
                result.results?.[0]?.error === 'NotRegistered') {
              await supabase
                .from('push_tokens')
                .update({ active: false })
                .eq('fcm_token', fcm_token);
            }
            
            return { success: false, user_id, error: result };
          }

          console.log(`Notification sent successfully to ${user_id}`);
          return { success: true, user_id };
        } catch (error: any) {
          console.error(`Error sending to ${user_id}:`, error);
          return { success: false, user_id, error: error?.message || 'Unknown error' };
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    console.log(`Broadcast complete: ${successful} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successful, 
        failed,
        total: tokens.length 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in push-broadcast:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
