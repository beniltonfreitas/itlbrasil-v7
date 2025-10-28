import { useSecureAuth } from "@/contexts/SecureAuthContext";
import { useSecurePermissions } from "@/hooks/useSecurePermissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DebugPermissions = () => {
  const { user, session } = useSecureAuth();
  const { 
    userRoles, 
    loading, 
    hasRole, 
    isSuperAdmin, 
    isAdmin,
    getPrimaryRole,
    refreshRoles 
  } = useSecurePermissions();

  const [copied, setCopied] = useState(false);

  const handleRefresh = async () => {
    toast.info("Atualizando permissões...");
    await refreshRoles();
    toast.success("Permissões atualizadas!");
  };

  const copyToClipboard = async () => {
    const debugInfo = JSON.stringify({
      user: {
        id: user?.id,
        email: user?.email,
        created_at: user?.created_at
      },
      session: {
        access_token: session?.access_token ? "presente" : "ausente",
        expires_at: session?.expires_at
      },
      roles: userRoles.map(r => ({
        id: r.id,
        role: r.role,
        created_at: r.created_at
      })),
      permissions: {
        isSuperAdmin: isSuperAdmin(),
        isAdmin: isAdmin(),
        primaryRole: getPrimaryRole()
      }
    }, null, 2);

    await navigator.clipboard.writeText(debugInfo);
    setCopied(true);
    toast.success("Informações copiadas!");
    setTimeout(() => setCopied(false), 2000);
  };

  const allRoles = ['superadmin', 'admin', 'editor', 'author'] as const;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Diagnóstico de Permissões</h1>
          <p className="text-muted-foreground mt-2">
            Verifique o estado atual do sistema de autenticação e permissões
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={copyToClipboard} variant="outline" size="sm">
            {copied ? <CheckCheck className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copiado!" : "Copiar Debug"}
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {user ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Informações do Usuário
            </CardTitle>
            <CardDescription>Dados de autenticação do Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-mono text-sm">{user?.email || "Não autenticado"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
              <p className="font-mono text-xs break-all">{user?.id || "N/A"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sessão</p>
              <Badge variant={session ? "default" : "destructive"}>
                {session ? "Ativa" : "Inativa"}
              </Badge>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Criado em</p>
              <p className="text-sm">{user?.created_at ? new Date(user.created_at).toLocaleString('pt-BR') : "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Roles Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {loading ? (
                <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />
              ) : userRoles.length > 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Roles Atribuídas
            </CardTitle>
            <CardDescription>
              {loading ? "Carregando..." : `${userRoles.length} role(s) encontrada(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Buscando roles...</span>
              </div>
            ) : userRoles.length === 0 ? (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Nenhuma role encontrada
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Este usuário não possui permissões atribuídas na tabela user_roles.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {userRoles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <Badge variant="default" className="capitalize">
                        {role.role}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {role.id}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(role.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions Check Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Verificação de Permissões</CardTitle>
            <CardDescription>Teste de funções de permissão individuais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {allRoles.map((role) => {
                const hasThisRole = hasRole(role);
                return (
                  <div key={role} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium capitalize">{role}</span>
                    {hasThisRole ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Sim
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        Não
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <h4 className="font-semibold">Funções Compostas</h4>
              <div className="grid gap-2">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>isSuperAdmin()</span>
                  <Badge variant={isSuperAdmin() ? "default" : "outline"}>
                    {isSuperAdmin() ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>isAdmin()</span>
                  <Badge variant={isAdmin() ? "default" : "outline"}>
                    {isAdmin() ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>getPrimaryRole()</span>
                  <Badge variant="secondary" className="capitalize">
                    {getPrimaryRole() || "Nenhuma"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Troubleshooting Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Guia de Solução de Problemas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">❌ Nenhuma role encontrada</h4>
              <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                <li>Verifique se você está logado com o email correto</li>
                <li>Confirme se as roles foram criadas no banco de dados</li>
                <li>Execute a query: <code className="bg-background px-1 py-0.5 rounded">SELECT * FROM user_roles WHERE user_id = '{user?.id}'</code></li>
                <li>Use o bootstrap-superadmin Edge Function para criar o primeiro superadmin</li>
              </ul>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">⚠️ Menus não aparecem</h4>
              <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                <li>Verifique se "Loading" está como false</li>
                <li>Confirme que as roles foram carregadas (count &gt; 0)</li>
                <li>Abra o console do navegador (F12) para ver os logs de debug</li>
                <li>Clique em "Atualizar" acima para forçar reload das permissões</li>
              </ul>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">🔧 Logs de Debug</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Todos os logs de debug são prefixados com emojis para fácil identificação:
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside font-mono text-xs">
                <li>🔐 - Eventos de autenticação</li>
                <li>🔍 - Buscas no banco de dados</li>
                <li>✅ - Operações bem-sucedidas</li>
                <li>❌ - Erros</li>
                <li>🎨 - Renderização do AdminLayout</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPermissions;
