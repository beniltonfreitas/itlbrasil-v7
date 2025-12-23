import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface WebStory {
  id: string;
  title: string;
  slug: string;
  cover_image?: string;
  status: 'draft' | 'published';
  author_id: string;
  created_at: string;
  updated_at: string;
  meta_description?: string;
  meta_keywords?: string[];
  source_article_id?: string;
  views_count?: number;
  webstory_pages?: WebStoryPage[];
}

export interface WebStoryPage {
  id: string;
  webstory_id: string;
  page_number: number;
  content: string;
  background_image?: string;
  created_at: string;
}

export const useWebStories = () => {
  return useQuery({
    queryKey: ['webstories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webstories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []) as WebStory[];
    },
  });
};

export const useWebStory = (id?: string) => {
  return useQuery({
    queryKey: ['webstory', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('webstories')
        .select('*, webstory_pages(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateWebStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<WebStory, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: webstory, error } = await supabase
        .from('webstories')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return webstory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webstories'] });
      toast.success('WebStory criada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar WebStory: ${error.message}`);
    },
  });
};

export const useUpdateWebStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<WebStory> & { id: string }) => {
      const { data: webstory, error } = await supabase
        .from('webstories')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return webstory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webstories'] });
      toast.success('WebStory atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar WebStory: ${error.message}`);
    },
  });
};

export const useDeleteWebStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('webstories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webstories'] });
      toast.success('WebStory excluída com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir WebStory: ${error.message}`);
    },
  });
};

export const useToggleWebStoryPublish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'draft' | 'published' }) => {
      const { data, error } = await supabase
        .from('webstories')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['webstories'] });
      toast.success(variables.status === 'published' ? 'WebStory publicada' : 'WebStory despublicada');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
};

// Hook for WebStory pages management
export const useWebStoryPages = (webstoryId?: string) => {
  return useQuery({
    queryKey: ['webstory-pages', webstoryId],
    queryFn: async () => {
      if (!webstoryId) return [];
      
      const { data, error } = await supabase
        .from('webstory_pages')
        .select('*')
        .eq('webstory_id', webstoryId)
        .order('page_number', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!webstoryId,
  });
};

export const useCreateWebStoryPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      webstory_id: string;
      page_number: number;
      content_type: string;
      content_data: { text?: string; image_url?: string; caption?: string };
      background_color?: string;
      text_color?: string;
      font_family?: string;
    }) => {
      const { data: page, error } = await supabase
        .from('webstory_pages')
        .insert([{
          ...data,
          content_data: data.content_data as unknown as Json,
        }])
        .select()
        .single();

      if (error) throw error;
      return page;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['webstory-pages', variables.webstory_id] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar página: ${error.message}`);
    },
  });
};

export const useUpdateWebStoryPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, webstory_id, ...data }: {
      id: string;
      webstory_id: string;
      content_type?: string;
      content_data?: { text?: string; image_url?: string; caption?: string };
      background_color?: string;
      text_color?: string;
      font_family?: string;
    }) => {
      const updateData = data.content_data 
        ? { ...data, content_data: data.content_data as unknown as Json }
        : data;
      
      const { data: page, error } = await supabase
        .from('webstory_pages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return page;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['webstory-pages', variables.webstory_id] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar página: ${error.message}`);
    },
  });
};

export const useDeleteWebStoryPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, webstory_id }: { id: string; webstory_id: string }) => {
      const { error } = await supabase
        .from('webstory_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['webstory-pages', variables.webstory_id] });
      toast.success('Página removida');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover página: ${error.message}`);
    },
  });
};