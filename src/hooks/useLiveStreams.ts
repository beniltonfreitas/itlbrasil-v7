import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LiveStream {
  id: string;
  title: string;
  description?: string | null;
  stream_url: string;
  stream_type: string;
  status: string;
  thumbnail_url?: string | null;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  viewer_count?: number | null;
  chat_enabled?: boolean | null;
  embed_code?: string | null;
  created_at: string;
  updated_at: string;
}

export const useLiveStreams = (streamType?: string) => {
  return useQuery({
    queryKey: ['live-streams', streamType],
    queryFn: async () => {
      let query = supabase
        .from('live_streams')
        .select('*')
        .order('created_at', { ascending: false });

      if (streamType) {
        query = query.eq('stream_type', streamType);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao carregar transmissões: ${error.message}`);
      }

      return data as LiveStream[];
    },
  });
};

export const useCreateLiveStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamData: { 
      title: string; 
      stream_url: string; 
      stream_type: string;
      description?: string;
      thumbnail_url?: string;
      scheduled_start?: string;
      scheduled_end?: string;
      chat_enabled?: boolean;
      embed_code?: string;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from('live_streams')
        .insert([{
          ...streamData,
          status: streamData.status || 'offline'
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar transmissão: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-streams'] });
    },
  });
};

export const useUpdateLiveStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LiveStream> & { id: string }) => {
      const { data, error } = await supabase
        .from('live_streams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar transmissão: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-streams'] });
    },
  });
};

export const useDeleteLiveStream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (streamId: string) => {
      const { error } = await supabase
        .from('live_streams')
        .delete()
        .eq('id', streamId);

      if (error) {
        throw new Error(`Erro ao excluir transmissão: ${error.message}`);
      }

      return streamId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-streams'] });
    },
  });
};
