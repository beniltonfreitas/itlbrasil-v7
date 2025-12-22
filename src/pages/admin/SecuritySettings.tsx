import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Key, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Smartphone,
  Globe
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const securitySchema = z.object({
  requireMFA: z.boolean(),
  sessionTimeout: z.number().min(15).max(1440), // 15 minutes to 24 hours
  passwordMinLength: z.number().min(6).max(64),
  requireSpecialChars: z.boolean(),
  allowRememberMe: z.boolean(),
  maxLoginAttempts: z.number().min(3).max(10),
  lockoutDuration: z.number().min(5).max(60), // 5 minutes to 1 hour
  allowPublicRegistration: z.boolean(),
  requireEmailVerification: z.boolean(),
});

type SecurityFormData = z.infer<typeof securitySchema>;

const SecuritySettings = () => {
  const form = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      requireMFA: false,
      sessionTimeout: 480, // 8 hours
      passwordMinLength: 8,
      requireSpecialChars: true,
      allowRememberMe: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15, // 15 minutes
      allowPublicRegistration: false,
      requireEmailVerification: true,
    },
  });

  const onSubmit = async (data: SecurityFormData) => {
    try {
      console.log("Security settings saved:", data);
      toast({
        title: "Sucesso",
        description: "Configurações de segurança salvas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações de segurança",
        variant: "destructive",
      });
    }
  };

  // Mock security status
  const securityStatus = {
    mfaEnabled: false,
    sslEnabled: true,
    backupsEnabled: true,
    logsEnabled: true,
    lastSecurityScan: "2025-01-20T10:30:00Z",
    vulnerabilities: 0,
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
        <h1 className="text-3xl font-bold">Configurações de Segurança</h1>
        <p className="text-muted-foreground">
          Configure políticas de segurança e autenticação do sistema
        </p>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do SSL</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={securityStatus.sslEnabled ? "default" : "destructive"}>
                {securityStatus.sslEnabled ? "Ativo" : "Inativo"}
              </Badge>
              {securityStatus.sslEnabled && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Autenticação MFA</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={securityStatus.mfaEnabled ? "default" : "secondary"}>
                {securityStatus.mfaEnabled ? "Ativo" : "Inativo"}
              </Badge>
              {!securityStatus.mfaEnabled && <AlertTriangle className="h-4 w-4 text-orange-500" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backups</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={securityStatus.backupsEnabled ? "default" : "destructive"}>
                {securityStatus.backupsEnabled ? "Ativo" : "Inativo"}
              </Badge>
              {securityStatus.backupsEnabled && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilidades</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {securityStatus.vulnerabilities}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimas {formatDate(securityStatus.lastSecurityScan)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Authentication Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Configurações de Autenticação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="requireMFA"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Autenticação de dois fatores (MFA)</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Exigir MFA para todos os usuários administrativos
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
                  name="sessionTimeout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeout de sessão (minutos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowRememberMe"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Permitir "Lembrar-me"</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Usuários podem manter sessão ativa por mais tempo
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

        {/* Password Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Políticas de Senha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="passwordMinLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamanho mínimo da senha</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requireSpecialChars"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Exigir caracteres especiais</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Senha deve conter símbolos especiais
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
                  name="maxLoginAttempts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de tentativas de login</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lockoutDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duração do bloqueio (minutos)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Registration Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Registro</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="allowPublicRegistration"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Permitir registro público</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Qualquer pessoa pode se registrar no sistema
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
                  name="requireEmailVerification"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Exigir verificação de email</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Usuários devem confirmar email antes do acesso
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

      {/* VPN Corporativa - Em breve */}
      <Card className="border-dashed border-2 border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            VPN Corporativa
            <Badge variant="secondary" className="ml-2">
              <Clock className="h-3 w-3 mr-1" />
              Em breve
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Proteção VPN para sessões administrativas será disponibilizada em futuras atualizações. 
            Este recurso permitirá conexões seguras e criptografadas para acesso ao painel administrativo.
          </p>
          <div className="mt-4 flex items-center justify-between opacity-50 pointer-events-none">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Ativar VPN nas sessões administrativas</p>
              <p className="text-xs text-muted-foreground">Funcionalidade em desenvolvimento</p>
            </div>
            <Switch disabled checked={false} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={form.handleSubmit(onSubmit)}>
          <Shield className="h-4 w-4 mr-2" />
          Salvar Configurações de Segurança
        </Button>
      </div>
    </div>
  );
};

export default SecuritySettings;