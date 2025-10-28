import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSecureAuth } from "@/contexts/SecureAuthContext";

declare global {
  interface Window {
    firebase: any;
  }
}

export const PushNotificationsSetup = () => {
  const { user } = useSecureAuth();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    try {
      setIsConfiguring(true);

      // Verificar suporte
      if (!("Notification" in window)) {
        toast({
          title: "Não Suportado",
          description: "Seu navegador não suporta notificações push",
          variant: "destructive",
        });
        return;
      }

      // Solicitar permissão
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "denied") {
        toast({
          title: "Permissão Negada",
          description: "Você negou as notificações. Ajuste nas configurações do navegador.",
          variant: "destructive",
        });
        return;
      }

      if (result === "granted") {
        // Aguardar Firebase SDK carregar
        await new Promise((resolve) => {
          const checkFirebase = setInterval(() => {
            if (window.firebase) {
              clearInterval(checkFirebase);
              resolve(true);
            }
          }, 100);
          
          // Timeout após 5 segundos
          setTimeout(() => {
            clearInterval(checkFirebase);
            resolve(false);
          }, 5000);
        });

        if (!window.firebase) {
          toast({
            title: "Erro",
            description: "Firebase SDK não carregou. Recarregue a página.",
            variant: "destructive",
          });
          return;
        }

        // Inicializar Firebase
        const firebaseConfig = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
        };

        if (!window.firebase.apps.length) {
          window.firebase.initializeApp(firebaseConfig);
        }

        const messaging = window.firebase.messaging();

        // Obter token FCM
        const token = await messaging.getToken({
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_PUBLIC_KEY,
        });

        setFcmToken(token);
        console.log("FCM Token obtained:", token);

        // Salvar token no Supabase
        const { error } = await supabase.functions.invoke("save-push-token", {
          body: {
            fcm_token: token,
            device_info: {
              browser: navigator.userAgent,
              timestamp: new Date().toISOString(),
            },
          },
        });

        if (error) {
          console.error("Error saving token:", error);
          toast({
            title: "Erro",
            description: "Não foi possível salvar o token de notificação",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "✅ Notificações Ativadas",
          description: "Você receberá alertas de segurança em tempo real",
        });
      }
    } catch (error: any) {
      console.error("Error requesting permission:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao configurar notificações",
        variant: "destructive",
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const sendTestNotification = async () => {
    if (!fcmToken) {
      toast({
        title: "Aviso",
        description: "Configure as notificações primeiro",
        variant: "destructive",
      });
      return;
    }

    try {
      // Criar notificação local de teste
      if (Notification.permission === "granted") {
        new Notification("🔔 Teste de Notificação", {
          body: "Esta é uma notificação de teste do ITL BRASIL",
          icon: "/logo-itl-brasil.png",
          badge: "/logo-itl-brasil.png",
        });

        toast({
          title: "Teste Enviado",
          description: "Você deve ver uma notificação agora",
        });
      }
    } catch (error: any) {
      console.error("Error sending test:", error);
      toast({
        title: "Erro",
        description: "Erro ao enviar notificação de teste",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = () => {
    switch (permission) {
      case "granted":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Ativado
          </Badge>
        );
      case "denied":
        return (
          <Badge variant="destructive" className="gap-1">
            <BellOff className="h-3 w-3" />
            Bloqueado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Não Configurado
          </Badge>
        );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notificações Push Web</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Receba alertas de segurança críticos em tempo real, mesmo quando o site não estiver aberto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === "default" && (
          <Button
            onClick={requestPermission}
            disabled={isConfiguring}
            className="w-full"
          >
            <Bell className="mr-2 h-4 w-4" />
            {isConfiguring ? "Configurando..." : "Ativar Notificações Push"}
          </Button>
        )}

        {permission === "granted" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              ✅ Notificações ativas. Você receberá alertas importantes.
            </p>
            <Button
              onClick={sendTestNotification}
              variant="outline"
              className="w-full"
            >
              Enviar Notificação de Teste
            </Button>
          </div>
        )}

        {permission === "denied" && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-semibold mb-2">Notificações Bloqueadas</p>
            <p>
              Você bloqueou as notificações. Para ativar, acesse as configurações do seu
              navegador e permita notificações para este site.
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>ℹ️ Funciona apenas em HTTPS</p>
          <p>ℹ️ Você pode desativar a qualquer momento nas configurações do navegador</p>
        </div>
      </CardContent>
    </Card>
  );
};
