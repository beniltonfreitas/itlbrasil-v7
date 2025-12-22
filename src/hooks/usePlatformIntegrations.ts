import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformIntegration {
  id: string;
  platform_name?: string;
  platform: string;
  user_id?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  token_expires_at?: string | null;
  channel_id?: string | null;
  channel_name?: string | null;
  settings?: Record<string, any>;
  active?: boolean;
  created_at: string;
  updated_at: string;
}

export const usePlatformIntegrations = () => {
  return useQuery({
    queryKey: ['platform-integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erro ao carregar integrações: ${error.message}`);
      }

      // Map platform to platform_name for backwards compatibility
      return (data || []).map((item: any) => ({
        ...item,
        platform_name: item.platform_name || item.platform
      })) as PlatformIntegration[];
    },
  });
};

export const useCreatePlatformIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (integrationData: { platform: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('platform_integrations')
        .insert([integrationData])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar integração: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-integrations'] });
    },
  });
};

export const useUpdatePlatformIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PlatformIntegration> & { id: string }) => {
      const { data, error } = await supabase
        .from('platform_integrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar integração: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-integrations'] });
    },
  });
};

export const useDeletePlatformIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (integrationId: string) => {
      const { error } = await supabase
        .from('platform_integrations')
        .delete()
        .eq('id', integrationId);

      if (error) {
        throw new Error(`Erro ao excluir integração: ${error.message}`);
      }

      return integrationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-integrations'] });
    },
  });
};
