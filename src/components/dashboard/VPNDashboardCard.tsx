import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVPNSession } from "@/hooks/useVPNSession";
import { Shield, Activity, Clock, Globe, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VPN_STATES = [
  { value: 'BR-SP', label: 'São Paulo' },
  { value: 'BR-RJ', label: 'Rio de Janeiro' },
  { value: 'BR-MG', label: 'Minas Gerais' },
  { value: 'BR-RS', label: 'Rio Grande do Sul' },
  { value: 'BR-BA', label: 'Bahia' },
  { value: 'BR-DF', label: 'Brasília' },
  { value: 'BR-PR', label: 'Paraná' },
  { value: 'BR-SC', label: 'Santa Catarina' },
];

export const VPNDashboardCard = () => {
  const { session, servers, connecting, connectVPN, disconnectVPN, loading } = useVPNSession();
  const [selectedRegion, setSelectedRegion] = useState<string>('BR-SP');
  const [connectionTime, setConnectionTime] = useState<string>('0min');
  const navigate = useNavigate();

  const isConnected = session?.status === 'active';
  const isGuest = session?.is_guest;

  // Update connection time every minute
  useEffect(() => {
    if (!isConnected || !session?.started_at) {
      setConnectionTime('0min');
      return;
    }

    const updateTime = () => {
      const now = Date.now();
      const start = new Date(session.started_at).getTime();
      const diff = now - start;
      
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        setConnectionTime(`${hours}h ${minutes % 60}min`);
      } else {
        setConnectionTime(`${minutes}min`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isConnected, session?.started_at]);

  // Mask IP for privacy (LGPD compliance)
  const maskIP = (ip: string | undefined): string => {
    if (!ip) return 'N/A';
    const parts = ip.split('.');
    if (parts.length !== 4) return ip;
    return `${parts[0]}.${parts[1]}.***.**`;
  };

  // Get latency indicator
  const getLatencyColor = (latency: number | undefined): string => {
    if (!latency) return 'text-muted-foreground';
    if (latency < 50) return 'text-green-600 dark:text-green-400';
    if (latency < 150) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      // Find best server for selected region
      const regionalServers = servers.filter(s => s.region === selectedRegion);
      const bestServer = regionalServers.sort((a, b) => a.latency_ms - b.latency_ms)[0];
      
      if (bestServer) {
        await connectVPN(bestServer.id);
      } else if (servers.length > 0) {
        // Fallback to any available server
        await connectVPN(servers[0].id);
      }
    } else {
      await disconnectVPN();
    }
  };

  const handleRegionChange = async (region: string) => {
    setSelectedRegion(region);
    
    // If already connected, switch to a server in the new region
    if (isConnected) {
      const regionalServers = servers.filter(s => s.region === region);
      const bestServer = regionalServers.sort((a, b) => a.latency_ms - b.latency_ms)[0];
      
      if (bestServer) {
        await disconnectVPN();
        await connectVPN(bestServer.id);
      }
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`} />
            <CardTitle>Conexão VPN Segura</CardTitle>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "animate-pulse" : ""}>
            {isConnected ? (isGuest ? 'Conectado (Guest)' : 'Conectado') : 'Desconectado'}
          </Badge>
        </div>
        <CardDescription>
          {isConnected 
            ? 'Sua conexão está protegida e criptografada' 
            : 'Ative a VPN para proteger sua navegação'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle and Server Selection */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <label htmlFor="vpn-toggle" className="text-sm font-medium">
                {isConnected ? 'Desativar VPN' : 'Ativar VPN'}
              </label>
              <p className="text-xs text-muted-foreground">
                {connecting ? 'Conectando...' : isConnected ? 'Clique para desconectar' : 'Clique para conectar'}
              </p>
            </div>
            <Switch
              id="vpn-toggle"
              checked={isConnected}
              onCheckedChange={handleToggle}
              disabled={connecting || loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Servidor</label>
            <Select 
              value={selectedRegion} 
              onValueChange={handleRegionChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um estado" />
              </SelectTrigger>
              <SelectContent>
                {VPN_STATES.map(state => {
                  const serverCount = servers.filter(s => s.region === state.value).length;
                  return (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label} {serverCount > 0 && `(${serverCount})`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Connection Status */}
        {isConnected && session && (
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <p className="text-sm font-medium">Status da Conexão</p>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>IP Público:</span>
                </div>
                <span className="font-mono">{maskIP(session.public_ip)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>Latência:</span>
                </div>
                <span className={`font-mono ${getLatencyColor(session.server?.latency_ms)}`}>
                  {session.server?.latency_ms || 'N/A'}ms
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Servidor:</span>
                </div>
                <span className="text-foreground">{session.server?.name || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Tempo Online:</span>
                </div>
                <span className="font-mono">{connectionTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* Guest Warning */}
        {isGuest && (
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              ⚠️ Sessão VPN temporária (expira em 30min). Faça login para sessão ilimitada.
            </p>
          </div>
        )}

        {/* Advanced Settings Link */}
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => navigate('/admin/vpn')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurações Avançadas
        </Button>
      </CardContent>
    </Card>
  );
};
