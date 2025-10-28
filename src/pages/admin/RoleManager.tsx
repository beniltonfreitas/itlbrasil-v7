import React, { useState } from 'react';
import { useRoleManagement } from '@/hooks/useRoleManagement';
import { useSecurePermissions } from '@/hooks/useSecurePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, UserPlus, Trash2, Search, Users, Crown, Edit, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RoleManager: React.FC = () => {
  const { usersWithRoles, isLoading, addRole, removeRole, isAddingRole, isRemovingRole } = useRoleManagement();
  const { isAdmin } = useSecurePermissions();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'superadmin' | 'admin' | 'editor' | 'author'>('author');
  const [selectedUser, setSelectedUser] = useState<string>('');

  // Filter users based on search term
  const filteredUsers = usersWithRoles.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRole = () => {
    if (!selectedUser || !selectedRole) {
      toast({
        title: "Seleção inválida",
        description: "Selecione um usuário e um role.",
        variant: "destructive",
      });
      return;
    }

    addRole({ userId: selectedUser, role: selectedRole });
    setSelectedUser('');
  };

  const handleRemoveRole = (roleId: string) => {
    removeRole({ roleId });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'editor':
        return <Edit className="h-4 w-4" />;
      case 'author':
        return <FileText className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'editor':
        return 'secondary';
      case 'author':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'Acesso total ao sistema, incluindo criação de admins e configurações críticas';
      case 'admin':
        return 'Acesso administrativo completo, incluindo gerenciamento de conteúdo e usuários';
      case 'editor':
        return 'Pode criar, editar e gerenciar conteúdo';
      case 'author':
        return 'Pode criar e editar próprio conteúdo';
      default:
        return '';
    }
  };

  // Check if current user can manage roles
  if (!isAdmin()) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Roles</h1>
            <p className="text-muted-foreground">
              Acesso negado - apenas administradores podem gerenciar roles.
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
              <p className="text-muted-foreground">
                Você precisa de permissões de administrador para acessar esta funcionalidade.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Roles</h1>
          <p className="text-muted-foreground">
            Gerencie permissões e roles dos usuários do sistema.
          </p>
        </div>
      </div>

      {/* Role descriptions */}
      <div className="grid gap-4 md:grid-cols-4">
        {['superadmin', 'admin', 'editor', 'author'].map((role) => (
          <Card key={role}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                {getRoleIcon(role)}
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {getRoleDescription(role)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Role Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Adicionar Role
          </CardTitle>
          <CardDescription>
            Atribua um novo role a um usuário do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuário</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {usersWithRoles.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleAddRole}
                disabled={isAddingRole || !selectedUser}
                className="w-full"
              >
                {isAddingRole ? 'Adicionando...' : 'Adicionar Role'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users and Roles Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuários e Roles</CardTitle>
              <CardDescription>
                Lista de todos os usuários e seus roles atribuídos.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando usuários...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge
                              key={role.id}
                              variant={getRoleColor(role.role) as any}
                              className="flex items-center gap-1"
                            >
                              {getRoleIcon(role.role)}
                              {role.role}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">Nenhum role</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {user.roles.map((role) => (
                          <AlertDialog key={role.id}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover Role</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover o role "{role.role}" do usuário {user.email}?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveRole(role.id)}
                                  disabled={isRemovingRole}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {isRemovingRole ? 'Removendo...' : 'Remover'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm ? 'Nenhum usuário encontrado.' : 'Nenhum usuário cadastrado.'}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManager;