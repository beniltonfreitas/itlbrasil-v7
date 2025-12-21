import { supabase } from "@/integrations/supabase/client";

export interface UploadResult {
  url: string;
  path: string;
}

/**
 * Compress image before upload
 * - Resizes to max 1920px (width or height)
 * - Converts to JPEG with 80% quality
 */
export async function compressImage(file: File, maxSize: number = 1920, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If it's a GIF, don't compress (preserve animation)
    if (file.type === 'image/gif') {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // Only resize if larger than maxSize
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to JPEG for better compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file); // Fallback to original
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Erro ao processar imagem'));
    };

    img.src = URL.createObjectURL(file);
  });
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
  
  // Validate file size (max 10MB before compression, will be smaller after)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Máximo 10MB.');
  }

  // Compress image before upload
  console.log(`Original: ${(file.size / 1024).toFixed(1)}KB`);
  const compressedBlob = await compressImage(file);
  console.log(`Comprimido: ${(compressedBlob.size / 1024).toFixed(1)}KB`);
  
  // Generate unique filename (always .jpg after compression, except GIFs)
  const isGif = file.type === 'image/gif';
  const ext = isGif ? 'gif' : 'jpg';
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  const fileName = `${timestamp}-${randomId}.${ext}`;
  
  // Upload compressed image to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, compressedBlob, {
      cacheControl: '3600',
      upsert: false,
      contentType: isGif ? 'image/gif' : 'image/jpeg'
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
