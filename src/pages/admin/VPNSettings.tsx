import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, ShieldOff, Server, Activity, Settings, Info, AlertCircle } from 'lucide-react';
import { useVPNSession } from '@/hooks/useVPNSession';
import { Separator } from '@/components/ui/separator';

export const VPNSettings: React.FC = () => {
  const { session, servers, connecting, connectVPN, disconnectVPN, switchServer } = useVPNSession();
  const [killSwitch, setKillSwitch] = useState(true);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [secureDNS, setSecureDNS] = useState(true);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ativar VPN</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua conexão VPN e configure as opções de segurança
          </p>
        </div>
        
        {session && (
          <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            {session.is_guest ? 'Conectado (Guest)' : 'Conectado'}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Guest Mode Warning */}
      {session?.is_guest && (
        <Alert className="bg-yellow-500/5 border-yellow-500/20">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <AlertTitle className="text-yellow-600 dark:text-yellow-400">
            Sessão VPN Temporária (Guest)
          </AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground mt-2">
            Você está usando VPN em modo guest, que expira em 30 minutos. 
            Esta sessão foi iniciada antes do login e oferece proteção limitada.
            Faça logout e login novamente para converter em sessão VPN ilimitada.
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {session ? (
              <Shield className="h-5 w-5 text-green-500" />
            ) : (
              <ShieldOff className="h-5 w-5 text-muted-foreground" />
            )}
            <CardTitle>Status da Conexão</CardTitle>
          </div>
          <CardDescription>
            Informações sobre sua conexão VPN atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Servidor</span>
                  <p className="font-medium">{session.server.name}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Região</span>
                  <p className="font-medium">{session.server.region}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Protocolo</span>
                  <p className="font-medium uppercase">{session.server.protocol}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Latência</span>
                  <p className="font-medium">{session.server.latency_ms}ms</p>
                </div>

                {session.public_ip && (
                  <div className="space-y-1 col-span-2">
                    <span className="text-sm text-muted-foreground">IP Público</span>
                    <code className="block font-mono text-sm">{session.public_ip}</code>
                  </div>
                )}
              </div>

              <Separator />

              <Button 
                variant="destructive" 
                onClick={disconnectVPN}
                className="w-full"
              >
                <ShieldOff className="h-4 w-4 mr-2" />
                Desconectar VPN
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShieldOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma conexão VPN ativa
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Conecte-se a um servidor para proteger sua navegação
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Servers */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            <CardTitle>Servidores Disponíveis</CardTitle>
          </div>
          <CardDescription>
            Escolha um servidor VPN para se conectar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {servers.map((server) => (
              <div
                key={server.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Activity 
                    className={`h-4 w-4 ${
                      server.health_status === 'healthy' 
                        ? 'text-green-500' 
                        : 'text-yellow-500'
                    }`} 
                  />
                  <div>
                    <p className="font-medium">{server.name}</p>
                    <p className="text-xs text-muted-foreground">{server.region}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {server.latency_ms}ms
                  </Badge>
                  
                  {session?.server.id === server.id ? (
                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30">
                      Conectado
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => session ? switchServer(server.id) : connectVPN(server.id)}
                      disabled={connecting}
                    >
                      {session ? 'Trocar' : 'Conectar'}
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {servers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum servidor disponível no momento</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Configurações de Segurança</CardTitle>
          </div>
          <CardDescription>
            Personalize as opções de segurança da sua VPN
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="font-medium">Kill Switch</label>
              <p className="text-sm text-muted-foreground">
                Bloqueia o tráfego do portal se a VPN desconectar
              </p>
            </div>
            <Switch 
              checked={killSwitch} 
              onCheckedChange={setKillSwitch}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="font-medium">Auto-reconexão</label>
              <p className="text-sm text-muted-foreground">
                Reconecta automaticamente se a conexão cair
              </p>
            </div>
            <Switch 
              checked={autoReconnect} 
              onCheckedChange={setAutoReconnect}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="font-medium">DNS Seguro (DoH)</label>
              <p className="text-sm text-muted-foreground">
                Usa DNS sobre HTTPS para prevenir vazamentos
              </p>
            </div>
            <Switch 
              checked={secureDNS} 
              onCheckedChange={setSecureDNS}
            />
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-blue-600 dark:text-blue-400">
                Sobre a VPN do Portal
              </p>
              <p className="text-sm text-muted-foreground">
                A VPN deste portal cifra e roteia apenas o tráfego deste site e serviços 
                integrados autorizados. Para proteção completa do dispositivo, considere 
                usar uma VPN no nível do sistema operacional.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
