import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PublishData {
  type: 'article' | 'webstory';
  title: string;
  summary: string;
  url: string;
  image: string;
  tags: string[];
  author: string;
  published_at: string;
  whatsapp_channel: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const publishData: PublishData = await req.json();
    
    console.log('📱 Recebido pedido de publicação:', {
      type: publishData.type,
      title: publishData.title,
      url: publishData.url,
    });

    // Get webhook URL from environment
    const webhookUrl = Deno.env.get('WHATSAPP_WEBHOOK_URL');
    
    if (!webhookUrl) {
      console.warn('⚠️ WHATSAPP_WEBHOOK_URL não configurada');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Webhook URL não configurada' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Não retornar erro para não bloquear a publicação
        }
      );
    }

    // Format message for N8N/WhatsApp
    const payload = {
      type: publishData.type,
      title: publishData.title,
      summary: publishData.summary,
      url: publishData.url,
      image: publishData.image,
      tags: publishData.tags,
      author: publishData.author,
      published_at: publishData.published_at,
      whatsapp_channel: publishData.whatsapp_channel,
      timestamp: new Date().toISOString(),
    };

    console.log('🚀 Enviando para webhook N8N:', webhookUrl);

    // Send to N8N webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook retornou status ${response.status}`);
    }

    console.log('✅ Webhook enviado com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notificação enviada ao WhatsApp',
        webhook_status: response.status 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Erro ao enviar webhook:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        message: 'Erro ao enviar notificação ao WhatsApp' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Não bloquear a publicação mesmo em caso de erro
      }
    );
  }
});
