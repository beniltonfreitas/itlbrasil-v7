import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
  guid?: string;
  content?: string;
  featuredImage?: string;
}

interface RSSFeed {
  title: string;
  description: string;
  items: RSSItem[];
}

// Simple RSS/XML parser with improved image extraction
function parseRSS(xmlText: string): RSSFeed {
  // Remove XML declarations and clean up
  const cleanXml = xmlText.replace(/<\?xml[^>]*\?>/i, '').trim();
  
  // Extract channel info
  const titleMatch = cleanXml.match(/<title[^>]*>(.*?)<\/title>/i);
  const descriptionMatch = cleanXml.match(/<description[^>]*>(.*?)<\/description>/i);
  
  const title = titleMatch ? titleMatch[1].trim() : 'Unknown Feed';
  const description = descriptionMatch ? descriptionMatch[1].trim() : '';
  
  // Extract items
  const itemMatches = cleanXml.match(/<item[^>]*>(.*?)<\/item>/gis) || [];
  
  const items: RSSItem[] = itemMatches.map(itemXml => {
    const itemTitle = itemXml.match(/<title[^>]*>(.*?)<\/title>/i)?.[1]?.trim() || '';
    const itemLink = itemXml.match(/<link[^>]*>(.*?)<\/link>/i)?.[1]?.trim() || '';
    const itemDescription = itemXml.match(/<description[^>]*>(.*?)<\/description>/i)?.[1]?.trim() || '';
    const itemPubDate = itemXml.match(/<pubDate[^>]*>(.*?)<\/pubDate>/i)?.[1]?.trim() || '';
    const itemGuid = itemXml.match(/<guid[^>]*>(.*?)<\/guid>/i)?.[1]?.trim() || '';
    
    // Try to get content from content:encoded or description
    let content = itemXml.match(/<content:encoded[^>]*>(.*?)<\/content:encoded>/i)?.[1]?.trim() ||
                  itemXml.match(/<content[^>]*>(.*?)<\/content>/i)?.[1]?.trim() ||
                  itemDescription;

    // Enhanced image extraction for different RSS formats
    let featuredImage = '';
    
    // 1. Agência Brasil specific tag
    featuredImage = itemXml.match(/<imagem-destaque[^>]*>(.*?)<\/imagem-destaque>/i)?.[1]?.trim() || '';
    
    // 2. Media RSS namespace (common in news feeds)
    if (!featuredImage) {
      featuredImage = itemXml.match(/<media:content[^>]*url=["']([^"']+)["'][^>]*>/i)?.[1]?.trim() || 
                      itemXml.match(/<media:thumbnail[^>]*url=["']([^"']+)["'][^>]*>/i)?.[1]?.trim() || '';
    }
    
    // 3. Enclosure tags (for podcasts and media)
    if (!featuredImage) {
      const enclosureMatch = itemXml.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image\/[^"']*["'][^>]*>/i);
      featuredImage = enclosureMatch ? enclosureMatch[1].trim() : '';
    }
    
    // 4. Look for images in description or content
    if (!featuredImage && content) {
      const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      featuredImage = imgMatch ? imgMatch[1].trim() : '';
    }
    
    // 5. WordPress/generic RSS image tags
    if (!featuredImage) {
      featuredImage = itemXml.match(/<image[^>]*>(.*?)<\/image>/i)?.[1]?.trim() ||
                      itemXml.match(/<wfw:image[^>]*>(.*?)<\/wfw:image>/i)?.[1]?.trim() || '';
    }

    // Add credits to Agência Brasil content
    if (content && (content.includes('agenciabrasil.ebc.com.br') || content.includes('EBC'))) {
      content = content + '\n\n---\n\n*Fonte: Agência Brasil - Empresa Brasil de Comunicação (EBC)*';
    }

    // Clean up HTML tags for excerpt
    const cleanDescription = itemDescription
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 300);

    return {
      title: itemTitle,
      link: itemLink,
      description: cleanDescription,
      pubDate: itemPubDate,
      guid: itemGuid || itemLink,
      content: content,
      featuredImage: featuredImage,
    };
  });

  return { title, description, items };
}

