import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image?: string;
}

function parseRSS(xmlText: string): RSSItem[] {
  const items: RSSItem[] = [];
  
  // Find all <item> blocks
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let itemMatch;
  
  while ((itemMatch = itemRegex.exec(xmlText)) !== null) {
    const itemContent = itemMatch[1];
    
    // Extract title
    const titleMatch = itemContent.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    
    // Extract link
    const linkMatch = itemContent.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    const link = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    
    // Extract description
    const descMatch = itemContent.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const description = descMatch ? descMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim() : '';
    
    // Extract pubDate
    const dateMatch = itemContent.match(/<pubDate[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);
    const pubDate = dateMatch ? dateMatch[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
    
    // Extract image from various sources
    let image = '';
    const mediaContentMatch = itemContent.match(/<media:content[^>]*url=["']([^"']+)["']/i);
    const enclosureMatch = itemContent.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image/i);
    const mediaThumbMatch = itemContent.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i);
    const imgInDesc = description.match(/<img[^>]*src=["']([^"']+)["']/i);
    
    if (mediaContentMatch) {
      image = mediaContentMatch[1];
    } else if (enclosureMatch) {
      image = enclosureMatch[1];
    } else if (mediaThumbMatch) {
      image = mediaThumbMatch[1];
    } else if (imgInDesc) {
      image = imgInDesc[1];
    }
    
    if (title && link) {
      items.push({ title, link, description, pubDate, image });
    }
  }
  
  return items;
}

async function fetchArticleContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract article content - try common patterns
    let content = '';
    
    // Try to find article body
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
      content = articleMatch[1];
    } else {
      // Try main content
      const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
      if (mainMatch) {
        content = mainMatch[1];
      } else {
        // Try common content divs
        const contentMatch = html.match(/<div[^>]*class="[^"]*(?:content|post|article|entry|text)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
        if (contentMatch) {
          content = contentMatch[1];
        }
      }
    }
    
    // Clean up HTML
    content = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000);
    
    return content;
  } catch (error) {
    console.error('Error fetching article:', error);
    return '';
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

async function generateArticleJson(
  url: string, 
  title: string, 
  feedName: string,
  openaiApiKey: string
): Promise<any> {
  const content = await fetchArticleContent(url);
  
  if (!content || content.length < 100) {
    console.log('Content too short, using basic generation');
    return {
      titulo: title,
      slug: generateSlug(title),
      resumo: title,
      conteudo: `<p>${title}</p>`,
      categoria: 'Geral',
      tags: [],
      fonte_nome: feedName,
      fonte_url: url
    };
  }
  
  const prompt = `Você é um jornalista profissional. Analise o conteúdo abaixo e gere um JSON com a notícia reescrita.

CONTEÚDO ORIGINAL:
Título: ${title}
Fonte: ${feedName}
URL: ${url}
Texto: ${content.substring(0, 5000)}

GERE UM JSON com esta estrutura exata:
{
  "titulo": "Título reescrito em português, máximo 100 caracteres",
  "slug": "slug-url-amigavel",
  "resumo": "Resumo de 150-200 caracteres",
  "conteudo": "<p>Conteúdo em HTML com parágrafos. Mínimo 3 parágrafos.</p>",
  "categoria": "Uma das: Política, Economia, Tecnologia, Esportes, Cultura, Internacional, Brasil, Saúde, Educação, Meio Ambiente, Geral",
  "tags": ["tag1", "tag2", "tag3"],
  "fonte_nome": "${feedName}",
  "fonte_url": "${url}"
}

IMPORTANTE:
- Reescreva completamente o texto com suas próprias palavras
- Use português brasileiro formal
- O conteúdo deve ser original e jornalístico
- Retorne APENAS o JSON, sem explicações`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um jornalista profissional que reescreve notícias. Responda apenas com JSON válido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices[0]?.message?.content || '';
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('No valid JSON in response');
  } catch (error) {
    console.error('Error generating article JSON:', error);
    return {
      titulo: title,
      slug: generateSlug(title),
      resumo: title,
      conteudo: `<p>${content.substring(0, 500)}</p>`,
      categoria: 'Geral',
      tags: [],
      fonte_nome: feedName,
      fonte_url: url
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, feedUrl, feedId, feedName, quantity, articleUrl, articleTitle } = await req.json();
    
    console.log(`[rss-to-json] Action: ${action}`);

    if (action === 'fetch-feed') {
      // Fetch RSS feed and return articles
      console.log(`[rss-to-json] Fetching feed: ${feedUrl}`);
      
      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.status}`);
      }

      const xmlText = await response.text();
      const items = parseRSS(xmlText);
      
      // Limit to requested quantity
      const limitedItems = items.slice(0, quantity || 5);
      
      console.log(`[rss-to-json] Found ${items.length} items, returning ${limitedItems.length}`);

      return new Response(JSON.stringify({ 
        success: true,
        articles: limitedItems.map(item => ({
          title: item.title,
          link: item.link,
          description: item.description?.substring(0, 200) || '',
          pubDate: item.pubDate,
          image: item.image
        }))
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'generate-json') {
      // Generate JSON for a single article
      console.log(`[rss-to-json] Generating JSON for: ${articleUrl}`);
      
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openaiApiKey) {
        throw new Error('OPENAI_API_KEY not configured');
      }

      const article = await generateArticleJson(articleUrl, articleTitle, feedName, openaiApiKey);

      return new Response(JSON.stringify({ 
        success: true,
        article 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid action' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[rss-to-json] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
