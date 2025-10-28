import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useSecureAuth } from '@/contexts/SecureAuthContext';

export const useCreateEdition = () => {
  const queryClient = useQueryClient();
  const { user } = useSecureAuth();

  return useMutation({
    mutationFn: async (data: any) => {
      const { data: edition, error } = await supabase
        .from('editions')
        .insert({
          ...data,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return edition;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editions'] });
      toast({
        title: 'Edição criada',
        description: 'A edição foi criada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar edição',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateEdition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: edition, error } = await supabase
        .from('editions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return edition;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['editions'] });
      queryClient.invalidateQueries({ queryKey: ['edition', variables.id] });
      toast({
        title: 'Edição atualizada',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar edição',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const usePublishEdition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('editions')
        .update({ status: 'publicado' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['editions'] });
      queryClient.invalidateQueries({ queryKey: ['edition', id] });
      toast({
        title: 'Edição publicada',
        description: 'A edição foi publicada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao publicar edição',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteEdition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('editions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['editions'] });
      toast({
        title: 'Edição excluída',
        description: 'A edição foi excluída com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir edição',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateEditionItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ editionId, items }: { editionId: string; items: any[] }) => {
      // Deletar items existentes
      await supabase
        .from('edition_items')
        .delete()
        .eq('edition_id', editionId);

      // Inserir novos items
      if (items.length > 0) {
        const { data, error } = await supabase
          .from('edition_items')
          .insert(items.map(item => ({ ...item, edition_id: editionId })))
          .select();

        if (error) throw error;
        return data;
      }
      return [];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['edition', variables.editionId] });
      toast({
        title: 'Itens atualizados',
        description: 'Os itens da edição foram atualizados com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar itens',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
