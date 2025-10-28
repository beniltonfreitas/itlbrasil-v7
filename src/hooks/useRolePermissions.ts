import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AvailablePermission {
  id: string;
  permission_key: string;
  permission_name: string;
  permission_description: string | null;
  category: string;
  created_at: string;
}

export interface RolePermission {
  id: string;
  role: 'superadmin' | 'admin' | 'editor' | 'author';
  permission_key: string;
  created_at: string;
}

// Buscar todas as permissões disponíveis
export const useAvailablePermissions = () => {
  return useQuery({
    queryKey: ['available-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('available_permissions')
        .select('*')
        .order('category', { ascending: true })
        .order('permission_name', { ascending: true });

      if (error) throw error;
      return data as AvailablePermission[];
    },
  });
};

// Buscar permissões de uma role específica
export const useRolePermissions = (role?: 'admin' | 'editor' | 'author') => {
  return useQuery({
    queryKey: ['role-permissions', role],
    queryFn: async () => {
      if (!role) return [];
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select('permission_key')
        .eq('role', role);

      if (error) throw error;
      return (data || []).map(item => item.permission_key);
    },
    enabled: !!role,
  });
};

// Buscar todas as permissões por role (para a matriz de permissões)
export const useAllRolePermissions = () => {
  return useQuery({
    queryKey: ['all-role-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');

      if (error) throw error;
      return data as RolePermission[];
    },
  });
};

// Adicionar permissão a uma role
export const useAddRolePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ role, permissionKey }: { role: string; permissionKey: string }) => {
      const { data, error } = await supabase
        .from('role_permissions')
        .insert({ 
          role: role as 'admin' | 'editor' | 'author', 
          permission_key: permissionKey 
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['all-role-permissions'] });
      toast.success('Permissão adicionada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar permissão: ${error.message}`);
    },
  });
};

// Remover permissão de uma role
export const useRemoveRolePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ role, permissionKey }: { role: string; permissionKey: string }) => {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role', role as 'admin' | 'editor' | 'author')
        .eq('permission_key', permissionKey);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      queryClient.invalidateQueries({ queryKey: ['all-role-permissions'] });
      toast.success('Permissão removida com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover permissão: ${error.message}`);
    },
  });
};
