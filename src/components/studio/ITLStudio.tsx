import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Video, 
  Users, 
  Settings, 
  Play, 
  Square, 
  MonitorPlay,
  Zap,
  Mic,
  Camera,
  ScreenShare,
  Palette,
  Volume2,
  Circle,
  Youtube,
  Facebook,
  Instagram,
  Twitch
} from "lucide-react";
import StudioPreviewTab from "./tabs/StudioPreviewTab";
import StudioParticipantsTab from "./tabs/StudioParticipantsTab";
import StudioChatTab from "./tabs/StudioChatTab";
import StudioControlsTab from "./tabs/StudioControlsTab";
import StudioPlatformsTab from "./tabs/StudioPlatformsTab";
import StudioAnalyticsTab from "./tabs/StudioAnalyticsTab";

interface ITLStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITLStudio = ({ isOpen, onClose }: ITLStudioProps) => {
  const [selectedMode, setSelectedMode] = useState<'easy' | 'advanced'>('easy');
  const [sessionStatus, setSessionStatus] = useState<'preparing' | 'live' | 'ended'>('preparing');

  const features = {
    easy: [
      { icon: Users, title: "Até 10 Participantes", desc: "Convide via link" },
      { icon: MonitorPlay, title: "Layouts Automáticos", desc: "Tela cheia, grade, lado a lado" },
      { icon: Palette, title: "Marca Personalizada", desc: "Logo, banners, sobreposições" },
      { icon: Volume2, title: "Chat Integrado", desc: "Interação com audiência" },
      { icon: ScreenShare, title: "Compartilhamento", desc: "Tela, imagens, vídeos" },
      { icon: Circle, title: "Gravação Automática", desc: "Salvo na biblioteca" }
    ],
    advanced: [
      { icon: Video, title: "Múltiplas Cenas", desc: "Gerenciamento profissional" },
      { icon: Settings, title: "Camadas Avançadas", desc: "Vídeo, áudio, sobreposições" },
      { icon: Zap, title: "Chroma Key", desc: "Remoção de fundo verde" },
      { icon: Mic, title: "Mixagem de Áudio", desc: "Controles profissionais" },
      { icon: Camera, title: "Direção ao Vivo", desc: "Cortes e transições" },
      { icon: MonitorPlay, title: "Captura NDI/RTMP", desc: "Fontes profissionais" }
    ]
  };

  const platforms = [
    { icon: Youtube, name: "YouTube Live", connected: false, color: "text-red-500" },
    { icon: Facebook, name: "Facebook Live", connected: false, color: "text-blue-600" },
    { icon: Instagram, name: "Instagram Live", connected: false, color: "text-pink-500" },
    { icon: Twitch, name: "Twitch", connected: false, color: "text-purple-500" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] h-[95vh] p-0">
        <DialogHeader className="p-4 pb-0 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <Video className="h-4 w-4 text-white" />
              </div>
              ITL Studio
              <Badge variant={sessionStatus === 'live' ? 'destructive' : 'secondary'}>
                {sessionStatus === 'live' ? 'AO VIVO' : 'PREPARANDO'}
              </Badge>
            </DialogTitle>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {selectedMode === 'easy' ? 'Modo Fácil' : 'Modo Avançado'}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedMode(selectedMode === 'easy' ? 'advanced' : 'easy')}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Alternar
                </Button>
              </div>
              
              {sessionStatus === 'preparing' ? (
                <Button 
                  size="sm" 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => setSessionStatus('live')}
                >
                  <Play className="h-3 w-3 mr-2" />
                  Iniciar Transmissão
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => setSessionStatus('ended')}
                >
                  <Square className="h-3 w-3 mr-2" />
                  Encerrar
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="preview" className="h-full flex flex-col">
            <div className="px-4 py-2 border-b">
              <TabsList className="w-full justify-start bg-muted/30">
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <MonitorPlay className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="participants" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Participantes
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Chat & Interação
                </TabsTrigger>
                <TabsTrigger value="controls" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Controles
                </TabsTrigger>
                <TabsTrigger value="platforms" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Plataformas
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <Circle className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              {/* Preview Tab */}
              <TabsContent value="preview" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <StudioPreviewTab sessionStatus={sessionStatus} selectedMode={selectedMode} />
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Participants Tab */}
              <TabsContent value="participants" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <StudioParticipantsTab sessionStatus={sessionStatus} />
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Chat Tab */}
              <TabsContent value="chat" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <StudioChatTab sessionStatus={sessionStatus} />
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Controls Tab */}
              <TabsContent value="controls" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <StudioControlsTab sessionStatus={sessionStatus} selectedMode={selectedMode} features={features} />
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Platforms Tab */}
              <TabsContent value="platforms" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <StudioPlatformsTab platforms={platforms} />
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <StudioAnalyticsTab sessionStatus={sessionStatus} />
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ITLStudio;