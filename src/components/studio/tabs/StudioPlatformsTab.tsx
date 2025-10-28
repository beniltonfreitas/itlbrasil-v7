import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Youtube, 
  Facebook, 
  Instagram, 
  Twitch, 
  Settings, 
  Plus, 
  ExternalLink,
  Eye,
  Users,
  MessageSquare,
  TrendingUp
} from "lucide-react";

interface Platform {
  icon: any;
  name: string;
  connected: boolean;
  color: string;
}

interface StudioPlatformsTabProps {
  platforms: Platform[];
}

const StudioPlatformsTab = ({ platforms }: StudioPlatformsTabProps) => {
  const platformStats = [
    {
      platform: 'youtube',
      name: 'YouTube Live', 
      connected: true,
      viewers: 142,
      likes: 89,
      comments: 45,
      streamUrl: 'https://youtube.com/watch?v=abc123',
      status: 'live'
    },
    {
      platform: 'facebook',
      name: 'Facebook Live',
      connected: true, 
      viewers: 67,
      likes: 34,
      comments: 23,
      streamUrl: 'https://facebook.com/live/xyz789',
      status: 'live'
    },
    {
      platform: 'instagram',
      name: 'Instagram Live',
      connected: false,
      viewers: 0,
      likes: 0,
      comments: 0,
      streamUrl: '',
      status: 'offline'
    },
    {
      platform: 'twitch',
      name: 'Twitch',
      connected: false,
      viewers: 0,
      likes: 0,
      comments: 0, 
      streamUrl: '',
      status: 'offline'
    }
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return Youtube;
      case 'facebook': return Facebook;
      case 'instagram': return Instagram;
      case 'twitch': return Twitch;
      default: return Settings;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'youtube': return 'text-red-500 border-red-200';
      case 'facebook': return 'text-blue-600 border-blue-200';
      case 'instagram': return 'text-pink-500 border-pink-200';
      case 'twitch': return 'text-purple-500 border-purple-200';
      default: return 'text-muted-foreground border-muted';
    }
  };

  const totalViewers = platformStats.reduce((sum, platform) => sum + platform.viewers, 0);
  const connectedPlatforms = platformStats.filter(p => p.connected).length;

  return (
    <div className="space-y-6 h-full">
      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{totalViewers}</p>
            <p className="text-xs text-muted-foreground">Visualizadores Totais</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Settings className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{connectedPlatforms}/4</p>
            <p className="text-xs text-muted-foreground">Plataformas Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">
              {platformStats.reduce((sum, platform) => sum + platform.comments, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Comentários</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">
              {platformStats.reduce((sum, platform) => sum + platform.likes, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Curtidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Details */}
      <div className="grid grid-cols-2 gap-4">
        {platformStats.map((platform) => {
          const PlatformIcon = getPlatformIcon(platform.platform);
          return (
            <Card key={platform.platform} className={`border-2 ${getPlatformColor(platform.platform)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PlatformIcon className={`h-5 w-5 ${getPlatformColor(platform.platform).split(' ')[0]}`} />
                    {platform.name}
                  </CardTitle>
                  <Badge variant={platform.connected ? 'default' : 'secondary'}>
                    {platform.connected ? 'Conectado' : 'Desconectado'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {platform.connected ? (
                  <>
                    {/* Live Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-primary">{platform.viewers}</p>
                        <p className="text-xs text-muted-foreground">Viewers</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-primary">{platform.likes}</p>
                        <p className="text-xs text-muted-foreground">Likes</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-primary">{platform.comments}</p>
                        <p className="text-xs text-muted-foreground">Chat</p>
                      </div>
                    </div>

                    {/* Stream URL */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">URL da Transmissão:</label>
                      <div className="flex gap-2">
                        <Input 
                          value={platform.streamUrl}
                          readOnly
                          className="text-xs"
                        />
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Platform Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Config
                      </Button>
                      <Button variant="secondary" size="sm" className="flex-1">
                        Desconectar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Connection Setup */}
                    <div className="text-center py-4">
                      <PlatformIcon className={`h-12 w-12 mx-auto mb-3 ${getPlatformColor(platform.platform).split(' ')[0]} opacity-50`} />
                      <p className="text-sm text-muted-foreground mb-4">
                        Conecte sua conta {platform.name} para transmitir
                      </p>
                    </div>

                    {/* Connection Actions */}
                    <div className="space-y-2">
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Conectar {platform.name}
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <Settings className="h-3 w-3 mr-2" />
                        Configurações
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stream Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Multistream
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Título da Transmissão:</label>
              <Input placeholder="Digite o título da sua live..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria:</label>
              <Input placeholder="Ex: Tecnologia, Educação..." />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição:</label>
            <Input placeholder="Descreva o conteúdo da sua transmissão..." />
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <p className="font-medium text-sm">Sincronizar configurações</p>
              <p className="text-xs text-muted-foreground">
                Aplicar título e descrição em todas as plataformas
              </p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>

          <div className="flex gap-2">
            <Button className="flex-1">
              Aplicar a Todas
            </Button>
            <Button variant="outline" className="flex-1">
              <Settings className="h-4 w-4 mr-2" />
              Configurações Avançadas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudioPlatformsTab;