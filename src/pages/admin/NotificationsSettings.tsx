import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Globe, 
  AlertCircle,
  CheckCircle,
  Settings,
  Send
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { PushNotificationsSetup } from "@/components/PushNotificationsSetup";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const notificationsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  adminNotifications: z.boolean(),
  newArticleNotifications: z.boolean(),
  commentNotifications: z.boolean(),
  systemNotifications: z.boolean(),
  securityNotifications: z.boolean(),
  notificationFrequency: z.enum(['immediate', 'hourly', 'daily', 'weekly']),
  quietHoursStart: z.string(),
  quietHoursEnd: z.string(),
  enableQuietHours: z.boolean(),
});

type NotificationsFormData = z.infer<typeof notificationsSchema>;

const NotificationsSettings = () => {
  const form = useForm<NotificationsFormData>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      adminNotifications: true,
      newArticleNotifications: true,
      commentNotifications: true,
      systemNotifications: true,
      securityNotifications: true,
      notificationFrequency: 'immediate',
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      enableQuietHours: false,
    },
  });

  const onSubmit = async (data: NotificationsFormData) => {
    try {
      console.log("Notifications settings saved:", data);
      toast({
        title: "Sucesso",
        description: "Configurações de notificações salvas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações de notificações",
        variant: "destructive",
      });
    }
  };

  const testNotification = (type: string) => {
    toast({
      title: "Notificação de Teste",
      description: `Teste de notificação ${type} enviado com sucesso!`,
    });
  };

  // Mock notification status
  const notificationStatus = {
    emailConfigured: true,
    pushConfigured: false,
    smsConfigured: false,
    lastNotificationSent: "2025-01-25T10:30:00Z",
    totalSentToday: 15,
    totalSentThisWeek: 87,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações de Notificações</h1>
        <p className="text-muted-foreground">
          Configure como e quando receber notificações do sistema
        </p>
      </div>

      {/* Notification Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={notificationStatus.emailConfigured ? "default" : "destructive"}>
                {notificationStatus.emailConfigured ? "Configurado" : "Não configurado"}
              </Badge>
              {notificationStatus.emailConfigured && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Push</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={notificationStatus.pushConfigured ? "default" : "secondary"}>
                {notificationStatus.pushConfigured ? "Configurado" : "Não configurado"}
              </Badge>
              {!notificationStatus.pushConfigured && <AlertCircle className="h-4 w-4 text-orange-500" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationStatus.totalSentToday}</div>
            <p className="text-xs text-muted-foreground">Notificações enviadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationStatus.totalSentThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Última: {formatDate(notificationStatus.lastNotificationSent)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Push Notifications Setup */}
      <PushNotificationsSetup />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Canais de Notificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Notificações por Email
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Receber notificações via email
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => testNotification('email')}
                        >
                          Testar
                        </Button>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pushNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Notificações Push
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Notificações no navegador/dispositivo
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => testNotification('push')}
                        >
                          Testar
                        </Button>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smsNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Notificações por SMS
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Mensagens de texto para eventos críticos
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => testNotification('SMS')}
                        >
                          Testar
                        </Button>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="notificationFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência de notificações</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="immediate">Imediatamente</SelectItem>
                          <SelectItem value="hourly">A cada hora</SelectItem>
                          <SelectItem value="daily">Diariamente</SelectItem>
                          <SelectItem value="weekly">Semanalmente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Tipos de Notificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="adminNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Notificações administrativas</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Alertas sobre sistema e configurações
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
                  name="newArticleNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Novos artigos</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Notificações sobre artigos publicados
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
                  name="commentNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Comentários</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Novos comentários e moderação
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
                  name="systemNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Sistema</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Atualizações e manutenções
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
                  name="securityNotifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Segurança</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Alertas de segurança críticos
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
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Quiet Hours Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Horário Silencioso</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="enableQuietHours"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Ativar horário silencioso</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Pausar notificações não críticas durante horários específicos
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

              {form.watch('enableQuietHours') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quietHoursStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Início do horário silencioso</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quietHoursEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fim do horário silencioso</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={form.handleSubmit(onSubmit)}>
          <Send className="h-4 w-4 mr-2" />
          Salvar Configurações de Notificações
        </Button>
      </div>
    </div>
  );
};

export default NotificationsSettings;