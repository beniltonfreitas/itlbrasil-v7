import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Layers, 
  Video, 
  Mic, 
  Camera, 
  Monitor,
  Volume2,
  Palette,
  Settings,
  Zap,
  Eye,
  EyeOff,
  RotateCcw,
  Copy,
  Trash2,
  MonitorPlay,
  Users
} from "lucide-react";

interface StudioModeAdvancedProps {
  sessionStatus: 'preparing' | 'live' | 'ended';
}

const StudioModeAdvanced = ({ sessionStatus }: StudioModeAdvancedProps) => {
  const [selectedScene, setSelectedScene] = useState('scene1');
  const [selectedSource, setSelectedSource] = useState(null);
  
  const scenes = [
    { id: 'scene1', name: 'Cena Principal', active: true },
    { id: 'scene2', name: 'Entrevista', active: false },
    { id: 'scene3', name: 'Apresentação', active: false },
    { id: 'scene4', name: 'Transição', active: false }
  ];

  const sources = [
    { id: '1', name: 'Câmera Principal', type: 'camera', visible: true, audio: 85 },
    { id: '2', name: 'Compartilhamento de Tela', type: 'screen', visible: true, audio: 0 },
    { id: '3', name: 'Logo ITL Brasil', type: 'image', visible: true, audio: 0 },
    { id: '4', name: 'Microfone Host', type: 'audio', visible: true, audio: 92 },
    { id: '5', name: 'Música de Fundo', type: 'audio', visible: false, audio: 25 }
  ];

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'camera': return Camera;
      case 'screen': return Monitor;
      case 'image': return Palette;
      case 'audio': return Mic;
      default: return Video;
    }
  };

  return (
    <div className="grid grid-cols-4 gap-6 h-[500px]">
      {/* Left Panel - Scenes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Cenas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {scenes.map((scene) => (
            <div key={scene.id} className="space-y-2">
              <Button 
                variant={selectedScene === scene.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedScene(scene.id)}
              >
                {scene.active && <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />}
                {scene.name}
              </Button>
            </div>
          ))}
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full">
              <Copy className="h-3 w-3 mr-1" />
              Duplicar Cena
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Adicionar Cena
            </Button>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <Label className="text-sm">Transições</Label>
            <Button variant="outline" size="sm" className="w-full">
              Fade (500ms)
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              Corte Direto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Center Left - Sources */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Fontes da Cena</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sources.map((source) => {
            const IconComponent = getSourceIcon(source.type);
            return (
              <div 
                key={source.id} 
                className={`p-2 rounded border cursor-pointer ${
                  selectedSource === source.id ? 'border-primary bg-primary/5' : 'border-muted'
                }`}
                onClick={() => setSelectedSource(source.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium flex-1">{source.name}</span>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    {source.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                </div>
                
                {source.type === 'audio' || source.audio > 0 ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-3 w-3" />
                      <Slider 
                        value={[source.audio]} 
                        max={100} 
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs w-8">{source.audio}%</span>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Camera className="h-3 w-3 mr-1" />
              Câmera
            </Button>
            <Button variant="outline" size="sm">
              <Monitor className="h-3 w-3 mr-1" />
              Tela
            </Button>
            <Button variant="outline" size="sm">
              <Palette className="h-3 w-3 mr-1" />
              Imagem
            </Button>
            <Button variant="outline" size="sm">
              <Mic className="h-3 w-3 mr-1" />
              Áudio
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Center Right - Video Preview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Preview</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <RotateCcw className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative mb-4">
            <div className="text-white text-center">
              <MonitorPlay className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs opacity-75">Preview Avançado</p>
            </div>
            
            {sessionStatus === 'live' && (
              <Badge className="absolute top-2 left-2 bg-red-600 text-xs">
                AO VIVO
              </Badge>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">1,247 espectadores</span>
              </div>
              <Badge variant="outline" className="text-xs">1080p60</Badge>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label className="text-sm">Chroma Key</Label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Zap className="h-3 w-3 mr-1" />
                  Ativar
                </Button>
                <Button size="sm" variant="outline">Configurar</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Right Panel - Advanced Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Controles Avançados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Audio Mixer */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Mixer de Áudio</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mic className="h-3 w-3" />
                <span className="text-xs flex-1">Master</span>
                <Slider value={[85]} max={100} className="w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Camera className="h-3 w-3" />
                <span className="text-xs flex-1">Mic 1</span>
                <Slider value={[92]} max={100} className="w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="h-3 w-3" />
                <span className="text-xs flex-1">Música</span>
                <Slider value={[25]} max={100} className="w-16" />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Filtros de Vídeo</Label>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Palette className="h-3 w-3 mr-2" />
                Correção de Cor
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Zap className="h-3 w-3 mr-2" />
                Desfoque de Fundo
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Settings className="h-3 w-3 mr-2" />
                Filtro de Ruído
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Recording */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Gravação</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={sessionStatus === 'live' ? 'destructive' : 'secondary'}>
                  {sessionStatus === 'live' ? 'Gravando' : 'Parado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Qualidade</span>
                <span className="text-sm text-muted-foreground">1080p60</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Formato</span>
                <span className="text-sm text-muted-foreground">MP4</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <Button variant="destructive" size="sm" className="w-full">
            <Trash2 className="h-3 w-3 mr-2" />
            Limpar Cena
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudioModeAdvanced;