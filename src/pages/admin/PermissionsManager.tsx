import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield, Crown, Edit, FileText, Loader2 } from "lucide-react";
import { useAvailablePermissions, useAllRolePermissions, useAddRolePermission, useRemoveRolePermission } from "@/hooks/useRolePermissions";
import { useSecurePermissions } from "@/hooks/useSecurePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PermissionsManager = () => {
  const { isSuperAdmin } = useSecurePermissions();
  const { data: availablePermissions = [], isLoading: loadingPermissions } = useAvailablePermissions();
  const { data: rolePermissions = [], isLoading: loadingRoles } = useAllRolePermissions();
  const addPermission = useAddRolePermission();
  const removePermission = useRemoveRolePermission();

  // Agrupar permissões por categoria
  const permissionsByCategory = availablePermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof availablePermissions>);

  // Verificar se uma role tem uma permissão
  const hasPermission = (role: string, permissionKey: string) => {
    return rolePermissions.some(rp => rp.role === role && rp.permission_key === permissionKey);
  };

  // Toggle permissão
  const handleTogglePermission = async (role: string, permissionKey: string, currentValue: boolean) => {
    if (currentValue) {
      await removePermission.mutateAsync({ role, permissionKey });
    } else {
      await addPermission.mutateAsync({ role, permissionKey });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'editor': return <Edit className="w-4 h-4" />;
      case 'author': return <FileText className="w-4 h-4" />;
      default: return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'editor': return 'secondary';
      case 'author': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'editor': return 'Editor';
      case 'author': return 'Autor';
      default: return role;
    }
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'general': 'Geral',
      'content': 'Conteúdo',
      'users': 'Usuários',
      'settings': 'Configurações',
      'tools': 'Ferramentas',
      'media': 'Mídia',
      'social': 'Redes Sociais',
      'admin': 'Administração'
    };
    return names[category] || category;
  };

  if (!isSuperAdmin()) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Acesso negado. Apenas Super Admins podem gerenciar permissões.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loadingPermissions || loadingRoles) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const roles = ['admin', 'editor', 'author'];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Permissões</h1>
        <p className="text-muted-foreground mt-2">
          Configure quais funcionalidades cada role pode acessar no sistema.
        </p>
      </div>

      <Alert>
        <Crown className="h-4 w-4" />
        <AlertDescription>
          <strong>Super Admins</strong> têm acesso total automático a todas as funcionalidades.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {Object.entries(permissionsByCategory).map(([category, permissions]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle>{getCategoryName(category)}</CardTitle>
              <CardDescription>
                Permissões relacionadas a {getCategoryName(category).toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Header com roles */}
                <div className="grid grid-cols-4 gap-4 pb-2 border-b">
                  <div className="font-semibold">Permissão</div>
                  {roles.map(role => (
                    <div key={role} className="text-center">
                      <Badge variant={getRoleColor(role)} className="gap-1">
                        {getRoleIcon(role)}
                        {getRoleName(role)}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Linhas de permissões */}
                {permissions.map(permission => (
                  <div key={permission.id} className="grid grid-cols-4 gap-4 items-center">
                    <div>
                      <div className="font-medium">{permission.permission_name}</div>
                      {permission.permission_description && (
                        <div className="text-sm text-muted-foreground">
                          {permission.permission_description}
                        </div>
                      )}
                    </div>
                    {roles.map(role => (
                      <div key={`${role}-${permission.permission_key}`} className="flex justify-center">
                        <Switch
                          id={`switch-${role}-${permission.permission_key}`}
                          checked={hasPermission(role, permission.permission_key)}
                          onCheckedChange={() => 
                            handleTogglePermission(
                              role, 
                              permission.permission_key, 
                              hasPermission(role, permission.permission_key)
                            )
                          }
                          disabled={addPermission.isPending || removePermission.isPending}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PermissionsManager;
