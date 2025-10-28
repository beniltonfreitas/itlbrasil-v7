import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VPNServer {
  id: string;
  name: string;
  region: string;
  host: string;
  port: number;
  protocol: string;
  status: string;
  health_status: string;
  latency_ms: number;
}

interface VPNSession {
  id: string;
  token: string;
  server: VPNServer;
  wsUrl: string;
  status: string;
  public_ip?: string;
  is_guest?: boolean;
  expires_at?: string;
  started_at?: string;
}

export const useVPNSession = () => {
  const [session, setSession] = useState<VPNSession | null>(null);
  const [servers, setServers] = useState<VPNServer[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch available servers (public servers, no auth required)
  const fetchServers = useCallback(async () => {
    try {
      // Temporarily disabled - uncomment after running VPN migration
      // const { data, error } = await supabase
      //   .from('vpn_servers')
      //   .select('*')
      //   .eq('status', 'active')
      //   .order('latency_ms', { ascending: true });

      // if (error) {
      //   console.error('Error fetching VPN servers:', error);
      //   return;
      // }

      // setServers(data || []);
      setServers([]);
    } catch (error) {
      console.error('Exception fetching VPN servers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch active session on mount (supports both guest and authenticated)
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        // Check for guest session in localStorage first
        const guestSessionStr = localStorage.getItem('vpn_guest_session');
        if (guestSessionStr) {
          const guestSession = JSON.parse(guestSessionStr);
          setSession(guestSession);
          return;
        }

        // Check for authenticated session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Temporarily disabled - uncomment after running VPN migration
        // const { data, error } = await supabase
        //   .from('vpn_sessions')
        //   .select('*, vpn_servers(*)')
        //   .eq('user_id_hash', user.id)
        //   .eq('status', 'active')
        //   .eq('is_guest', false)
        //   .order('started_at', { ascending: false })
        //   .limit(1)
        //   .maybeSingle();

        // if (!error && data) {
        //   setSession({
        //     id: data.id,
        //     token: data.session_token,
        //     server: data.vpn_servers,
        //     wsUrl: `wss://${data.vpn_servers.host}:${data.vpn_servers.port}/vpn`,
        //     status: data.status,
        //     public_ip: data.public_ip,
        //     is_guest: false
        //   });
        // }
      } catch (error) {
        console.error('Error checking active session:', error);
      }
    };

    checkActiveSession();
    fetchServers();
  }, [fetchServers]);

  // Connect to VPN (supports guest mode)
  const connectVPN = useCallback(async (serverId?: string, isGuest: boolean = false) => {
    setConnecting(true);
    
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      const selectedServerId = serverId || servers[0]?.id;
      
      if (!selectedServerId) {
        toast({
          title: "Erro",
          description: "Nenhum servidor VPN disponível",
          variant: "destructive"
        });
        return;
      }

      // If not authenticated, force guest mode
      const useGuestMode = !authSession || isGuest;

      const { data, error } = await supabase.functions.invoke('vpn-session', {
        body: { 
          action: 'create', 
          serverId: selectedServerId,
          isGuest: useGuestMode
        }
      });

      if (error) {
        console.error('Error connecting to VPN:', error);
        toast({
          title: "Erro ao conectar",
          description: error.message || "Não foi possível conectar à VPN",
          variant: "destructive"
        });
        return;
      }

      if (data?.success) {
        const newSession = {
          ...data.session,
          is_guest: useGuestMode
        };
        
        setSession(newSession);
        
        // Save guest session to localStorage
        if (useGuestMode) {
          localStorage.setItem('vpn_guest_session', JSON.stringify(newSession));
        }
        
        toast({
          title: useGuestMode ? "VPN conectada (modo guest)" : "VPN conectada",
          description: `Conectado ao servidor ${data.session.server.name}${useGuestMode ? ' - Expira em 30 minutos' : ''}`,
        });
      }
    } catch (error) {
      console.error('Exception connecting to VPN:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao conectar à VPN",
        variant: "destructive"
      });
    } finally {
      setConnecting(false);
    }
  }, [servers, toast]);

  // Disconnect from VPN
  const disconnectVPN = useCallback(async () => {
    if (!session) return;

    try {
      const { data, error } = await supabase.functions.invoke('vpn-session', {
        body: { action: 'terminate', sessionId: session.id }
      });

      if (error) {
        console.error('Error disconnecting from VPN:', error);
        toast({
          title: "Erro ao desconectar",
          description: error.message || "Não foi possível desconectar da VPN",
          variant: "destructive"
        });
        return;
      }

      if (data?.success) {
        setSession(null);
        toast({
          title: "VPN desconectada",
          description: "Você foi desconectado da VPN",
        });
      }
    } catch (error) {
      console.error('Exception disconnecting from VPN:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao desconectar da VPN",
        variant: "destructive"
      });
    }
  }, [session, toast]);

  // Switch server
  const switchServer = useCallback(async (serverId: string) => {
    await disconnectVPN();
    await connectVPN(serverId);
  }, [connectVPN, disconnectVPN]);

  // Upgrade guest session to authenticated session
  const upgradeSession = useCallback(async (userId: string) => {
    if (!session || !session.is_guest) return;

    try {
      const { data, error } = await supabase.functions.invoke('vpn-session', {
        body: { 
          action: 'upgrade', 
          sessionId: session.id,
          userId 
        }
      });

      if (error) {
        console.error('Error upgrading VPN session:', error);
        return;
      }

      if (data?.success) {
        localStorage.removeItem('vpn_guest_session');
        setSession({
          ...session,
          is_guest: false
        });
        
        toast({
          title: "VPN atualizada",
          description: "Sua sessão VPN agora é permanente",
        });
      }
    } catch (error) {
      console.error('Exception upgrading VPN session:', error);
    }
  }, [session, toast]);

  return {
    session,
    servers,
    connecting,
    loading,
    connectVPN,
    disconnectVPN,
    switchServer,
    upgradeSession,
    refreshServers: fetchServers
  };
};
