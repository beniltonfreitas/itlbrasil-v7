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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { tipo, conteudo, imageUrl } = await req.json();

    // Validate input
    if (!tipo || !['url', 'texto'].includes(tipo)) {
      return new Response(JSON.stringify({ error: 'Tipo inválido. Use "url" ou "texto".' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!conteudo || conteudo.trim() === '') {
      return new Response(JSON.stringify({ error: 'Conteúdo vazio' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user from JWT
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('📥 Adicionando job à fila:', { tipo, userId: user.id });

    // Create job in queue
    const { data: job, error: insertError } = await supabaseClient
      .from('reporter_jobs')
      .insert({
        user_id: user.id,
        input_type: tipo,
        payload: { conteudo, imageUrl },
        status: 'queued',
        progress: 0
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar job:', insertError);
      throw insertError;
    }

    console.log('✅ Job criado com sucesso:', job.id);

    return new Response(JSON.stringify({ 
      jobId: job.id, 
      status: 'queued',
      message: 'Job adicionado à fila de processamento' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro no reporter-queue:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
