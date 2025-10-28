import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Settings,
  Plus,
  Unlink,
  Key,
  Users,
  Bell,
  Link,
  Shield,
  Palette,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const SocialSettings = () => {
  const [connectedAccounts, setConnectedAccounts] = useState([
    {
      id: "1",
      platform: "instagram",
      accountName: "@itlbrasil",
      accountId: "123456789",
      isActive: true,
      connectedAt: "2024-01-10T10:00:00Z",
      lastSync: "2024-01-15T14:30:00Z",
      followerCount: 15420
    },
    {
      id: "2", 
      platform: "linkedin",
      accountName: "ITL Brasil",
      accountId: "987654321",
      isActive: true,
      connectedAt: "2024-01-12T09:15:00Z",
      lastSync: "2024-01-15T13:45:00Z",
      followerCount: 8750
    }
  ]);

  const [notifications, setNotifications] = useState({
    postPublished: true,
    postFailed: true,
    newComments: true,
    newFollowers: false,
    weeklyReport: true,
    monthlyReport: true
  });

  const [brandSettings, setBrandSettings] = useState({
    brandName: "ITL Brasil",
    brandColor: "#3B82F6",
    brandLogo: "",
    defaultHashtags: "#itlbrasil #tecnologia #inovacao",
    signature: "Equipe ITL Brasil"
  });

  const platforms = {
    instagram: { name: "Instagram", icon: Instagram, color: "text-pink-500", bgColor: "bg-pink-50" },
    facebook: { name: "Facebook", icon: Facebook, color: "text-blue-600", bgColor: "bg-blue-50" },
    linkedin: { name: "LinkedIn", icon: Linkedin, color: "text-blue-700", bgColor: "bg-blue-50" },
    twitter: { name: "Twitter", icon: Twitter, color: "text-gray-900", bgColor: "bg-gray-50" },
    youtube: { name: "YouTube", icon: Youtube, color: "text-red-600", bgColor: "bg-red-50" }
  };

  const userRoles = [
    { value: "admin", label: "Administrador" },
    { value: "editor", label: "Editor" },
    { value: "viewer", label: "Visualizador" }
  ];

  const teamMembers = [
    {
      id: "1",
      name: "João Silva",
      email: "joao@itlbrasil.com.br",
      role: "admin",
      permissions: ["create", "edit", "delete", "publish"],
      isActive: true
    },
    {
      id: "2",
      name: "Maria Santos", 
      email: "maria@itlbrasil.com.br",
      role: "editor",
      permissions: ["create", "edit", "publish"],
      isActive: true
    }
  ];

  const webhookUrls = [
    {
      id: "1",
      name: "Zapier Integration",
      url: "https://hooks.zapier.com/hooks/catch/123456/abc123/",
      events: ["post_published", "comment_received"],
      isActive: true
    }
  ];

  const handleConnectAccount = (platform: string) => {
    toast({
      title: "Conectando Conta",
      description: `Redirecionando para autenticação do ${platforms[platform as keyof typeof platforms].name}...`,
    });
    // Aqui seria implementada a integração OAuth
  };

  const handleDisconnectAccount = (accountId: string) => {
    setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
    toast({
      title: "Conta Desconectada",
      description: "A conta foi desconectada com sucesso.",
    });
  };

  const handleToggleAccount = (accountId: string) => {
    setConnectedAccounts(prev => 
      prev.map(acc => 
        acc.id === accountId ? { ...acc, isActive: !acc.isActive } : acc
      )
    );
  };

  const handleSaveSettings = () => {
    toast({
      title: "Configurações Salvas",
      description: "Suas configurações foram atualizadas com sucesso.",
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Configurações Social</h1>
            <p className="text-muted-foreground">
              Configure contas, permissões e integrações das redes sociais
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Badge>
        </div>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="accounts">Contas</TabsTrigger>
            <TabsTrigger value="permissions">Permissões</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="branding">Marca</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-6">
            {/* Contas Conectadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Contas Conectadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectedAccounts.map(account => {
                  const platform = platforms[account.platform as keyof typeof platforms];
                  const Icon = platform.icon;
                  
                  return (
                    <div key={account.id} className={`border rounded-lg p-4 ${platform.bgColor}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Icon className={`h-8 w-8 ${platform.color}`} />
                          <div>
                            <h4 className="font-medium">{account.accountName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {account.followerCount.toLocaleString()} seguidores
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Última sincronização: {new Date(account.lastSync).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={account.isActive}
                            onCheckedChange={() => handleToggleAccount(account.id)}
                          />
                          {account.isActive ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Unlink className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Desconectar Conta</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja desconectar a conta {account.accountName}? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDisconnectAccount(account.id)}>
                                  Desconectar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Conectar Novas Contas */}
            <Card>
              <CardHeader>
                <CardTitle>Conectar Novas Contas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(platforms).map(([key, platform]) => {
                    const Icon = platform.icon;
                    const isConnected = connectedAccounts.some(acc => acc.platform === key);
                    
                    return (
                      <Card key={key} className={`hover:shadow-md transition-shadow ${platform.bgColor}`}>
                        <CardContent className="p-4 text-center">
                          <Icon className={`h-12 w-12 mx-auto mb-3 ${platform.color}`} />
                          <h4 className="font-medium mb-2">{platform.name}</h4>
                          {isConnected ? (
                            <Badge variant="secondary" className="mb-3">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                          ) : (
                            <Button 
                              onClick={() => handleConnectAccount(key)}
                              size="sm" 
                              className="mb-3"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Conectar
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Membros da Equipe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-medium text-primary">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {member.permissions.map(perm => (
                            <Badge key={perm} variant="secondary" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Select value={member.role}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {userRoles.map(role => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Switch checked={member.isActive} />
                    </div>
                  </div>
                ))}
                
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Convidar Novo Membro
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configurações de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Post Publicado</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber notificação quando um post for publicado
                      </p>
                    </div>
                    <Switch
                      checked={notifications.postPublished}
                      onCheckedChange={(value) => 
                        setNotifications(prev => ({ ...prev, postPublished: value }))
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Falha na Publicação</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber notificação quando um post falhar ao publicar
                      </p>
                    </div>
                    <Switch
                      checked={notifications.postFailed}
                      onCheckedChange={(value) => 
                        setNotifications(prev => ({ ...prev, postFailed: value }))
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Novos Comentários</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber notificação sobre novos comentários
                      </p>
                    </div>
                    <Switch
                      checked={notifications.newComments}
                      onCheckedChange={(value) => 
                        setNotifications(prev => ({ ...prev, newComments: value }))
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Relatório Semanal</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber relatório semanal de performance
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReport}
                      onCheckedChange={(value) => 
                        setNotifications(prev => ({ ...prev, weeklyReport: value }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Configurações da Marca
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="brandName">Nome da Marca</Label>
                    <Input
                      id="brandName"
                      value={brandSettings.brandName}
                      onChange={(e) => setBrandSettings(prev => ({ ...prev, brandName: e.target.value }))}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="brandColor">Cor da Marca</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        id="brandColor"
                        type="color"
                        value={brandSettings.brandColor}
                        onChange={(e) => setBrandSettings(prev => ({ ...prev, brandColor: e.target.value }))}
                        className="w-16 h-10"
                      />
                      <Input
                        value={brandSettings.brandColor}
                        onChange={(e) => setBrandSettings(prev => ({ ...prev, brandColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="defaultHashtags">Hashtags Padrão</Label>
                  <Input
                    id="defaultHashtags"
                    value={brandSettings.defaultHashtags}
                    onChange={(e) => setBrandSettings(prev => ({ ...prev, defaultHashtags: e.target.value }))}
                    placeholder="#hashtag1 #hashtag2 #hashtag3"
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="signature">Assinatura Padrão</Label>
                  <Textarea
                    id="signature"
                    value={brandSettings.signature}
                    onChange={(e) => setBrandSettings(prev => ({ ...prev, signature: e.target.value }))}
                    placeholder="Sua assinatura padrão para posts..."
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Webhooks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {webhookUrls.map(webhook => (
                  <div key={webhook.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{webhook.name}</h4>
                      <div className="flex items-center gap-2">
                        <Switch checked={webhook.isActive} />
                        {webhook.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{webhook.url}</p>
                    <div className="flex items-center gap-1">
                      {webhook.events.map(event => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Webhook
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integrações Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Zapier", description: "Automatize workflows com 5000+ apps", status: "connected" },
                    { name: "Make", description: "Plataforma de automação visual", status: "available" },
                    { name: "Buffer", description: "Agendamento e análise de posts", status: "available" },
                    { name: "Canva", description: "Criação de designs profissionais", status: "available" }
                  ].map(integration => (
                    <div key={integration.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{integration.name}</h4>
                        {integration.status === "connected" ? (
                          <Badge variant="secondary">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Conectado
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline">
                            Conectar
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Botão Salvar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Algumas alterações podem levar alguns minutos para serem aplicadas</span>
              </div>
              <Button onClick={handleSaveSettings}>
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default SocialSettings;