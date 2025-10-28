import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔍 Buscando jobs na fila...');

    // Get next job in queue
    const { data: jobs, error: fetchError } = await supabaseAdmin
      .from('reporter_jobs')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(1);

    if (fetchError) throw fetchError;
    
    if (!jobs || jobs.length === 0) {
      console.log('ℹ️ Nenhum job na fila');
      return new Response(JSON.stringify({ message: 'Nenhum job na fila' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const job = jobs[0];
    console.log('🔄 Processando job:', job.id);

    // Mark as processing
    await supabaseAdmin
      .from('reporter_jobs')
      .update({ status: 'processing', progress: 10, updated_at: new Date().toISOString() })
      .eq('id', job.id);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const { conteudo: newsUrl, imageUrl } = job.payload;

    // Fetch article content
    console.log('🌐 Buscando conteúdo de:', newsUrl);
    let articleContent = '';
    
    try {
      const articleResponse = await fetch(newsUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      
      if (!articleResponse.ok) {
        throw new Error(`HTTP ${articleResponse.status}`);
      }
      
      articleContent = await articleResponse.text();
      console.log('✅ Conteúdo obtido:', articleContent.length, 'bytes');
    } catch (error) {
      console.error('❌ Erro ao buscar URL:', error);
      await supabaseAdmin
        .from('reporter_jobs')
        .update({ 
          status: 'error', 
          error: `Erro ao buscar URL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);
      
      return new Response(JSON.stringify({ error: 'Erro ao buscar URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update progress: content fetched
    await supabaseAdmin
      .from('reporter_jobs')
      .update({ progress: 40, updated_at: new Date().toISOString() })
      .eq('id', job.id);

    // Call Lovable AI
    const systemPrompt = `Você é um assistente especializado em extrair e formatar notícias jornalísticas.
Extraia as informações da página HTML fornecida e retorne SOMENTE um JSON válido no formato especificado.

REGRAS CRÍTICAS:
1. "imagem" = STRING com URL completa HTTPS da imagem principal (ex: "https://example.com/foto.jpg")
2. "conteudo" = STRING HTML única com TODO o texto formatado (não array, não objeto)
3. "imagens_adicionais" = ARRAY de strings com URLs HTTPS ou omita completamente se não houver
4. "tags" = EXATAMENTE 12 tags relevantes, únicas e minúsculas (nem mais, nem menos)
5. "categoria" = Use EXATAMENTE uma destas: "Política", "Economia", "Tecnologia", "Esportes", "Cultura", "Saúde", "Educação", "Internacional", "Opinião", "Geral", "Segurança", "Meio Ambiente"
6. "slug" = minúsculas, sem acentos, apenas hífens como separador
7. NÃO inclua menções ao WhatsApp, Telegram ou redes sociais no conteúdo
8. Use HTML semântico: <p>, <h2>, <h3>, <blockquote>, <strong>, <em>, <ul><li>
9. "resumo" = máximo 160 caracteres
10. "seo.meta_titulo" = máximo 60 caracteres
11. "seo.meta_descricao" = máximo 160 caracteres
12. "featured" = sempre true para notícias principais

FORMATO JSON EXATO:
{
  "noticias": [{
    "titulo": "Título completo e informativo",
    "slug": "titulo-sem-acentos",
    "categoria": "Política",
    "resumo": "Resumo em até 160 caracteres.",
    "conteudo": "<p>Parágrafo 1.</p><p>Parágrafo 2.</p><h2>Subtítulo</h2><p>Mais texto.</p>",
    "fonte": "Nome do Portal",
    "imagem": "https://exemplo.com/imagem.jpg",
    "imagem_alt": "Descrição acessível da imagem",
    "imagem_credito": "Fotógrafo/Agência",
    "featured": true,
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12"],
    "seo": {
      "meta_titulo": "Título SEO com até 60 caracteres",
      "meta_descricao": "Descrição SEO com até 160 caracteres."
    }
  }]
}`;

    const userPrompt = `Extraia e formate a notícia da seguinte página HTML.
${imageUrl ? `Use esta imagem como imagem principal: ${imageUrl}` : 'Extraia a imagem principal da página.'}

Retorne APENAS o JSON, sem texto adicional.

HTML da página:
${articleContent.slice(0, 50000)}`;

    console.log('🤖 Chamando Lovable AI...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('❌ Erro da IA:', aiResponse.status, errorText);
      
      await supabaseAdmin
        .from('reporter_jobs')
        .update({ 
          status: 'error', 
          error: `Erro AI: ${aiResponse.status} - ${errorText}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);
      
      return new Response(JSON.stringify({ error: 'Erro na IA' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update progress: AI processing done
    await supabaseAdmin
      .from('reporter_jobs')
      .update({ progress: 80, updated_at: new Date().toISOString() })
      .eq('id', job.id);

    const aiData = await aiResponse.json();
    const generatedText = aiData.choices?.[0]?.message?.content;
    
    if (!generatedText) {
      throw new Error('IA não gerou conteúdo');
    }

    console.log('📝 Resposta da IA recebida');

    // Extract JSON from response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ JSON não encontrado na resposta');
      throw new Error('JSON não encontrado na resposta da IA');
    }

    const parsedJson = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!parsedJson.noticias || !Array.isArray(parsedJson.noticias) || parsedJson.noticias.length === 0) {
      throw new Error('JSON inválido: campo "noticias" não encontrado ou vazio');
    }

    const noticia = parsedJson.noticias[0];

    // Validate and fix critical fields
    const validCategories = ['Política', 'Economia', 'Tecnologia', 'Esportes', 'Cultura', 'Saúde', 'Educação', 'Internacional', 'Opinião', 'Geral', 'Segurança', 'Meio Ambiente'];
    if (!validCategories.includes(noticia.categoria)) {
      noticia.categoria = 'Geral';
    }

    // Ensure exactly 12 tags
    if (!Array.isArray(noticia.tags) || noticia.tags.length !== 12) {
      if (Array.isArray(noticia.tags)) {
        while (noticia.tags.length < 12) {
          noticia.tags.push(`tag${noticia.tags.length + 1}`);
        }
        noticia.tags = noticia.tags.slice(0, 12);
      } else {
        noticia.tags = Array.from({ length: 12 }, (_, i) => `tag${i + 1}`);
      }
    }

    // Trim SEO fields
    if (noticia.seo?.meta_titulo && noticia.seo.meta_titulo.length > 60) {
      noticia.seo.meta_titulo = noticia.seo.meta_titulo.substring(0, 60);
    }
    if (noticia.seo?.meta_descricao && noticia.seo.meta_descricao.length > 160) {
      noticia.seo.meta_descricao = noticia.seo.meta_descricao.substring(0, 160);
    }
    if (noticia.resumo && noticia.resumo.length > 160) {
      noticia.resumo = noticia.resumo.substring(0, 160);
    }

    // Override image if provided
    if (imageUrl) {
      noticia.imagem = imageUrl;
    }

    // Save result
    await supabaseAdmin
      .from('reporter_jobs')
      .update({ 
        status: 'done', 
        progress: 100,
        result: parsedJson,
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id);

    console.log('✅ Job concluído:', job.id);

    return new Response(JSON.stringify({ 
      success: true, 
      jobId: job.id,
      message: 'Job processado com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro no reporter-worker:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
