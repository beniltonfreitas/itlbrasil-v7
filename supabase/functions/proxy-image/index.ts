import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validate URL to prevent SSRF attacks
function validateImageUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    
    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Protocolo não suportado. Use HTTP ou HTTPS.' };
    }

    // Block localhost and private IPs
    const hostname = parsed.hostname.toLowerCase();
    const blockedHostnames = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    if (blockedHostnames.includes(hostname)) {
      return { valid: false, error: 'URLs locais não são permitidas.' };
    }

    // Block private IP ranges
    const ipPatterns = [
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^169\.254\./,
      /^fc00:/i,
      /^fe80:/i,
    ];

    for (const pattern of ipPatterns) {
      if (pattern.test(hostname)) {
        return { valid: false, error: 'IPs privados não são permitidos.' };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'URL inválida.' };
  }
}

// Validate content type
function isValidImageContentType(contentType: string | null): boolean {
  if (!contentType) return false;
  const validTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/jpg',
  ];
  return validTypes.some(type => contentType.toLowerCase().includes(type));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    
    // Validate input
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('URL de imagem é obrigatória');
    }

    // Validate URL format and security
    const validation = validateImageUrl(imageUrl);
    if (!validation.valid) {
      throw new Error(validation.error || 'URL inválida');
    }

    console.log('📥 Baixando imagem:', imageUrl);

    // Fetch external image with robust headers and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/jpeg,image/png,image/*,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://itlbrasil.com/',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!imageResponse.ok) {
      console.error(`❌ Erro HTTP ${imageResponse.status} ao baixar imagem:`, imageUrl);
      throw new Error(`Erro HTTP: ${imageResponse.status} - ${imageResponse.statusText}`);
    }

    // Validate content type
    const contentType = imageResponse.headers.get('content-type');
    if (!isValidImageContentType(contentType)) {
      console.error('❌ Content-Type inválido:', contentType);
      throw new Error(`Tipo de arquivo inválido: ${contentType}. Apenas imagens são permitidas.`);
    }

    // Check file size (max 10MB)
    const contentLength = imageResponse.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      throw new Error('Imagem muito grande. Máximo 10MB permitido.');
    }

    const imageBlob = await imageResponse.blob();

    // Double check size after download
    if (imageBlob.size > 10 * 1024 * 1024) {
      throw new Error('Imagem muito grande. Máximo 10MB permitido.');
    }

    console.log('✅ Imagem baixada:', imageBlob.size, 'bytes, tipo:', contentType);

    // Upload to Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate unique filename based on original URL hash
    const urlHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(imageUrl)
    );
    const hashArray = Array.from(new Uint8Array(urlHash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Determine extension from content type
    const extensionMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const extension = extensionMap[contentType?.split(';')[0] || ''] || 'jpg';
    const fileName = `cached/${hashHex}.${extension}`;

    // Check if file already exists
    const { data: existingFile } = await supabase.storage
      .from('article-images')
      .list('cached', {
        search: hashHex
      });

    if (existingFile && existingFile.length > 0) {
      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(fileName);
      
      console.log('♻️ Imagem já em cache:', publicUrl);
      
      return new Response(JSON.stringify({ cachedUrl: publicUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Upload new file
    const { data, error } = await supabase.storage
      .from('article-images')
      .upload(fileName, imageBlob, {
        contentType: contentType || 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('❌ Erro no upload:', error);
      throw new Error(`Erro ao salvar imagem: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('article-images')
      .getPublicUrl(fileName);

    console.log('💾 Imagem salva em cache:', publicUrl);

    return new Response(JSON.stringify({ cachedUrl: publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Erro:', error);
    
    const errorMessage = error.name === 'AbortError' 
      ? 'Timeout: servidor da imagem demorou para responder'
      : error.message || 'Erro desconhecido';
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
