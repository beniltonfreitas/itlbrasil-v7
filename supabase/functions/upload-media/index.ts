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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string || 'article-images';
    const folder = formData.get('folder') as string || '';
    const userId = formData.get('userId') as string;

    if (!file) {
      throw new Error('Nenhum arquivo fornecido');
    }

    console.log('Uploading file:', file.name, 'to bucket:', bucket);

    // Validar tipo de arquivo
    const allowedTypes = {
      'article-images': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      'avatars': ['image/jpeg', 'image/png', 'image/webp'],
      'media-files': ['video/mp4', 'audio/mpeg', 'audio/wav', 'video/webm'],
      'thumbnails': ['image/jpeg', 'image/png', 'image/webp'],
      'documents': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    const validTypes = allowedTypes[bucket as keyof typeof allowedTypes] || [];
    if (!validTypes.includes(file.type)) {
      throw new Error(`Tipo de arquivo não permitido: ${file.type}`);
    }

    // Gerar nome único do arquivo
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${crypto.randomUUID()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload do arquivo
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Erro no upload: ${uploadError.message}`);
    }

    // Obter URL pública
    const { data: urlData } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(filePath);

    // Se for mídia, registrar na biblioteca
    if (bucket === 'media-files' && userId) {
      const mediaType = file.type.startsWith('video/') ? 'video' : 
                       file.type.startsWith('audio/') ? 'audio' : 'image';
      
      await supabaseClient
        .from('media_library')
        .insert({
          title: file.name,
          file_url: urlData.publicUrl,
          media_type: mediaType,
          content_type: 'general',
          file_size: file.size,
          uploaded_by: userId,
          is_public: true
        });
    }

    // Gerar thumbnail se for imagem
    let thumbnailUrl = null;
    if (file.type.startsWith('image/') && bucket !== 'thumbnails') {
      try {
        // Para imagens, criar uma versão thumbnail
        const thumbnailPath = `thumbnails/${fileName}`;
        
        // Redimensionar imagem (implementação simplificada)
        const { data: thumbnailData, error: thumbnailError } = await supabaseClient.storage
          .from('thumbnails')
          .upload(thumbnailPath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (!thumbnailError) {
          const { data: thumbnailUrlData } = supabaseClient.storage
            .from('thumbnails')
            .getPublicUrl(thumbnailPath);
          
          thumbnailUrl = thumbnailUrlData.publicUrl;
        }
      } catch (thumbnailError) {
        console.warn('Erro ao criar thumbnail:', thumbnailError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        path: uploadData.path,
        url: urlData.publicUrl,
        thumbnailUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função de upload:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});