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
    const DEFAULT_AUTHOR_ID = '04ff5b92-dde9-427b-9371-e3b2813bcab5'; // Redação ITL Brasil
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { feedId, mode = 'manual' } = await req.json();

    console.log('Starting RSS import for feed:', feedId, 'mode:', mode);

    // Buscar informações do feed
    const { data: feedData, error: feedError } = await supabaseClient
      .from('rss_feeds')
      .select('*')
      .eq('id', feedId)
      .single();

    if (feedError || !feedData) {
      throw new Error(`Feed não encontrado: ${feedError?.message}`);
    }

    // Criar log de importação
    const { data: importLog } = await supabaseClient
      .from('import_logs')
      .insert({
        feed_id: feedId,
        status: 'running',
        import_mode: mode,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    let articlesImported = 0;
    let errorMessage = '';

    try {
      // Buscar conteúdo do RSS feed
      const response = await fetch(feedData.url, {
        headers: {
          'User-Agent': 'ITL Brasil RSS Importer 1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      console.log('RSS content fetched, length:', xmlText.length);

      // Parse simples do XML usando regex
      const itemMatches = xmlText.match(/<item[\s\S]*?<\/item>/gi) || [];
      console.log('Found items:', itemMatches.length);

      const maxArticles = feedData.max_articles_per_import || 5;
      const processedItems = itemMatches.slice(0, maxArticles);

      for (const itemXml of processedItems) {
        try {
          const title = (itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || 
                        itemXml.match(/<title>(.*?)<\/title>/i))?.[1]?.trim() || '';
          
          const description = (itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i) || 
                              itemXml.match(/<description>(.*?)<\/description>/i))?.[1]?.trim() || '';
          
          const link = (itemXml.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>/i) || 
                       itemXml.match(/<link>(.*?)<\/link>/i))?.[1]?.trim() || '';
          
          const pubDate = (itemXml.match(/<pubDate>(.*?)<\/pubDate>/i))?.[1]?.trim() || '';

          // Validações
          if (!title || title.length < (feedData.min_title_length || 10)) {
            console.log('Título muito curto, pulando:', title);
            continue;
          }

          if (!description || description.length < (feedData.min_content_length || 200)) {
            console.log('Conteúdo muito curto, pulando:', title);
            continue;
          }

          // Verificar se já existe
          const { data: existingArticle } = await supabaseClient
            .from('articles')
            .select('id')
            .eq('source_url', link)
            .single();

          if (existingArticle) {
            console.log('Artigo já existe, pulando:', title);
            continue;
          }

          // Gerar slug
          const slug = title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);

          const articleData = {
            title,
            content: description,
            excerpt: description.substring(0, 200) + '...',
            slug: `${slug}-${Date.now()}`,
            source_url: link,
            source_name: feedData.name,
            category_id: feedData.category_id,
            status: feedData.auto_publish ? 'published' : 'draft',
            import_mode: mode,
            published_at: feedData.auto_publish ? new Date().toISOString() : null,
            meta_title: title,
            meta_description: description.substring(0, 160),
            author_id: DEFAULT_AUTHOR_ID,
          };

          if (feedData.review_queue) {
            // Adicionar à fila de revisão
            await supabaseClient
              .from('articles_queue')
              .insert({
                ...articleData,
                feed_id: feedId,
                status: 'pending'
              });
          } else {
            // Adicionar diretamente aos artigos
            await supabaseClient
              .from('articles')
              .insert(articleData);
          }

          articlesImported++;
          console.log('Artigo importado:', title);

        } catch (itemError) {
          console.error('Erro ao processar item:', itemError);
        }
      }

    } catch (importError) {
      errorMessage = importError instanceof Error ? importError.message : String(importError);
      console.error('Erro na importação:', importError);
    }

    // Atualizar log de importação
    await supabaseClient
      .from('import_logs')
      .update({
        status: errorMessage ? 'error' : 'completed',
        articles_imported: articlesImported,
        error_message: errorMessage || null,
        completed_at: new Date().toISOString()
      })
      .eq('id', importLog?.id);

    // Atualizar última importação do feed
    await supabaseClient
      .from('rss_feeds')
      .update({
        last_import: new Date().toISOString()
      })
      .eq('id', feedId);

    return new Response(JSON.stringify({
      success: true,
      articlesImported,
      message: `Importação concluída: ${articlesImported} artigos importados`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função de importação RSS:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});