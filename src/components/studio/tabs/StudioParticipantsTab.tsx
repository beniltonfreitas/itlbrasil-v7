import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { 
  Users, 
  UserPlus, 
  Mic, 
  MicOff, 
  Camera, 
  CameraOff, 
  MoreHorizontal,
  Copy,
  Settings,
  Crown,
  Shield,
  Volume2,
  VolumeX
} from "lucide-react";

interface StudioParticipantsTabProps {
  sessionStatus: 'preparing' | 'live' | 'ended';
}

const StudioParticipantsTab = ({ sessionStatus }: StudioParticipantsTabProps) => {
  const [inviteLink] = useState("https://studio.itl.com/join/abc123");
  
  const participants = [
    {
      id: "1",
      name: "João Silva",
      email: "joao@example.com",
      role: "host",
      status: "connected",
      camera: true,
      microphone: true,
      screenShare: false,
      joinedAt: "14:30"
    },
    {
      id: "2", 
      name: "Maria Santos",
      email: "maria@example.com",
      role: "co-host",
      status: "connected",
      camera: true,
      microphone: false,
      screenShare: false,
      joinedAt: "14:32"
    },
    {
      id: "3",
      name: "Pedro Costa",
      email: "pedro@example.com", 
      role: "guest",
      status: "waiting",
      camera: false,
      microphone: false,
      screenShare: false,
      joinedAt: "14:35"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'waiting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'host': return Crown;
      case 'co-host': return Shield;
      default: return Users;
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Participants List */}
      <ResizablePanel defaultSize={60} className="pr-2">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participantes ({participants.length})
              </CardTitle>
              <Button size="sm" className="bg-primary">
                <UserPlus className="h-4 w-4 mr-2" />
                Convidar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)] overflow-y-auto">
            <div className="grid gap-3">
              {participants.map((participant) => {
                const RoleIcon = getRoleIcon(participant.role);
                return (
                  <Card key={participant.id} className="border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar & Status */}
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {participant.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(participant.status)}`}></div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{participant.name}</h4>
                            <RoleIcon className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline" className="text-xs">
                              {participant.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {participant.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Entrou às {participant.joinedAt}
                          </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1">
                          <Button 
                            variant={participant.microphone ? "ghost" : "secondary"} 
                            size="sm"
                          >
                            {participant.microphone ? (
                              <Mic className="h-4 w-4" />
                            ) : (
                              <MicOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant={participant.camera ? "ghost" : "secondary"} 
                            size="sm"
                          >
                            {participant.camera ? (
                              <Camera className="h-4 w-4" />
                            ) : (
                              <CameraOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant={participant.status === 'connected' ? "ghost" : "secondary"} 
                            size="sm"
                          >
                            {participant.status === 'connected' ? (
                              <Volume2 className="h-4 w-4" />
                            ) : (
                              <VolumeX className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Invite & Controls */}
      <ResizablePanel defaultSize={40} className="pl-2">
        <div className="space-y-4 h-full">
          {/* Invite Link */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Link de Convite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  value={inviteLink}
                  readOnly
                  className="text-sm"
                />
                <Button size="sm" onClick={copyInviteLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Compartilhe este link para convidar participantes
              </p>
            </CardContent>
          </Card>

          {/* Waiting Room */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sala de Espera</CardTitle>
            </CardHeader>
            <CardContent>
              {participants.filter(p => p.status === 'waiting').length > 0 ? (
                <div className="space-y-2">
                  {participants
                    .filter(p => p.status === 'waiting')
                    .map(participant => (
                      <div key={participant.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{participant.name}</p>
                          <p className="text-xs text-muted-foreground">{participant.email}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            Admitir
                          </Button>
                          <Button size="sm" variant="ghost">
                            Negar
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum participante aguardando
                </p>
              )}
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Permissões Padrão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm">
                  <span>Câmera habilitada</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Microfone habilitado</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Pode compartilhar tela</span>
                  <input type="checkbox" className="rounded" />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Aprovação manual</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configurações Avançadas
              </Button>
            </CardContent>
          </Card>

          {/* Session Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conectados:</span>
                <span className="font-medium text-green-500">
                  {participants.filter(p => p.status === 'connected').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Na espera:</span>
                <span className="font-medium text-yellow-500">
                  {participants.filter(p => p.status === 'waiting').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total de entradas:</span>
                <span className="font-medium">{participants.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default StudioParticipantsTab;