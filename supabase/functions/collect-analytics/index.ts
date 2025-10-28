import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { 
      event_type, 
      article_id,
      source,
      metadata = {} 
    } = await req.json();

    console.log('Collecting analytics:', { event_type, article_id, source });

    // Capturar informações do cliente
    const userAgent = req.headers.get('user-agent') || '';
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIP || 'unknown';

    // Inserir dados de analytics
    const { error: analyticsError } = await supabaseClient
      .from('article_analytics')
      .insert({
        event_type,
        article_id: article_id || null,
        source: source || 'web',
        ip_address: ip !== 'unknown' ? ip : null,
        user_agent: userAgent,
        created_at: new Date().toISOString()
      });

    if (analyticsError) {
      console.error('Erro ao inserir analytics:', analyticsError);
    }

    // Se for visualização de artigo, incrementar contador
    if (event_type === 'page_view' && article_id) {
      const { error: viewError } = await supabaseClient
        .rpc('increment_article_views', { 
          article_id: article_id 
        });

      if (viewError) {
        console.error('Erro ao incrementar visualizações:', viewError);
      }
    }

    // Coletar estatísticas diárias se for necessário
    if (event_type === 'daily_stats') {
      const { error: statsError } = await supabaseClient
        .rpc('collect_daily_statistics');

      if (statsError) {
        console.error('Erro ao coletar estatísticas diárias:', statsError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Analytics coletado com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função de analytics:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});