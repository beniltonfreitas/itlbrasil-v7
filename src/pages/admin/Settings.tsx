import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Save, Users, Shield, Globe, Bell } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const settingsSchema = z.object({
  siteName: z.string().min(1, "Nome do site é obrigatório"),
  siteDescription: z.string().min(1, "Descrição é obrigatória"),
  siteUrl: z.string().url("URL inválida"),
  autoApproval: z.boolean(),
  commentModeration: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const Settings = () => {
  const navigate = useNavigate();
  
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: "ITL Brasil",
      siteDescription: "Portal de notícias sobre geopolítica e relações internacionais",
      siteUrl: "https://itlbrasil.com",
      autoApproval: false,
      commentModeration: true,
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    try {
      // Here you would typically save to a database
      // For now, we'll just show a success message
      console.log("Settings saved:", data);
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'users':
        navigate('/admin/users');
        break;
      case 'security':
        navigate('/admin/security');
        break;
      case 'notifications':
        navigate('/admin/notifications');
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações gerais do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Site Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Configurações do Site
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Site</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="siteDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="siteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Site</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Preferências de Publicação</h3>
                  
                  <FormField
                    control={form.control}
                    name="autoApproval"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Auto-aprovação de artigos</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Artigos importados são automaticamente aprovados
                          </p>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="commentModeration"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel>Moderação de comentários</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Comentários precisam de aprovação antes de serem publicados
                          </p>
                        </div>
                        <FormControl>
                          <Switch 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleQuickAction('users')}
            >
              <Users className="h-4 w-4 mr-2" />
              Gerenciar Usuários
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleQuickAction('security')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Configurações de Segurança
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => handleQuickAction('notifications')}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notificações
            </Button>

            <Separator />

            <Button 
              className="w-full"
              onClick={form.handleSubmit(onSubmit)}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;