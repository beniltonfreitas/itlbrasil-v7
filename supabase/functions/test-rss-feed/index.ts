import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestResult {
  status: 'success' | 'error' | 'timeout' | 'invalid_content'
  httpStatus?: number
  responseTimeMs: number
  errorMessage?: string
  contentPreview?: string
  articlesFound: number
  lastArticleDate?: string
}

async function testRSSFeed(url: string): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    // Teste de conectividade com timeout de 10 segundos
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'RSS Feed Tester/1.0'
      }
    })
    
    clearTimeout(timeoutId)
    const responseTimeMs = Date.now() - startTime
    
    if (!response.ok) {
      return {
        status: 'error',
        httpStatus: response.status,
        responseTimeMs,
        errorMessage: `HTTP ${response.status}: ${response.statusText}`,
        articlesFound: 0
      }
    }
    
    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('xml') && !contentType.includes('rss')) {
      return {
        status: 'invalid_content',
        httpStatus: response.status,
        responseTimeMs,
        errorMessage: `Content-Type inválido: ${contentType}`,
        articlesFound: 0
      }
    }
    
    const xmlText = await response.text()
    
    // Verificação básica se é XML/RSS - usando análise de string simples
    try {
      // Verificar se contém estrutura básica de RSS/XML
      if (!xmlText.includes('<') || !xmlText.includes('>')) {
        return {
          status: 'invalid_content',
          httpStatus: response.status,
          responseTimeMs,
          errorMessage: 'Não é um documento XML válido',
          articlesFound: 0
        }
      }

      // Verificar se é RSS/Atom válido (busca básica por tags)
      const isRSS = xmlText.includes('<rss') || xmlText.includes('<feed') || xmlText.includes('<channel');
      if (!isRSS) {
        return {
          status: 'invalid_content',
          httpStatus: response.status,
          responseTimeMs,
          errorMessage: 'Não é um feed RSS/Atom válido',
          articlesFound: 0
        }
      }
      
      // Contar artigos usando regex simples
      const itemMatches = xmlText.match(/<item[\s>]|<entry[\s>]/gi) || [];
      const articlesFound = itemMatches.length;
      
      // Buscar data do último artigo usando regex
      let lastArticleDate: string | undefined;
      const dateMatch = xmlText.match(/<pubDate[^>]*>([^<]+)<\/pubDate>|<published[^>]*>([^<]+)<\/published>|<updated[^>]*>([^<]+)<\/updated>/i);
      if (dateMatch) {
        const dateString = dateMatch[1] || dateMatch[2] || dateMatch[3];
        try {
          lastArticleDate = new Date(dateString.trim()).toISOString();
        } catch {
          // Ignorar se não conseguir parsear a data
        }
      }
      
      // Preview do conteúdo (primeiros 500 caracteres)
      const contentPreview = xmlText.substring(0, 500) + (xmlText.length > 500 ? '...' : '');
      
      return {
        status: 'success',
        httpStatus: response.status,
        responseTimeMs,
        contentPreview,
        articlesFound,
        lastArticleDate
      }
      
    } catch (parseError: any) {
      return {
        status: 'invalid_content',
        httpStatus: response.status,
        responseTimeMs,
        errorMessage: `Erro ao analisar conteúdo: ${parseError?.message || 'Erro desconhecido'}`,
        articlesFound: 0
      }
    }
    
  } catch (error: any) {
    const responseTimeMs = Date.now() - startTime
    
    if (error?.name === 'AbortError') {
      return {
        status: 'timeout',
        responseTimeMs,
        errorMessage: 'Timeout após 10 segundos',
        articlesFound: 0
      }
    }
    
    return {
      status: 'error',
      responseTimeMs,
      errorMessage: error?.message || 'Erro desconhecido',
      articlesFound: 0
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      })
    }

    const { feedId, feedUrl, testAll } = await req.json()

    if (testAll) {
      // Testar todos os feeds nativos
      const { data: feeds, error: feedsError } = await supabaseClient
        .from('rss_feeds')
        .select('id, name, url')
        .eq('is_native', true)
        .order('name')

      if (feedsError) {
        throw new Error(`Erro ao buscar feeds: ${feedsError.message}`)
      }

      const results = []
      
      for (const feed of feeds) {
        console.log(`Testando feed: ${feed.name}`)
        const testResult = await testRSSFeed(feed.url)
        
        // Salvar resultado no banco
        const { error: insertError } = await supabaseClient
          .from('feed_test_results')
          .insert({
            feed_id: feed.id,
            status: testResult.status,
            http_status: testResult.httpStatus,
            response_time_ms: testResult.responseTimeMs,
            error_message: testResult.errorMessage,
            content_preview: testResult.contentPreview,
            articles_found: testResult.articlesFound,
            last_article_date: testResult.lastArticleDate
          })

        if (insertError) {
          console.error(`Erro ao salvar resultado do feed ${feed.name}:`, insertError)
        }

        results.push({
          feedId: feed.id,
          feedName: feed.name,
          feedUrl: feed.url,
          ...testResult
        })
      }

      return new Response(JSON.stringify({ 
        success: true, 
        totalTested: feeds.length,
        results 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
      
    } else if (feedId && feedUrl) {
      // Testar feed específico
      console.log(`Testando feed específico: ${feedUrl}`)
      const testResult = await testRSSFeed(feedUrl)
      
      // Salvar resultado no banco
      const { error: insertError } = await supabaseClient
        .from('feed_test_results')
        .insert({
          feed_id: feedId,
          status: testResult.status,
          http_status: testResult.httpStatus,
          response_time_ms: testResult.responseTimeMs,
          error_message: testResult.errorMessage,
          content_preview: testResult.contentPreview,
          articles_found: testResult.articlesFound,
          last_article_date: testResult.lastArticleDate
        })

      if (insertError) {
        console.error('Erro ao salvar resultado:', insertError)
      }

      return new Response(JSON.stringify({ 
        success: true, 
        result: testResult 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
      
    } else {
      return new Response('Parâmetros inválidos. Forneça feedId+feedUrl ou testAll=true', {
        status: 400,
        headers: corsHeaders
      })
    }

  } catch (error: any) {
    console.error('Erro na função de teste:', error)
    return new Response(JSON.stringify({ 
      error: error?.message || 'Erro desconhecido' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})