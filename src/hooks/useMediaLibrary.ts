import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MediaItem {
  id: string;
  file_name?: string;
  title: string;
  description?: string | null;
  file_url: string;
  file_type?: string;
  thumbnail_url?: string | null;
  media_type: string;
  content_type: string;
  duration?: number | null;
  file_size?: number | null;
  tags?: string[] | null;
  uploaded_by?: string | null;
  is_public?: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useMediaLibrary = (contentType?: string) => {
  return useQuery({
    queryKey: ['media-library', contentType],
    queryFn: async () => {
      let query = supabase
        .from('media_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (contentType) {
        query = query.eq('content_type', contentType);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao carregar biblioteca de mídia: ${error.message}`);
      }

      // Map data to include file_name from title if not available
      return (data || []).map((item: any) => ({
        ...item,
        file_name: item.file_name || item.title || 'Untitled'
      })) as MediaItem[];
    },
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, metadata }: { file: File; metadata: Partial<MediaItem> }) => {
      // Primeiro, fazer upload do arquivo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'media-files');
      formData.append('folder', metadata.content_type || 'general');
      formData.append('userId', metadata.uploaded_by || '');

      const uploadResponse = await supabase.functions.invoke('upload-media', {
        body: formData,
      });

      if (uploadResponse.error) {
        throw new Error(`Erro no upload: ${uploadResponse.error.message}`);
      }

      const uploadData = uploadResponse.data;

      // Criar registro na biblioteca de mídia
      const mediaData = {
        title: metadata.title || file.name,
        description: metadata.description,
        file_url: uploadData.data.url,
        thumbnail_url: uploadData.data.thumbnailUrl,
        media_type: file.type.startsWith('video/') ? 'video' : 
                   file.type.startsWith('audio/') ? 'audio' : 'image',
        content_type: metadata.content_type || 'general',
        duration: metadata.duration || 0,
        file_size: file.size,
        tags: metadata.tags || [],
        uploaded_by: metadata.uploaded_by,
        is_public: metadata.is_public ?? true,
      };

      const { data, error } = await supabase
        .from('media_library')
        .insert([mediaData])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao salvar na biblioteca: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
    },
  });
};

export const useUpdateMediaItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MediaItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('media_library')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar mídia: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
    },
  });
};

export const useDeleteMediaItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaId: string) => {
      const { error } = await supabase
        .from('media_library')
        .delete()
        .eq('id', mediaId);

      if (error) {
        throw new Error(`Erro ao excluir mídia: ${error.message}`);
      }

      return mediaId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-library'] });
    },
  });
};

export const useMediaAnalytics = () => {
  return useMutation({
    mutationFn: async (event: { event_type: string; source?: string; metadata?: any }) => {
      const { error } = await supabase.functions.invoke('collect-analytics', {
        body: event,
      });

      if (error) {
        console.error('Analytics error:', error);
      }

      return true;
    },
  });
};
