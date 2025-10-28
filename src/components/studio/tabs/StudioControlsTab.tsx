import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Slider } from "@/components/ui/slider";
import { 
  Settings, 
  Palette, 
  Volume2, 
  Mic, 
  Camera, 
  ScreenShare,
  MonitorPlay,
  Grid3X3,
  Square,
  Maximize,
  Zap,
  Layers,
  Music,
  Image as ImageIcon,
  Type,
  Filter
} from "lucide-react";

interface StudioControlsTabProps {
  sessionStatus: 'preparing' | 'live' | 'ended';
  selectedMode: 'easy' | 'advanced';
  features: any;
}

const StudioControlsTab = ({ sessionStatus, selectedMode, features }: StudioControlsTabProps) => {
  const layouts = [
    { id: 'fullscreen', name: 'Tela Cheia', icon: Maximize },
    { id: 'sidebyside', name: 'Lado a Lado', icon: Square },
    { id: 'grid', name: 'Grade', icon: Grid3X3 },
    { id: 'pip', name: 'Picture in Picture', icon: MonitorPlay }
  ];

  const audioSources = [
    { id: 'mic1', name: 'Microfone Principal', level: 85, muted: false },
    { id: 'mic2', name: 'Microfone Convidado', level: 70, muted: false },
    { id: 'music', name: 'Música de Fundo', level: 25, muted: true },
    { id: 'system', name: 'Áudio do Sistema', level: 60, muted: false }
  ];

  const videoSources = [
    { id: 'cam1', name: 'Câmera Principal', active: true },
    { id: 'cam2', name: 'Câmera Secundária', active: false },
    { id: 'screen', name: 'Compartilhamento de Tela', active: false },
    { id: 'media', name: 'Arquivo de Vídeo', active: false }
  ];

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Main Controls */}
      <ResizablePanel defaultSize={60} className="pr-2">
        <div className="space-y-4 h-full">
          {/* Layouts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MonitorPlay className="h-5 w-5" />
                Layouts de Transmissão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {layouts.map((layout) => (
                  <Button
                    key={layout.id}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2"
                  >
                    <layout.icon className="h-6 w-6" />
                    <span className="text-xs">{layout.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Video Sources */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Fontes de Vídeo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {videoSources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${source.active ? 'bg-red-500' : 'bg-muted'}`}></div>
                      <span className="text-sm font-medium">{source.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button variant={source.active ? "default" : "outline"} size="sm">
                        {source.active ? "Ativo" : "Ativar"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Features (only in advanced mode) */}
          {selectedMode === 'advanced' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Recursos Avançados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1">
                    <Zap className="h-5 w-5" />
                    <span className="text-xs">Chroma Key</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1">
                    <Filter className="h-5 w-5" />
                    <span className="text-xs">Filtros</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1">
                    <Type className="h-5 w-5" />
                    <span className="text-xs">Textos</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1">
                    <ImageIcon className="h-5 w-5" />
                    <span className="text-xs">Imagens</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Audio & Effects */}
      <ResizablePanel defaultSize={40} className="pl-2">
        <div className="space-y-4 h-full">
          {/* Audio Mixer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Mixer de Áudio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {audioSources.map((source) => (
                <div key={source.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{source.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {source.level}%
                      </Badge>
                      <Button 
                        variant={source.muted ? "secondary" : "ghost"} 
                        size="sm"
                      >
                        {source.muted ? <Volume2 className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <Slider
                    value={[source.level]}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              ))}
              
              <Button variant="outline" size="sm" className="w-full">
                <Music className="h-4 w-4 mr-2" />
                Configurações de Áudio
              </Button>
            </CardContent>
          </Card>

          {/* Stream Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações de Stream
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Qualidade:</span>
                  <Badge variant="outline">1080p</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>FPS:</span>
                  <Badge variant="outline">30 fps</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Bitrate:</span>
                  <Badge variant="outline">2500 kbps</Badge>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configurações Avançadas
              </Button>
            </CardContent>
          </Card>

          {/* Recording */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Gravação Local</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                <Badge variant={sessionStatus === 'live' ? 'destructive' : 'secondary'}>
                  {sessionStatus === 'live' ? 'Gravando' : 'Parado'}
                </Badge>
              </div>
              
              {sessionStatus === 'live' && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Tempo: <span className="font-medium">00:15:32</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tamanho: 245 MB
                  </p>
                </div>
              )}
              
              <Button variant="outline" size="sm" className="w-full">
                <ScreenShare className="h-4 w-4 mr-2" />
                Configurar Gravação
              </Button>
            </CardContent>
          </Card>

          {/* Brand Customization */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Personalização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <ImageIcon className="h-4 w-4 mr-2" />
                Logo/Marca d'água
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Type className="h-4 w-4 mr-2" />
                Lower Thirds
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Palette className="h-4 w-4 mr-2" />
                Cores/Tema
              </Button>
            </CardContent>
          </Card>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default StudioControlsTab;