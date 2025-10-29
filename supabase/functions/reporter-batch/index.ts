import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface BatchItem {
  newsUrl: string;
  imageUrl?: string;
}

interface BatchRequest {
  items: BatchItem[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('[reporter-batch] Iniciando requisição');

  try {
    const { items }: BatchRequest = await req.json();
    console.log(`[reporter-batch] Recebidos ${items?.length || 0} itens`);

    if (!LOVABLE_API_KEY) {
      console.error('[reporter-batch] LOVABLE_API_KEY não configurada');
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 10) {
      console.error('[reporter-batch] Quantidade inválida de itens:', items?.length);
      return new Response(
        JSON.stringify({ error: 'Envie de 1 a 10 itens no formato { items: [{ newsUrl, imageUrl? }] }' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar URLs
    for (const item of items) {
      if (!item.newsUrl || !item.newsUrl.match(/^https?:\/\/.+/)) {
        console.error('[reporter-batch] URL inválida:', item.newsUrl);
        return new Response(
          JSON.stringify({ error: `URL inválida: ${item.newsUrl}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Timeout de 50 segundos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: processamento excedeu 50 segundos')), 50000)
    );

    // Processar todos os itens em paralelo com Promise.allSettled
    console.log('[reporter-batch] Iniciando processamento paralelo');
    const processItem = async (item: BatchItem) => {
      const itemStartTime = Date.now();
      console.log(`[reporter-batch] Processando: ${item.newsUrl}`);

      try {
        // Fetch HTML da notícia
        const htmlResponse = await fetch(item.newsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!htmlResponse.ok) {
          console.error(`[reporter-batch] Falha ao buscar ${item.newsUrl}: HTTP ${htmlResponse.status}`);
          return { success: false, url: item.newsUrl, reason: `HTTP ${htmlResponse.status}` };
        }

        const html = await htmlResponse.text();
        console.log(`[reporter-batch] HTML obtido de ${item.newsUrl} (${html.length} chars)`);

        // Prompt para Lovable AI (Gemini 2.5 Flash)
        const systemPrompt = `Você é o Repórter Pró, gerador de JSON Premium v2.1 para o portal ITL Brasil.

REGRAS CRÍTICAS DE FORMATAÇÃO:
1. imagem DEVE ser um OBJETO com as chaves: hero, og, card, alt, credito
2. tags DEVE ser um ARRAY com EXATAMENTE 12 strings (não objeto, não duplicadas)
3. conteudo DEVE ser uma STRING HTML (não array, não objeto)
4. categoria deve ser uma das: Geral, Política, Economia, Esportes, Cultura, Tecnologia, Saúde, Educação, Meio Ambiente, Internacional
5. slug deve ser gerado a partir do título (minúsculas, sem acentos, separado por hífens)
6. resumo: máximo 160 caracteres
7. meta_titulo: máximo 60 caracteres
8. meta_descricao: máximo 160 caracteres
9. fonte: URL completa da matéria original
10. conteudo: HTML semântico com <p>, <h2>, <blockquote>, etc.

FORMATO DE SAÍDA OBRIGATÓRIO:
{
  "noticias": [{
    "categoria": "string",
    "titulo": "string",
    "slug": "string",
    "resumo": "string (max 160 chars)",
    "conteudo": "string HTML",
    "fonte": "url completa",
    "imagem": {
      "hero": "https://...",
      "og": "https://...",
      "card": "https://...",
      "alt": "descrição da imagem",
      "credito": "Foto: autor/fonte"
    },
    "tags": ["tag1", "tag2", ... 12 tags],
    "seo": {
      "meta_titulo": "string (max 60 chars)",
      "meta_descricao": "string (max 160 chars)"
    }
  }]
}`;

        const userPrompt = `Extraia a notícia do HTML abaixo e gere o JSON no formato especificado.
${item.imageUrl ? `\nIMPORTANTE: Use esta imagem para hero/og/card: ${item.imageUrl}` : ''}

HTML da página:
${html.substring(0, 50000)}`;

        console.log(`[reporter-batch] Chamando IA para ${item.newsUrl}`);
        let attempt = 0;
        let aiResponse;
        
        while (attempt < 2) {
          aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              ],
            }),
          });

          if (aiResponse.status === 429) {
            console.log(`[reporter-batch] Rate limit (429) no item ${item.newsUrl}, aguardando 3s...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            attempt++;
            continue;
          }

          if (aiResponse.status === 402) {
            console.error('[reporter-batch] Créditos insuficientes');
            throw new Error('CREDITS_INSUFFICIENT');
          }

          break;
        }

        if (!aiResponse || !aiResponse.ok) {
          const errorText = await aiResponse?.text();
          console.error(`[reporter-batch] Erro na IA para ${item.newsUrl}:`, errorText);
          return { success: false, url: item.newsUrl, reason: `IA error: ${aiResponse?.status}` };
        }

        console.log(`[reporter-batch] IA respondeu para ${item.newsUrl}`);

        const aiData = await aiResponse.json();
        let jsonText = aiData.choices?.[0]?.message?.content;

        if (!jsonText) {
          console.error(`[reporter-batch] Resposta vazia da IA para ${item.newsUrl}`);
          return { success: false, url: item.newsUrl, reason: 'Resposta vazia da IA' };
        }

        // Limpar markdown
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let parsed;
        try {
          parsed = JSON.parse(jsonText);
        } catch (e) {
          console.error(`[reporter-batch] Erro ao parsear JSON de ${item.newsUrl}:`, e);
          return { success: false, url: item.newsUrl, reason: 'JSON inválido' };
        }

        // Validar e normalizar
        if (!parsed.noticias || !Array.isArray(parsed.noticias) || parsed.noticias.length === 0) {
          console.error(`[reporter-batch] JSON sem array noticias para ${item.newsUrl}`);
          return { success: false, url: item.newsUrl, reason: 'JSON sem array noticias' };
        }

        for (const noticia of parsed.noticias) {
          // Categoria
          const categoriasValidas = ['Geral', 'Política', 'Economia', 'Esportes', 'Cultura', 'Tecnologia', 'Saúde', 'Educação', 'Meio Ambiente', 'Internacional'];
          if (!categoriasValidas.includes(noticia.categoria)) {
            noticia.categoria = 'Geral';
          }

          // Imagem: garantir objeto com hero/og/card/alt/credito
          if (item.imageUrl) {
            noticia.imagem = {
              hero: item.imageUrl,
              og: item.imageUrl,
              card: item.imageUrl,
              alt: noticia.imagem?.alt || 'Imagem da notícia',
              credito: noticia.imagem?.credito || 'Divulgação'
            };
          } else if (typeof noticia.imagem === 'string') {
            noticia.imagem = {
              hero: noticia.imagem,
              og: noticia.imagem,
              card: noticia.imagem,
              alt: 'Imagem da notícia',
              credito: 'Divulgação'
            };
          } else if (!noticia.imagem || typeof noticia.imagem !== 'object') {
            noticia.imagem = {
              hero: 'https://via.placeholder.com/1170x700',
              og: 'https://via.placeholder.com/1200x630',
              card: 'https://via.placeholder.com/800x450',
              alt: 'Imagem da notícia',
              credito: 'Divulgação'
            };
          }

          // Tags: garantir array com 12 itens
          if (!Array.isArray(noticia.tags)) {
            noticia.tags = [];
          }
          while (noticia.tags.length < 12) {
            noticia.tags.push(noticia.categoria.toLowerCase());
          }
          noticia.tags = noticia.tags.slice(0, 12);

          // SEO: truncar
          if (noticia.seo) {
            if (noticia.seo.meta_titulo && noticia.seo.meta_titulo.length > 60) {
              noticia.seo.meta_titulo = noticia.seo.meta_titulo.substring(0, 57) + '...';
            }
            if (noticia.seo.meta_descricao && noticia.seo.meta_descricao.length > 160) {
              noticia.seo.meta_descricao = noticia.seo.meta_descricao.substring(0, 157) + '...';
            }
          }

          // Resumo: truncar
          if (noticia.resumo && noticia.resumo.length > 160) {
            noticia.resumo = noticia.resumo.substring(0, 157) + '...';
          }

          // Fonte
          noticia.fonte = item.newsUrl;
        }

        const itemTime = Date.now() - itemStartTime;
        console.log(`[reporter-batch] Item ${item.newsUrl} processado com sucesso em ${itemTime}ms`);
        
        return { success: true, noticias: parsed.noticias };

      } catch (error) {
        console.error(`[reporter-batch] Erro ao processar ${item.newsUrl}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        if (errorMessage === 'CREDITS_INSUFFICIENT') {
          throw error; // Propagar erro de créditos
        }
        return { success: false, url: item.newsUrl, reason: errorMessage };
      }
    };

    // Processar todos os itens em paralelo
    const processingPromise = Promise.allSettled(
      items.map(item => processItem(item))
    );

    // Race entre processamento e timeout
    const results = await Promise.race([processingPromise, timeoutPromise]) as PromiseSettledResult<any>[];

    const noticias: any[] = [];
    const failed: any[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.success) {
        noticias.push(...result.value.noticias);
      } else if (result.status === 'fulfilled' && !result.value.success) {
        failed.push({ url: result.value.url, reason: result.value.reason });
      } else if (result.status === 'rejected') {
        console.error('[reporter-batch] Promise rejeitada:', result.reason);
        failed.push({ url: 'unknown', reason: result.reason?.message || 'Erro desconhecido' });
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`[reporter-batch] Processamento concluído em ${totalTime}ms: ${noticias.length} sucesso, ${failed.length} falhas`);

    if (noticias.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Nenhuma notícia foi processada com sucesso',
          failed 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resultData = {
      success: true,
      json: { noticias },
      ...(failed.length > 0 && { failed })
    };

    return new Response(JSON.stringify(resultData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[reporter-batch] Erro geral:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    if (errorMessage === 'CREDITS_INSUFFICIENT') {
      return new Response(
        JSON.stringify({ error: 'Créditos insuficientes no Lovable AI. Adicione créditos em Settings > Workspace > Usage.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (errorMessage.includes('Timeout')) {
      return new Response(
        JSON.stringify({ error: 'Timeout: o processamento está demorando muito. Tente com menos itens.' }),
        { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
