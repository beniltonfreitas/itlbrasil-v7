import { supabase } from "@/integrations/supabase/client";

export interface UploadResult {
  url: string;
  path: string;
}

export async function uploadImageToStorage(
  file: File, 
  bucket: string = 'article-images'
): Promise<UploadResult> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Formato inválido. Use JPG, PNG, WebP ou GIF.');
  }
  
  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Máximo 5MB.');
  }
  
  // Generate unique filename
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  const fileName = `${timestamp}-${randomId}.${ext}`;
  
  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error(`Erro no upload: ${uploadError.message}`);
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
    
  return {
    url: urlData.publicUrl,
    path: fileName
  };
}
