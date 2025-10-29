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

  try {
    const { items }: BatchRequest = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 10) {
      return new Response(
        JSON.stringify({ error: 'Envie de 1 a 10 itens no formato { items: [{ newsUrl, imageUrl? }] }' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validar URLs
    for (const item of items) {
      if (!item.newsUrl || !item.newsUrl.match(/^https?:\/\/.+/)) {
        return new Response(
          JSON.stringify({ error: `URL inválida: ${item.newsUrl}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const noticias = [];
    const failed = [];

    for (const item of items) {
      try {
        console.log(`Processando: ${item.newsUrl}`);

        // Fetch HTML da notícia
        const htmlResponse = await fetch(item.newsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!htmlResponse.ok) {
          failed.push({ url: item.newsUrl, reason: `HTTP ${htmlResponse.status}` });
          continue;
        }

        const html = await htmlResponse.text();

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
            console.log(`Rate limit (429) no item ${item.newsUrl}, aguardando 3s...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            attempt++;
            continue;
          }

          if (aiResponse.status === 402) {
            return new Response(
              JSON.stringify({ error: 'Créditos insuficientes no Lovable AI. Adicione créditos em Settings > Workspace > Usage.' }),
              { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          break;
        }

        if (!aiResponse || !aiResponse.ok) {
          const errorText = await aiResponse?.text();
          console.error(`Erro na IA para ${item.newsUrl}:`, errorText);
          failed.push({ url: item.newsUrl, reason: `IA error: ${aiResponse?.status}` });
          continue;
        }

        const aiData = await aiResponse.json();
        let jsonText = aiData.choices?.[0]?.message?.content;

        if (!jsonText) {
          failed.push({ url: item.newsUrl, reason: 'Resposta vazia da IA' });
          continue;
        }

        // Limpar markdown
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        let parsed;
        try {
          parsed = JSON.parse(jsonText);
        } catch (e) {
          console.error(`Erro ao parsear JSON de ${item.newsUrl}:`, e);
          failed.push({ url: item.newsUrl, reason: 'JSON inválido' });
          continue;
        }

        // Validar e normalizar
        if (!parsed.noticias || !Array.isArray(parsed.noticias) || parsed.noticias.length === 0) {
          failed.push({ url: item.newsUrl, reason: 'JSON sem array noticias' });
          continue;
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

          noticias.push(noticia);
        }

      } catch (error) {
        console.error(`Erro ao processar ${item.newsUrl}:`, error);
        failed.push({ url: item.newsUrl, reason: error.message });
      }
    }

    if (noticias.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Nenhuma notícia foi processada com sucesso',
          failed 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = {
      success: true,
      json: { noticias },
      ...(failed.length > 0 && { failed })
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no reporter-batch:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