// Check content quality based on feed configuration
function checkContentQuality(item: RSSItem, feedConfig: any): { passed: boolean; reason?: string } {
  // Check minimum title length
  if (item.title.length < (feedConfig.min_title_length || 10)) {
    return { passed: false, reason: `Title too short (${item.title.length} chars, minimum ${feedConfig.min_title_length || 10})` };
  }

  // Check minimum content length
  const contentLength = (item.content || item.description || '').length;
  if (contentLength < (feedConfig.min_content_length || 200)) {
    return { passed: false, reason: `Content too short (${contentLength} chars, minimum ${feedConfig.min_content_length || 200})` };
  }

  // Check if image is required
  if (feedConfig.require_image && !item.featuredImage) {
    return { passed: false, reason: 'Required image not found' };
  }

  // Check for generic/spam titles
  const genericPatterns = [
    /^(test|exemplo|sample)/i,
    /^\d+$/,
    /^(untitled|sem título|no title)/i,
  ];
  
  for (const pattern of genericPatterns) {
    if (pattern.test(item.title)) {
      return { passed: false, reason: 'Generic or spam title detected' };
    }
  }

  return { passed: true };
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100);
}

// Calculate reading time
function calculateReadTime(content: string): number {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

// Parse date from RSS pubDate
function parseRSSDate(dateString: string): string | null {
  if (!dateString) return null;
  
  try {
    // Try different date formats commonly used in RSS
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
  }
  
  return null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const DEFAULT_AUTHOR_ID = '04ff5b92-dde9-427b-9371-e3b2813bcab5'; // Redação ITL Brasil
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { feedId, mode = 'manual' } = await req.json();

    if (!feedId) {
      return new Response(
        JSON.stringify({ error: 'Feed ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get feed configuration
    const { data: feed, error: feedError } = await supabase
      .from('rss_feeds')
      .select('*')
      .eq('id', feedId)
      .single();

    if (feedError || !feed) {
      return new Response(
        JSON.stringify({ error: 'Feed not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!feed.active) {
      return new Response(
        JSON.stringify({ error: 'Feed is inactive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create import log
    const { data: importLog, error: logError } = await supabase
      .from('import_logs')
      .insert({
        feed_id: feedId,
        status: 'processing',
        import_mode: mode,
        articles_imported: 0,
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating import log:', logError);
      return new Response(
        JSON.stringify({ error: 'Failed to create import log' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch RSS feed with timeout and retry
    console.log('Fetching RSS feed:', feed.url);
    
    // Validate URL format
    try {
      new URL(feed.url);
    } catch (urlError) {
      const errorMessage = `URL inválida: ${feed.url}`;
      console.error(errorMessage);
      
      await supabase
        .from('import_logs')
        .update({
          status: 'error',
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', importLog.id);

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let rssResponse;
    try {
      rssResponse = await fetch(feed.url, {
        headers: {
          'User-Agent': 'ITL Brasil RSS Importer 1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      const errorMessage = `Erro de conexão: ${(fetchError as Error).message}`;
      console.error('Fetch error:', fetchError);
      
      await supabase
        .from('import_logs')
        .update({
          status: 'error',
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', importLog.id);

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!rssResponse.ok) {
      const errorMessage = `HTTP ${rssResponse.status}: ${rssResponse.statusText}`;
      
      await supabase
        .from('import_logs')
        .update({
          status: 'error',
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', importLog.id);

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const xmlContent = await rssResponse.text();
    console.log('RSS content length:', xmlContent.length);

    // Validate that we actually got XML content
    if (!xmlContent.includes('<rss') && !xmlContent.includes('<feed')) {
      throw new Error('Response is not valid RSS/XML format');
    }

    const parsedFeed = parseRSS(xmlContent);
    console.log(`Parsed feed: ${parsedFeed.title}, items: ${parsedFeed.items.length}`);
      
      // Validate we have items to import
      if (!parsedFeed.items || parsedFeed.items.length === 0) {
        console.log('No items found in RSS feed');
        await supabase
          .from('import_logs')
          .update({
            status: 'success',
            articles_imported: 0,
            completed_at: new Date().toISOString(),
            error_message: 'Feed processed successfully but no new articles found'
          })
          .eq('id', importLog.id);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Feed processed successfully but no new articles found',
            imported_count: 0 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Sort items by publication date (most recent first)
      const sortedItems = parsedFeed.items
        .filter(item => item.title && item.content)
        .sort((a, b) => {
          const dateA = parseRSSDate(a.pubDate);
          const dateB = parseRSSDate(b.pubDate);
          const timeA = dateA ? new Date(dateA).getTime() : 0;
          const timeB = dateB ? new Date(dateB).getTime() : 0;
          return timeB - timeA; // Most recent first
        });

      // Apply limit from feed configuration
      const maxArticles = feed.max_articles_per_import || 5;
      const itemsToProcess = sortedItems.slice(0, maxArticles);
      
      console.log(`Processing ${itemsToProcess.length} of ${parsedFeed.items.length} items (limit: ${maxArticles})`);

      // Process items and import articles
      let articlesImported = 0;
      const errors: string[] = [];

      for (const item of itemsToProcess) {
      try {
        if (!item.title || !item.content) {
          console.log('Skipping item without title or content');
          continue;
        }

        // Apply quality filters
        const qualityCheck = checkContentQuality(item, feed);
        if (!qualityCheck.passed) {
          console.log(`Skipping article "${item.title}" - Quality check failed: ${qualityCheck.reason}`);
          continue;
        }

        // Check if article already exists (by URL or GUID)
        const existingQuery = feed.review_queue ? 
          supabase.from('articles_queue').select('id').eq('source_url', item.link).limit(1) :
          supabase.from('articles').select('id').eq('source_url', item.link).limit(1);

        const { data: existingArticle } = await existingQuery;

        if (existingArticle && existingArticle.length > 0) {
          console.log('Article already exists:', item.title);
          continue;
        }

        // Generate unique slug (only needed for direct article insertion)
        let slug = '';
        if (!feed.review_queue) {
          slug = generateSlug(item.title);
          let slugCounter = 1;
          
          while (true) {
            const { data: existingSlug } = await supabase
              .from('articles')
              .select('id')
              .eq('slug', slug)
              .limit(1);

            if (!existingSlug || existingSlug.length === 0) {
              break;
            }

            slug = `${generateSlug(item.title)}-${slugCounter}`;
            slugCounter++;
          }
        }

        // Prepare article data
        const publishedAt = parseRSSDate(item.pubDate);
        const readTime = calculateReadTime(item.content);
        
        if (feed.review_queue) {
          // Insert into articles queue for review
          const queueData = {
            title: item.title.substring(0, 200),
            content: item.content,
            excerpt: item.description.substring(0, 500),
            source_url: item.link,
            source_name: parsedFeed.title,
            category_id: feed.category_id,
            feed_id: feed.id,
            read_time: readTime,
            import_mode: mode,
            featured_image: item.featuredImage || null,
            status: 'pending',
            author_id: DEFAULT_AUTHOR_ID,
          };

          const { error: queueError } = await supabase
            .from('articles_queue')
            .insert(queueData);

          if (queueError) {
            console.error('Error inserting article to queue:', queueError);
            errors.push(`${item.title}: ${queueError.message}`);
          } else {
            articlesImported++;
            console.log('Added to review queue:', item.title);
          }
        } else {
          // Insert directly to articles
          const articleData = {
            title: item.title.substring(0, 200),
            slug: slug,
            content: item.content,
            excerpt: item.description.substring(0, 500),
            source_url: item.link,
            source_name: parsedFeed.title,
            category_id: feed.category_id,
            published_at: feed.auto_publish ? (publishedAt || new Date().toISOString()) : null,
            status: feed.auto_publish ? 'published' : 'draft',
            read_time: readTime,
            import_mode: mode,
            featured_image: item.featuredImage || null,
            author_id: DEFAULT_AUTHOR_ID,
          };

          const { error: articleError } = await supabase
            .from('articles')
            .insert(articleData);

          if (articleError) {
            console.error('Error inserting article:', articleError);
            errors.push(`${item.title}: ${articleError.message}`);
          } else {
            articlesImported++;
            console.log('Imported article:', item.title);
          }
        }
      } catch (itemError) {
        console.error('Error processing item:', itemError);
        errors.push(`${item.title}: ${(itemError as Error).message}`);
      }
    }

    // Update feed last import time
    await supabase
      .from('rss_feeds')
      .update({ last_import: new Date().toISOString() })
      .eq('id', feedId);

    // Update import log
    const finalStatus = errors.length > 0 && articlesImported === 0 ? 'error' : 'success';
    const errorMessage = errors.length > 0 ? errors.join('; ') : null;

    await supabase
      .from('import_logs')
      .update({
        status: finalStatus,
        articles_imported: articlesImported,
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', importLog.id);

    return new Response(
      JSON.stringify({
        success: true,
        articlesImported,
        totalItems: parsedFeed.items.length,
        processedItems: itemsToProcess.length,
        maxArticlesLimit: maxArticles,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Import error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: (error as Error).message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});