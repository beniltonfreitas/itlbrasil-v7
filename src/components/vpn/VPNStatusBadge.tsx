import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldOff, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useVPNSession } from '@/hooks/useVPNSession';
import { useNavigate } from 'react-router-dom';

export const VPNStatusBadge: React.FC = () => {
  const { session, disconnectVPN } = useVPNSession();
  const navigate = useNavigate();

  if (!session) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge 
          variant="outline" 
          className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 hover:bg-green-500/20"
        >
          <Shield className="h-3 w-3" />
          <span className="font-medium">{session.is_guest ? 'VPN Guest' : 'VPN ON'}</span>
          <span className="text-[10px] opacity-70">
            {session.server.region}
          </span>
        </Badge>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Conexão VPN Ativa</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-2 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Servidor:</span>
            <span className="font-medium">{session.server.name}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Região:</span>
            <span className="font-medium">{session.server.region}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Latência:</span>
            <span className="font-medium">{session.server.latency_ms}ms</span>
          </div>

          {session.public_ip && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">IP Público:</span>
              <code className="text-xs">{session.public_ip}</code>
            </div>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate('/admin/vpn')}>
          <Settings className="h-4 w-4 mr-2" />
          Configurações VPN
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={disconnectVPN}
          className="text-destructive focus:text-destructive"
        >
          <ShieldOff className="h-4 w-4 mr-2" />
          Desconectar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
