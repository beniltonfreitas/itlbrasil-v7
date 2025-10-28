import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  UserPlus, 
  Mic, 
  Camera, 
  MicOff, 
  CameraOff,
  ScreenShare,
  MessageSquare,
  Volume2,
  Settings,
  Link,
  Grid3X3,
  MonitorPlay,
  User
} from "lucide-react";

interface StudioModeEasyProps {
  sessionStatus: 'preparing' | 'live' | 'ended';
}

const StudioModeEasy = ({ sessionStatus }: StudioModeEasyProps) => {
  const [participants] = useState([
    { id: '1', name: 'Apresentador Principal', role: 'host', camera: true, mic: true, status: 'joined' },
    { id: '2', name: 'Convidado 1', role: 'guest', camera: true, mic: false, status: 'joined' },
    { id: '3', name: 'Convidado 2', role: 'guest', camera: false, mic: true, status: 'invited' }
  ]);

  const [selectedLayout, setSelectedLayout] = useState('fullscreen');
  const [chatMessages] = useState([
    { user: 'Viewer1', message: 'Ótimo programa!', time: '10:30' },
    { user: 'Viewer2', message: 'Quando sai o próximo episódio?', time: '10:31' },
    { user: 'Viewer3', message: 'Excelente conteúdo!', time: '10:32' }
  ]);

  const layouts = [
    { id: 'fullscreen', name: 'Tela Cheia', icon: MonitorPlay },
    { id: 'sidebyside', name: 'Lado a Lado', icon: Grid3X3 },
    { id: 'grid', name: 'Grade', icon: Grid3X3 },
    { id: 'picture', name: 'Picture in Picture', icon: MonitorPlay }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'joined': return 'bg-green-500';
      case 'invited': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 h-[500px]">
      {/* Left Panel - Participants & Controls */}
      <div className="space-y-4">
        {/* Participants */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participantes ({participants.length}/10)
              </CardTitle>
              <Button size="sm" variant="outline">
                <UserPlus className="h-4 w-4 mr-1" />
                Convidar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg border border-muted">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(participant.status)}`} />
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{participant.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {participant.role === 'host' ? 'Apresentador' : 'Convidado'}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant={participant.mic ? "default" : "outline"}>
                    {participant.mic ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                  </Button>
                  <Button size="sm" variant={participant.camera ? "default" : "outline"}>
                    {participant.camera ? <Camera className="h-3 w-3" /> : <CameraOff className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            ))}
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="invite-link">Link de Convite</Label>
              <div className="flex gap-2">
                <Input 
                  id="invite-link"
                  value="https://studio.itlbrasil.com/join/abc123"
                  readOnly
                  className="text-xs"
                />
                <Button size="sm" variant="outline">
                  <Link className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Layout da Transmissão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {layouts.map((layout) => (
                <Button 
                  key={layout.id}
                  variant={selectedLayout === layout.id ? "default" : "outline"}
                  className="h-16 flex-col gap-1"
                  onClick={() => setSelectedLayout(layout.id)}
                >
                  <layout.icon className="h-4 w-4" />
                  <span className="text-xs">{layout.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center Panel - Video Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Preview da Transmissão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative">
            <div className="text-white text-center">
              <MonitorPlay className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">Preview será exibido aqui</p>
            </div>
            
            {sessionStatus === 'live' && (
              <Badge className="absolute top-2 left-2 bg-red-600">
                AO VIVO
              </Badge>
            )}
            
            <div className="absolute bottom-2 right-2 flex gap-2">
              <Button size="sm" variant="secondary">
                <ScreenShare className="h-3 w-3 mr-1" />
                Compartilhar Tela
              </Button>
              <Button size="sm" variant="secondary">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">1,247 espectadores</span>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Audio OK</span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {sessionStatus === 'live' ? '⚫ REC 00:15:32' : 'Não gravando'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Panel - Chat & Settings */}
      <div className="space-y-4">
        {/* Live Chat */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat ao Vivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 overflow-y-auto space-y-2 mb-3">
              {chatMessages.map((msg, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-primary">{msg.user}</span>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className="text-muted-foreground">{msg.message}</p>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input placeholder="Responder no chat..." className="text-sm" />
              <Button size="sm">Enviar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Configurações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Chat Habilitado</Label>
              <Button size="sm" variant="outline">ON</Button>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Gravação</Label>
              <Button size="sm" variant="outline">ON</Button>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Multistream</Label>
              <Button size="sm" variant="outline">OFF</Button>
            </div>
            
            <Separator />
            
            <Button className="w-full" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurações Avançadas
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudioModeEasy;