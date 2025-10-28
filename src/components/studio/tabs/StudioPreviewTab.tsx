import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { 
  MonitorPlay, 
  Maximize, 
  Settings, 
  ScreenShare, 
  Camera, 
  Mic, 
  Volume2,
  Eye,
  Wifi
} from "lucide-react";

interface StudioPreviewTabProps {
  sessionStatus: 'preparing' | 'live' | 'ended';
  selectedMode: 'easy' | 'advanced';
}

const StudioPreviewTab = ({ sessionStatus, selectedMode }: StudioPreviewTabProps) => {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Main Preview Area */}
      <ResizablePanel defaultSize={75} className="pr-2">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MonitorPlay className="h-5 w-5" />
                Preview da Transmissão
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Maximize className="h-4 w-4 mr-1" />
                  Tela Cheia
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Configurar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100%-4rem)] p-4">
            {/* Video Preview Area */}
            <div className="relative h-full bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
              <div className="text-center">
                <MonitorPlay className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Preview da Transmissão</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {sessionStatus === 'live' 
                    ? 'Transmitindo ao vivo para suas audiências'
                    : 'Configure suas fontes de vídeo e áudio para começar'
                  }
                </p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Câmera
                  </Button>
                  <Button variant="outline" size="sm">
                    <ScreenShare className="h-4 w-4 mr-2" />
                    Tela
                  </Button>
                </div>
              </div>

              {/* Live Indicator */}
              {sessionStatus === 'live' && (
                <div className="absolute top-4 left-4">
                  <Badge variant="destructive" className="animate-pulse">
                    <Wifi className="h-3 w-3 mr-1" />
                    AO VIVO
                  </Badge>
                </div>
              )}

              {/* Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-background/90 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Camera className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">142</span>
                    <span className="text-muted-foreground">visualizadores</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Side Panel */}
      <ResizablePanel defaultSize={25} className="pl-2">
        <div className="space-y-4 h-full">
          {/* Quick Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status da Sessão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={sessionStatus === 'live' ? 'destructive' : 'secondary'}>
                  {sessionStatus === 'live' ? 'Ao Vivo' : 'Preparando'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Modo:</span>
                <Badge variant="outline">
                  {selectedMode === 'easy' ? 'Fácil' : 'Avançado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duração:</span>
                <span className="text-sm font-medium">
                  {sessionStatus === 'live' ? '00:15:32' : '--:--:--'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ScreenShare className="h-4 w-4 mr-2" />
                Compartilhar Tela
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Camera className="h-4 w-4 mr-2" />
                Alterar Layout
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </CardContent>
          </Card>

          {/* Stream Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Saúde da Stream</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Qualidade</span>
                  <span className="text-green-500 font-medium">Excelente</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full">
                  <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bitrate</span>
                  <span className="font-medium">2.5 Mbps</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>FPS</span>
                  <span className="font-medium">30 fps</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default StudioPreviewTab;