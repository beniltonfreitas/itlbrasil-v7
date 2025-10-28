import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TrainingVideo {
  id: string;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'vimeo' | 'outros';
  title: string;
  description: string | null;
  url: string;
  thumbnail_url: string | null;
  duration: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

type NewTrainingVideo = Omit<TrainingVideo, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'thumbnail_url' | 'duration' | 'platform'>;

// Função auxiliar para extrair ID do YouTube
function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

// Função auxiliar para extrair thumbnail do YouTube
function getYoutubeThumbnail(url: string): string | null {
  const videoId = extractYoutubeId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function useTrainingVideos(platform: string) {
  const queryClient = useQueryClient();

  // Query para listar vídeos
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['training-videos', platform],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_videos' as any)
        .select('*')
        .eq('platform', platform)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as TrainingVideo[];
    }
  });

  // Mutation para adicionar vídeo
  const addVideoMutation = useMutation({
    mutationFn: async (video: Partial<NewTrainingVideo>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Extrair thumbnail automaticamente do YouTube
      let thumbnail_url = null;
      if (platform === 'youtube') {
        thumbnail_url = getYoutubeThumbnail(video.url);
      }

      const { data, error } = await supabase
        .from('training_videos' as any)
        .insert([{ 
          ...video, 
          platform,
          thumbnail_url,
          created_by: user.id 
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-videos', platform] });
      toast({
        title: 'Sucesso!',
        description: 'Vídeo adicionado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Erro ao adicionar vídeo: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Mutation para deletar vídeo
  const deleteVideoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('training_videos' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-videos', platform] });
      toast({
        title: 'Sucesso!',
        description: 'Vídeo removido com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: `Erro ao remover vídeo: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  return {
    videos,
    isLoading,
    error,
    addVideo: addVideoMutation.mutate,
    deleteVideo: deleteVideoMutation.mutate,
    isAdding: addVideoMutation.isPending,
    isDeleting: deleteVideoMutation.isPending
  };
}
