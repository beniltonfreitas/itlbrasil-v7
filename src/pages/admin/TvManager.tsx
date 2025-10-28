import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Tv, 
  Video, 
  Settings, 
  PlayCircle, 
  Upload,
  Calendar,
  Users,
  Sparkles,
  MonitorPlay,
  Youtube,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useLiveStreams } from "@/hooks/useLiveStreams";
import { useMediaLibrary } from "@/hooks/useMediaLibrary";
import { usePlatformIntegrations } from "@/hooks/usePlatformIntegrations";
import LiveStreamManager from "@/components/admin/LiveStreamManager";
import ITLStudio from "@/components/studio/ITLStudio";

const TvManager = () => {
  const [isLiveStreamModalOpen, setIsLiveStreamModalOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  const { data: streams } = useLiveStreams();
  const { data: mediaItems } = useMediaLibrary('tv');
  const { data: integrations } = usePlatformIntegrations();

  const liveStreamsCount = streams?.filter(s => s.status === 'live').length || 0;
  const totalVideos = mediaItems?.length || 0;
  const youtubeIntegration = integrations?.find(i => i.platform === 'youtube' && i.active);
  const currentViewers = streams?.reduce((acc, stream) => acc + stream.viewer_count, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TV</h1>
          <p className="text-muted-foreground">
            Gerencie transmissões de TV ao vivo e conteúdo audiovisual
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsStudioOpen(true)} className="bg-gradient-to-r from-primary to-primary-light">
            <Sparkles className="mr-2 h-4 w-4" />
            Abrir ITL Studio
          </Button>
          <Button variant="outline" onClick={() => setIsLiveStreamModalOpen(true)}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Nova Transmissão
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* ITL Studio Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary-light/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              ITL Studio
            </CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Badge variant="secondary" className="w-fit bg-primary/10 text-primary">
                Novo!
              </Badge>
              <p className="text-xs text-muted-foreground">
                Estúdio online profissional para transmissões
              </p>
              <Button 
                variant="default" 
                size="sm" 
                className="w-full bg-gradient-to-r from-primary to-primary-light"
                onClick={() => setIsStudioOpen(true)}
              >
                <MonitorPlay className="mr-2 h-3 w-3" />
                Abrir Studio
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transmissão ao Vivo
            </CardTitle>
            <Tv className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Badge variant={liveStreamsCount > 0 ? "destructive" : "secondary"} className="w-fit">
                {liveStreamsCount > 0 ? `${liveStreamsCount} Ao Vivo` : 'Offline'}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Configure e inicie transmissões de TV ao vivo
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setIsLiveStreamModalOpen(true)}
              >
                <Settings className="mr-2 h-3 w-3" />
                Gerenciar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              YouTube Live
            </CardTitle>
            <Youtube className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Badge variant={youtubeIntegration ? "secondary" : "outline"} className="w-fit">
                {youtubeIntegration ? (
                  <><CheckCircle className="h-3 w-3 mr-1" />Conectado</>
                ) : (
                  <><AlertCircle className="h-3 w-3 mr-1" />Não Conectado</>
                )}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {youtubeIntegration ? youtubeIntegration.channel_name : 'Integração com YouTube para transmissões'}
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="mr-2 h-3 w-3" />
                {youtubeIntegration ? 'Configurar' : 'Conectar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Biblioteca de Vídeos
            </CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">{totalVideos}</div>
              <p className="text-xs text-muted-foreground">
                Vídeos salvos na biblioteca
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setIsMediaLibraryOpen(true)}
              >
                <Upload className="mr-2 h-3 w-3" />
                Gerenciar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Programação
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Badge variant="secondary" className="w-fit">
                Em Breve
              </Badge>
              <p className="text-xs text-muted-foreground">
                Agendar e programar transmissões
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Calendar className="mr-2 h-3 w-3" />
                Configurar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Audiência
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold">{currentViewers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Espectadores online agora
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Users className="mr-2 h-3 w-3" />
                Ver Relatórios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <Dialog open={isLiveStreamModalOpen} onOpenChange={setIsLiveStreamModalOpen}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Gerenciar Transmissões ao Vivo</DialogTitle>
            <DialogDescription>
              Configure e gerencie suas transmissões de TV, rádio e podcasts
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <LiveStreamManager />
          </div>
        </DialogContent>
      </Dialog>

      <ITLStudio isOpen={isStudioOpen} onClose={() => setIsStudioOpen(false)} />

      {/* Media Library Modal - será implementado futuramente */}
      <Dialog open={isMediaLibraryOpen} onOpenChange={setIsMediaLibraryOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Biblioteca de Vídeos</DialogTitle>
            <DialogDescription>
              Gerencie seus vídeos e conteúdo audiovisual
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 text-center text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Biblioteca de vídeos será implementada em breve</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TvManager;