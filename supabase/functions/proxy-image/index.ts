import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    
    if (!imageUrl || !imageUrl.startsWith('http')) {
      throw new Error('URL de imagem inválida');
    }

    console.log('📥 Baixando imagem:', imageUrl);

    // Fetch imagem externa com headers robustos e timeout
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/jpeg,image/png,image/*,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://itlbrasil.com/',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(10000), // Timeout de 10 segundos
    });

    if (!imageResponse.ok) {
      console.error(`❌ Erro HTTP ${imageResponse.status} ao baixar imagem:`, imageUrl);
      throw new Error(`Erro HTTP: ${imageResponse.status} - ${imageResponse.statusText}`);
    }

    const imageBlob = await imageResponse.blob();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    console.log('✅ Imagem baixada:', imageBlob.size, 'bytes');

    // Upload para Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Gera nome único baseado na URL original
    const urlHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(imageUrl)
    );
    const hashArray = Array.from(new Uint8Array(urlHash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
    const fileName = `cached/${hashHex}.${extension}`;

    // Verifica se já existe
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

    // Upload novo arquivo
    const { data, error } = await supabase.storage
      .from('article-images')
      .upload(fileName, imageBlob, {
        contentType,
        upsert: false
      });

    if (error) {
      console.error('❌ Erro no upload:', error);
      throw error;
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
