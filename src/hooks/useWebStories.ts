import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WebStory {
  id: string;
  title: string;
  slug: string;
  description: string;
  publisher_logo: string;
  status: 'rascunho' | 'publicado';
  cover_image?: string;
  cover_alt?: string;
  cover_credit?: string;
  category?: string;
  tags?: string[];
  pages?: any[];
  author_id: string;
  created_at: string;
  updated_at: string;
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
      
      // Map published (boolean) to status (enum) for backward compatibility
      // Until migration is applied, database still has 'published' field
      return (data || []).map((item: any) => ({
        ...item,
        status: item.status || (item.published ? 'publicado' : 'rascunho')
      })) as WebStory[];
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
      // Map status back to published for backward compatibility
      const updateData: any = { ...data };
      if ('status' in updateData) {
        updateData.published = updateData.status === 'publicado';
      }
      
      const { data: webstory, error } = await supabase
        .from('webstories')
        .update(updateData)
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
    mutationFn: async ({ id, status }: { id: string; status: 'rascunho' | 'publicado' }) => {
      // Update both fields for backward compatibility
      const { data, error } = await supabase
        .from('webstories')
        .update({ 
          status,
          published: status === 'publicado' 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['webstories'] });
      toast.success(variables.status === 'publicado' ? 'WebStory publicada' : 'WebStory despublicada');
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
};