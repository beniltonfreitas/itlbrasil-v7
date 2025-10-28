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
1. "imagem" = STRING com URL completa da imagem principal (ex: "https://example.com/foto.jpg")
2. "conteudo" = STRING HTML única com TODO o texto (não array, não objeto)
3. "imagens_adicionais" = ARRAY de strings com URLs (ex: ["url1", "url2"]) ou omita se não houver
4. "tags" = EXATAMENTE 12 tags relevantes (nem mais, nem menos)
5. "categoria" = Use APENAS estas categorias válidas: "politica", "economia", "tecnologia", "esportes", "cultura", "saude", "educacao", "internacional", "opiniao", "geral"
6. "slug" = minúsculas, sem acentos, hífens (ex: "economia-brasileira-cresce")
7. NÃO inclua menções ao WhatsApp, Telegram ou redes sociais no conteúdo
8. Use HTML semântico limpo: <p>, <h2>, <h3>, <blockquote>, <strong>, <em>, <ul><li>

FORMATO JSON (copie exatamente esta estrutura):
{
  "noticias": [{
    "titulo": "Título completo da notícia",
    "slug": "titulo-url-friendly",
    "categoria": "politica",
    "resumo": "Resumo em até 160 caracteres",
    "conteudo": "<p>Parágrafo 1 com todo o texto da notícia.</p><p>Parágrafo 2 continuação...</p><h2>Subtítulo</h2><p>Mais conteúdo...</p>",
    "fonte": "Nome do site de origem",
    "imagem": "https://exemplo.com/imagem.jpg",
    "imagem_alt": "Descrição da imagem em 10-140 caracteres",
    "imagem_credito": "Crédito do fotógrafo ou agência",
    "imagens_adicionais": ["https://exemplo.com/img2.jpg", "https://exemplo.com/img3.jpg"],
    "featured": true,
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11", "tag12"],
    "seo": {
      "meta_titulo": "Título SEO até 60 caracteres",
      "meta_descricao": "Descrição SEO até 160 caracteres"
    }
  }]
}`;

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
