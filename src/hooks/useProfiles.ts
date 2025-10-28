import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role?: 'superadmin' | 'admin' | 'editor' | 'author';
  status: 'active' | 'pending' | 'suspended';
  bio?: string;
  avatar_url?: string;
  full_name?: string;
  social_links?: any;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar perfis: ${error.message}`);
      }

      return data as Profile[];
    },
  });
};

export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'user_id'> & { id?: string }) => {
      // Use provided id or generate a new UUID
      const profileData = {
        ...profile,
        id: profile.id || crypto.randomUUID(),
        user_id: profile.id || crypto.randomUUID(),
      };

      console.log('Creating profile:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Profile creation error:', error);
        if (error.code === '23505' && error.message.includes('profiles_email_unique')) {
          throw new Error('Este email já está em uso. Por favor, use um email diferente.');
        }
        throw new Error(`Erro ao criar perfil: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, password, ...updates }: Partial<Profile> & { id: string; password?: string }) => {
      // Remover password dos updates (não existe na tabela profiles)
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar perfil: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);

      if (error) {
        throw new Error(`Erro ao excluir perfil: ${error.message}`);
      }

      return profileId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (error) {
        throw new Error(`Erro ao alterar senha: ${error.message}`);
      }

      return userId;
    },
  });
};