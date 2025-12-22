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

// Note: These hooks require 'available_permissions' and 'role_permissions' tables.
// Uses 'any' casting to bypass TypeScript strict checking.

export const useAvailablePermissions = () => {
  return useQuery({
    queryKey: ['available-permissions'],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('available_permissions')
          .select('*')
          .order('category', { ascending: true })
          .order('permission_name', { ascending: true });

        if (error) {
          console.warn('Available permissions table may not exist:', error.message);
          return [] as AvailablePermission[];
        }
        return (data || []) as AvailablePermission[];
      } catch (err) {
        console.warn('Error fetching permissions:', err);
        return [] as AvailablePermission[];
      }
    },
  });
};

export const useRolePermissions = (role?: 'admin' | 'editor' | 'author') => {
  return useQuery({
    queryKey: ['role-permissions', role],
    queryFn: async () => {
      if (!role) return [];
      
      try {
        const { data, error } = await (supabase as any)
          .from('role_permissions')
          .select('permission_key')
          .eq('role', role);

        if (error) {
          console.warn('Role permissions table may not exist:', error.message);
          return [];
        }
        return (data || []).map((item: any) => item.permission_key);
      } catch (err) {
        console.warn('Error fetching role permissions:', err);
        return [];
      }
    },
    enabled: !!role,
  });
};

export const useAllRolePermissions = () => {
  return useQuery({
    queryKey: ['all-role-permissions'],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('role_permissions')
          .select('*');

        if (error) {
          console.warn('Role permissions table may not exist:', error.message);
          return [] as RolePermission[];
        }
        return (data || []) as RolePermission[];
      } catch (err) {
        console.warn('Error fetching all role permissions:', err);
        return [] as RolePermission[];
      }
    },
  });
};

export const useAddRolePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ role, permissionKey }: { role: string; permissionKey: string }) => {
      const { data, error } = await (supabase as any)
        .from('role_permissions')
        .insert({ role, permission_key: permissionKey })
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

export const useRemoveRolePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ role, permissionKey }: { role: string; permissionKey: string }) => {
      const { error } = await (supabase as any)
        .from('role_permissions')
        .delete()
        .eq('role', role)
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
