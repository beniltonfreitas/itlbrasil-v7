import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      articleIds, 
      status, 
      publishedAt 
    }: { 
      articleIds: string[];
      status: 'draft' | 'published';
      publishedAt: string | null;
    }) => {
      const { error } = await supabase
        .from('articles')
        .update({ 
          status, 
          published_at: publishedAt,
          updated_at: new Date().toISOString()
        })
        .in('id', articleIds);

      if (error) {
        throw new Error(`Erro ao atualizar status: ${error.message}`);
      }

      return { articleIds, status };
    },
    onSuccess: (data) => {
      const statusText = data.status === 'published' ? 'publicadas' : 'movidas para rascunho';
      toast({
        title: "Operação concluída",
        description: `${data.articleIds.length} notícias foram ${statusText}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro na operação",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useBulkDelete = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (articleIds: string[]) => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .in('id', articleIds);

      if (error) {
        throw new Error(`Erro ao excluir notícias: ${error.message}`);
      }

      return articleIds;
    },
    onSuccess: (articleIds) => {
      toast({
        title: "Notícias excluídas",
        description: `${articleIds.length} notícias foram excluídas com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};