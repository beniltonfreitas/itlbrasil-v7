import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NoticiasAISource {
  id: string;
  name: string;
  domain_pattern: string;
  badge: string;
  badge_color: string;
  parsing_instructions: string | null;
  is_active: boolean;
  is_system: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSourceData {
  name: string;
  domain_pattern: string;
  badge: string;
  badge_color?: string;
  parsing_instructions?: string;
}

export interface UpdateSourceData {
  name?: string;
  domain_pattern?: string;
  badge?: string;
  badge_color?: string;
  parsing_instructions?: string;
  is_active?: boolean;
}

export const useNoticiasAISources = () => {
  return useQuery({
    queryKey: ['noticias-ai-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noticias_ai_sources')
        .select('*')
        .order('is_system', { ascending: false })
        .order('name', { ascending: true });

      if (error) throw error;
      return data as NoticiasAISource[];
    },
  });
};

export const useCreateNoticiasAISource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sourceData: CreateSourceData) => {
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from('noticias_ai_sources')
        .insert({
          ...sourceData,
          created_by: session?.session?.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias-ai-sources'] });
      toast.success('Fonte criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar fonte:', error);
      toast.error('Erro ao criar fonte');
    },
  });
};

export const useUpdateNoticiasAISource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateSourceData & { id: string }) => {
      const { data, error } = await supabase
        .from('noticias_ai_sources')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias-ai-sources'] });
      toast.success('Fonte atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar fonte:', error);
      toast.error('Erro ao atualizar fonte');
    },
  });
};

export const useDeleteNoticiasAISource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('noticias_ai_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias-ai-sources'] });
      toast.success('Fonte removida com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao remover fonte:', error);
      toast.error('Erro ao remover fonte');
    },
  });
};

// Helper function to detect source from URL using database sources
export const useDetectSourceFromUrl = () => {
  const { data: sources } = useNoticiasAISources();
  
  return (url: string): NoticiasAISource | null => {
    if (!sources || !url) return null;
    
    const urlLower = url.toLowerCase();
    return sources.find(source => 
      source.is_active && urlLower.includes(source.domain_pattern.toLowerCase())
    ) || null;
  };
};
