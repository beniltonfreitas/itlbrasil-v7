import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Ad {
  id: string;
  nome: string;
  tipo: string;
  img_url: string;
  alt_text?: string;
  anunciante?: string;
  destino_url?: string;
  prioridade: number;
  validade_inicio?: string;
  validade_fim?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useAdsLibrary = (filters?: { tipo?: string; ativo?: boolean }) => {
  return useQuery({
    queryKey: ['ads-library', filters],
    queryFn: async () => {
      let query = supabase
        .from('ads_library')
        .select('*')
        .order('prioridade', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo);
      }

      if (filters?.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Ad[];
    },
  });
};

export const useCreateAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { nome: string; tipo: string; img_url: string; alt_text?: string; anunciante?: string; destino_url?: string; prioridade?: number; validade_inicio?: string; validade_fim?: string; ativo?: boolean }) => {
      const { data: ad, error } = await supabase
        .from('ads_library')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return ad;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads-library'] });
      toast({
        title: 'Anúncio criado',
        description: 'O anúncio foi adicionado à biblioteca.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar anúncio',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Ad> }) => {
      const { data: ad, error } = await supabase
        .from('ads_library')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return ad;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads-library'] });
      toast({
        title: 'Anúncio atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar anúncio',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteAd = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ads_library')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads-library'] });
      toast({
        title: 'Anúncio excluído',
        description: 'O anúncio foi removido da biblioteca.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir anúncio',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
