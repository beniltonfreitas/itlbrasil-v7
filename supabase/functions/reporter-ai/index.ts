import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { newsUrl, imageUrl } = await req.json();
    
    if (!newsUrl) {
      return new Response(
        JSON.stringify({ error: 'URL da notícia é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('❌ LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Serviço não configurado. Configure LOVABLE_API_KEY nas secrets do Supabase.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔗 Fetching article from:', newsUrl);

    // Validate URL format
    try {
      new URL(newsUrl);
    } catch {
      console.error('❌ Invalid URL format:', newsUrl);
      return new Response(
        JSON.stringify({ error: 'URL inválida. Forneça uma URL completa (com http:// ou https://)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the article content
    let articleContent = '';
    try {
      const articleResponse = await fetch(newsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!articleResponse.ok) {
        throw new Error(`Failed to fetch article: ${articleResponse.status}`);
      }
      
      articleContent = await articleResponse.text();
      console.log('✅ Article fetched successfully, size:', articleContent.length, 'bytes');
    } catch (error) {
      console.error('❌ Error fetching article:', error);
      return new Response(
        JSON.stringify({ error: 'Não foi possível acessar a URL da notícia. Verifique se a URL está correta e acessível.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate JSON using Lovable AI
    const systemPrompt = `Você é um assistente especializado em extrair e formatar notícias jornalísticas.
Extraia as informações da página HTML fornecida e retorne SOMENTE um JSON válido no formato especificado.

REGRAS CRÍTICAS:
1. "imagem" = STRING com URL completa HTTPS da imagem principal (ex: "https://example.com/foto.jpg")
2. "conteudo" = STRING HTML única com TODO o texto formatado (não array, não objeto)
3. "imagens_adicionais" = ARRAY de strings com URLs HTTPS ou omita completamente se não houver
4. "tags" = EXATAMENTE 12 tags relevantes, únicas e minúsculas (nem mais, nem menos)
5. "categoria" = Use EXATAMENTE uma destas (com acento e maiúscula): "Política", "Economia", "Tecnologia", "Esportes", "Cultura", "Saúde", "Educação", "Internacional", "Opinião", "Geral", "Segurança", "Meio Ambiente"
6. "slug" = minúsculas, sem acentos, apenas hífens como separador (ex: "economia-brasileira-cresce")
7. NÃO inclua menções ao WhatsApp, Telegram ou redes sociais no conteúdo
8. Use HTML semântico limpo: <p>, <h2>, <h3>, <blockquote>, <strong>, <em>, <ul><li>
9. "resumo" = máximo 160 caracteres
10. "seo.meta_titulo" = máximo 60 caracteres
11. "seo.meta_descricao" = máximo 160 caracteres
12. "featured" = sempre true para notícias principais

FORMATO JSON EXATO (copie esta estrutura):
{
  "noticias": [{
    "titulo": "Título completo e informativo da notícia",
    "slug": "titulo-da-noticia-sem-acentos",
    "categoria": "Política",
    "resumo": "Resumo conciso da notícia em até 160 caracteres.",
    "conteudo": "<p>Primeiro parágrafo introdutório com as informações principais da notícia.</p><p>Segundo parágrafo com mais detalhes e contexto sobre o acontecimento.</p><h2>Subtítulo Relevante</h2><p>Continuação do texto com informações adicionais.</p><p>Parágrafo final com conclusão ou desdobramentos.</p>",
    "fonte": "Nome do Portal ou Site de Origem",
    "imagem": "https://exemplo.com/path/imagem-principal.jpg",
    "imagem_alt": "Descrição acessível da imagem entre 10-140 caracteres",
    "imagem_credito": "Fotógrafo/Agência",
    "featured": true,
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12"],
    "seo": {
      "meta_titulo": "Título SEO otimizado com até 60 caracteres",
      "meta_descricao": "Descrição SEO atraente e informativa com até 160 caracteres, incluindo palavras-chave relevantes."
    }
  }]
}

IMPORTANTE: Se não houver imagens adicionais no artigo, NÃO inclua o campo "imagens_adicionais" no JSON.`;

    const userPrompt = `Extraia e formate a notícia da seguinte página HTML.
${imageUrl ? `Use esta imagem como imagem principal: ${imageUrl}` : 'Extraia a imagem principal da página.'}

Retorne APENAS o JSON, sem texto adicional antes ou depois.

HTML da página:
${articleContent.slice(0, 50000)}`; // Limit content to avoid token limits

    console.log('🤖 Calling Lovable AI (Gemini 2.5 Flash)...');

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
      console.error('❌ Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Aguarde alguns segundos e tente novamente.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos em Settings → Workspace → Usage.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (aiResponse.status === 401) {
        return new Response(
          JSON.stringify({ error: 'LOVABLE_API_KEY inválida. Verifique as secrets do Supabase.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const generatedText = aiData.choices?.[0]?.message?.content;

    if (!generatedText) {
      console.error('❌ No content generated by AI');
      throw new Error('IA não gerou conteúdo. Tente novamente.');
    }

    console.log('📝 AI Response received, parsing JSON...');
    console.log('Raw AI response length:', generatedText.length);

    // Extract JSON from response (in case AI added extra text)
    let jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in AI response:', generatedText.substring(0, 500));
      throw new Error('IA não retornou JSON válido. Resposta: ' + generatedText.substring(0, 200));
    }

    const parsedJson = JSON.parse(jsonMatch[0]);

    // Validate the structure
    if (!parsedJson.noticias || !Array.isArray(parsedJson.noticias) || parsedJson.noticias.length === 0) {
      console.error('❌ Invalid JSON structure:', parsedJson);
      throw new Error('JSON inválido: campo "noticias" não encontrado ou vazio');
    }

    const noticia = parsedJson.noticias[0];

    // Validate critical fields
    const validCategories = ['Política', 'Economia', 'Tecnologia', 'Esportes', 'Cultura', 'Saúde', 'Educação', 'Internacional', 'Opinião', 'Geral', 'Segurança', 'Meio Ambiente'];
    
    if (!validCategories.includes(noticia.categoria)) {
      console.error('❌ Categoria inválida:', noticia.categoria);
      // Auto-fix: use "Geral" as default
      noticia.categoria = 'Geral';
    }

    if (typeof noticia.imagem !== 'string') {
      console.error('❌ Campo "imagem" deve ser string, recebido:', typeof noticia.imagem);
      throw new Error('Formato inválido: campo "imagem" deve ser uma URL (string)');
    }

    if (typeof noticia.conteudo !== 'string') {
      console.error('❌ Campo "conteudo" deve ser string, recebido:', typeof noticia.conteudo);
      throw new Error('Formato inválido: campo "conteudo" deve ser HTML (string)');
    }

    if (!Array.isArray(noticia.tags) || noticia.tags.length !== 12) {
      console.error('❌ Campo "tags" deve ter exatamente 12 itens, recebido:', noticia.tags?.length);
      // Auto-fix: pad or trim tags to 12
      if (Array.isArray(noticia.tags)) {
        while (noticia.tags.length < 12) {
          noticia.tags.push(`tag${noticia.tags.length + 1}`);
        }
        noticia.tags = noticia.tags.slice(0, 12);
      }
    }

    // Validate SEO fields length
    if (noticia.seo?.meta_titulo && noticia.seo.meta_titulo.length > 60) {
      noticia.seo.meta_titulo = noticia.seo.meta_titulo.substring(0, 60);
    }
    
    if (noticia.seo?.meta_descricao && noticia.seo.meta_descricao.length > 160) {
      noticia.seo.meta_descricao = noticia.seo.meta_descricao.substring(0, 160);
    }
    
    if (noticia.resumo && noticia.resumo.length > 160) {
      noticia.resumo = noticia.resumo.substring(0, 160);
    }

    // Override image if provided by user
    if (imageUrl) {
      noticia.imagem = imageUrl;
      console.log('🖼️ User-provided image URL applied:', imageUrl);
    }

    console.log('✅ Successfully generated and validated JSON for article');

    return new Response(
      JSON.stringify({ 
        success: true,
        json: parsedJson 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in reporter-ai function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar a notícia';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', { errorMessage, errorStack });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorStack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
