import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVPNSession } from '@/hooks/useVPNSession';
import { Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

export const VPNToggle: React.FC = () => {
  const { session, servers, connecting, connectVPN, disconnectVPN } = useVPNSession();
  const [enabled, setEnabled] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string>('');

  // Restore VPN state from localStorage or active session
  useEffect(() => {
    if (session) {
      setEnabled(true);
      if (session.server?.id) {
        setSelectedServer(session.server.id);
      }
    } else {
      const savedToggle = localStorage.getItem('vpn_toggle_enabled');
      if (savedToggle === 'true') {
        setEnabled(true);
      }
    }
  }, [session]);

  const handleToggle = async (checked: boolean) => {
    setEnabled(checked);
    localStorage.setItem('vpn_toggle_enabled', checked.toString());
    
    if (checked) {
      const serverId = selectedServer || servers[0]?.id;
      if (serverId) {
        // Guest mode when not authenticated
        await connectVPN(serverId, true);
      }
    } else {
      await disconnectVPN();
    }
  };

  return (
    <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-background/5 backdrop-blur-sm">
      {/* Toggle Switch */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className={`h-4 w-4 ${enabled ? 'text-green-500' : 'text-muted-foreground'}`} />
          <label className="text-sm font-medium text-foreground">
            Ativar VPN neste acesso
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  A VPN protege sua sessão e os dados trafegados dentro do portal.
                  Recomendado para conexões públicas ou não confiáveis.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center gap-2">
          {session && (
            <Badge 
              variant="outline" 
              className="bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
            >
              {session.is_guest ? 'Guest' : 'Conectado'}
            </Badge>
          )}
          {connecting && (
            <Badge variant="secondary">Conectando...</Badge>
          )}
          <Switch
            checked={enabled || !!session}
            onCheckedChange={handleToggle}
            disabled={connecting}
          />
        </div>
      </div>

      {/* Guest Mode Warning */}
      {session?.is_guest && (
        <Alert className="bg-blue-500/5 border-blue-500/20">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-xs text-muted-foreground">
            Sessões VPN guest expiram em 30 minutos. Faça login para obter sessão ilimitada.
          </AlertDescription>
        </Alert>
      )}

      {/* Server Selection */}
      {enabled && !session && servers.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            Servidor VPN
          </label>
          <Select
            value={selectedServer}
            onValueChange={setSelectedServer}
            disabled={connecting}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecione o servidor..." />
            </SelectTrigger>
            <SelectContent>
              {servers.map((server) => (
                <SelectItem key={server.id} value={server.id}>
                  <div className="flex items-center justify-between gap-2 w-full">
                    <span>{server.name}</span>
                    <div className="flex items-center gap-1">
                      {server.health_status === 'healthy' && (
                        <Badge variant="outline" className="text-[10px] px-1">
                          {server.latency_ms}ms
                        </Badge>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Status Indicator */}
      {session && (
        <div className="flex items-center gap-2 pt-1">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">
            Conectado: {session.server.name} ({session.server.latency_ms}ms)
          </span>
        </div>
      )}

      {connecting && (
        <div className="flex items-center gap-2 pt-1">
          <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">
            Conectando ao servidor VPN...
          </span>
        </div>
      )}
    </div>
  );
};
