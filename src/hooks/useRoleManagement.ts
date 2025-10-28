import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserRole {
  id: string;
  user_id: string;
  role: 'superadmin' | 'admin' | 'author' | 'editor';
  created_at: string;
}

interface UserWithRoles {
  id: string;
  email: string;
  created_at: string;
  roles: UserRole[];
}

export const useRoleManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users with their roles
  const { data: usersWithRoles, isLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async (): Promise<UserWithRoles[]> => {
      // Get all auth users (requires admin access)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw new Error(`Erro ao buscar usuários: ${authError.message}`);
      }

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        throw new Error(`Erro ao buscar roles: ${rolesError.message}`);
      }

      // Combine users with their roles
      const usersWithRoles: UserWithRoles[] = authUsers.users.map(user => ({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        roles: (userRoles?.filter(role => role.user_id === user.id) || []) as UserRole[]
      }));

      return usersWithRoles;
    },
  });

  // Add role to user
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'superadmin' | 'admin' | 'editor' | 'author' }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Usuário já possui este role');
        }
        throw new Error(`Erro ao adicionar role: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: "Role adicionado",
        description: "Role foi atribuído ao usuário com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove role from user
  const removeRoleMutation = useMutation({
    mutationFn: async ({ roleId }: { roleId: string }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) {
        throw new Error(`Erro ao remover role: ${error.message}`);
      }

      return roleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: "Role removido",
        description: "Role foi removido do usuário com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    usersWithRoles: usersWithRoles || [],
    isLoading,
    addRole: addRoleMutation.mutate,
    removeRole: removeRoleMutation.mutate,
    isAddingRole: addRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending,
  };
};