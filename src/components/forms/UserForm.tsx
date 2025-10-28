import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateProfile, useUpdateProfile, useResetPassword, Profile } from "@/hooks/useProfiles";
import { useToast } from "@/hooks/use-toast";

const userSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
  role: z.enum(["superadmin", "admin", "editor", "author"]),
  status: z.enum(["active", "pending", "suspended"]),
  bio: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: Partial<Profile>;
  onSuccess: () => void;
  onCancel: () => void;
}

export const UserForm = ({ user, onSuccess, onCancel }: UserFormProps) => {
  const createMutation = useCreateProfile();
  const updateMutation = useUpdateProfile();
  const resetPasswordMutation = useResetPassword();
  const { toast } = useToast();
  const isEditing = !!user?.id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: user ? "" : "Temp@123", // Default temp password for new users
      role: user?.role || "author",
      status: user?.status || "pending",
      bio: user?.bio || "",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditing && user?.id) {
        // Separar senha dos outros dados do perfil
        const { password, ...profileData } = data;
        
        // Atualizar perfil (sem senha)
        await updateMutation.mutateAsync({
          id: user.id,
          ...profileData,
        });
        
        // Se uma nova senha foi fornecida, atualizar separadamente
        if (password && password.trim()) {
          await resetPasswordMutation.mutateAsync({
            userId: user.user_id,
            newPassword: password,
          });
        }
        
        toast({
          title: "Usuário atualizado",
          description: password ? "Dados e senha atualizados com sucesso." : "Dados atualizados com sucesso.",
        });
      } else {
        // Create new user - must have password
        if (!data.password) {
          toast({
            title: "Erro",
            description: "A senha é obrigatória para criar um novo usuário.",
            variant: "destructive",
          });
          return;
        }

        // Create user and profile
        await createMutation.mutateAsync({
          name: data.name,
          email: data.email,
          role: data.role,
          status: data.status,
          bio: data.bio,
        });
        
        toast({
          title: "Usuário criado",
          description: `Usuário criado com sucesso. Senha temporária: ${data.password}`,
        });
      }
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Nome completo"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="email@exemplo.com"
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Senha {!isEditing && "*"}
          {isEditing && <span className="text-sm text-muted-foreground">(deixe vazio para manter a senha atual)</span>}
        </Label>
        <PasswordInput
          id="password"
          {...register("password")}
          placeholder={isEditing ? "Nova senha (opcional)" : "Senha do usuário"}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Função *</Label>
        <Select
          value={watch("role")}
          onValueChange={(value: any) => setValue("role", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="superadmin">Super Admin</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="author">Autor</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <Select
          value={watch("status")}
          onValueChange={(value: any) => setValue("status", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="suspended">Suspenso</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-red-600">{errors.status.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Biografia</Label>
        <Textarea
          id="bio"
          {...register("bio")}
          placeholder="Breve descrição sobre o usuário..."
          rows={3}
        />
        {errors.bio && (
          <p className="text-sm text-red-600">{errors.bio.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
        >
          {isSubmitting || createMutation.isPending || updateMutation.isPending
            ? "Salvando..." 
            : isEditing 
            ? "Atualizar" 
            : "Criar Usuário"}
        </Button>
      </div>
    </form>
  );
};