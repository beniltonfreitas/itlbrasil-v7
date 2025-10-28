import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  MessageSquare, 
  Eye, 
  Heart,
  Share2,
  Download,
  BarChart3,
  Youtube,
  Facebook,
  Instagram,
  Twitch
} from "lucide-react";

interface StudioAnalyticsTabProps {
  sessionStatus: 'preparing' | 'live' | 'ended';
}

const StudioAnalyticsTab = ({ sessionStatus }: StudioAnalyticsTabProps) => {
  const sessionData = {
    startTime: '14:30',
    duration: sessionStatus === 'live' ? '00:15:32' : '00:00:00',
    peakViewers: 186,
    currentViewers: 142,
    totalViews: 523,
    engagement: 87,
    chatMessages: 234,
    likes: 156,
    shares: 23
  };

  const platformBreakdown = [
    {
      platform: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      color: 'text-red-500',
      viewers: 85,
      engagement: 92,
      revenue: 'R$ 45,30'
    },
    {
      platform: 'facebook', 
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      viewers: 42,
      engagement: 78,
      revenue: 'R$ 12,50'
    },
    {
      platform: 'instagram',
      name: 'Instagram', 
      icon: Instagram,
      color: 'text-pink-500',
      viewers: 15,
      engagement: 95,
      revenue: '--'
    },
    {
      platform: 'twitch',
      name: 'Twitch',
      icon: Twitch, 
      color: 'text-purple-500',
      viewers: 0,
      engagement: 0,
      revenue: '--'
    }
  ];

  const hourlyData = [
    { time: '14:30', viewers: 12 },
    { time: '14:35', viewers: 28 },
    { time: '14:40', viewers: 45 },
    { time: '14:45', viewers: 67 },
    { time: '14:50', viewers: 89 },
    { time: '14:55', viewers: 142 }
  ];

  const topCountries = [
    { country: 'Brasil', viewers: 89, percentage: 63 },
    { country: 'Portugal', viewers: 23, percentage: 16 },
    { country: 'Estados Unidos', viewers: 18, percentage: 13 },
    { country: 'Argentina', viewers: 12, percentage: 8 }
  ];

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      {/* Real-time Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Eye className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{sessionData.currentViewers}</p>
            <p className="text-xs text-muted-foreground">Visualizadores Atuais</p>
            <Badge variant="outline" className="text-xs mt-1">
              Pico: {sessionData.peakViewers}
            </Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{sessionData.duration}</p>
            <p className="text-xs text-muted-foreground">Duração</p>
            <Badge variant="outline" className="text-xs mt-1">
              Desde {sessionData.startTime}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{sessionData.chatMessages}</p>
            <p className="text-xs text-muted-foreground">Mensagens no Chat</p>
            <Badge variant="outline" className="text-xs mt-1">
              15 msg/min
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{sessionData.engagement}%</p>
            <p className="text-xs text-muted-foreground">Engajamento</p>
            <Badge variant="secondary" className="text-xs mt-1">
              Excelente
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Viewer Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Visualizadores ao Longo do Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-end justify-between gap-2">
            {hourlyData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary rounded-t min-h-[4px] transition-all duration-300"
                  style={{ height: `${(data.viewers / Math.max(...hourlyData.map(d => d.viewers))) * 100}%` }}
                ></div>
                <p className="text-xs text-muted-foreground mt-1">{data.time}</p>
                <p className="text-xs font-medium">{data.viewers}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Platform Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Breakdown por Plataforma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {platformBreakdown.map((platform) => (
              <div key={platform.platform} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <platform.icon className={`h-5 w-5 ${platform.color}`} />
                  <div>
                    <p className="font-medium text-sm">{platform.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {platform.viewers} visualizadores
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs mb-1">
                    {platform.engagement}% eng
                  </Badge>
                  <p className="text-xs font-medium">{platform.revenue}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Geographic Data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Audiência por País</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCountries.map((country, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{country.country}</span>
                  <span className="font-medium">{country.viewers}</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${country.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Heart className="h-5 w-5 text-red-500 mb-2" />
                <p className="text-lg font-bold">{sessionData.likes}</p>
                <p className="text-xs text-muted-foreground">Curtidas</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                +12%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Share2 className="h-5 w-5 text-blue-500 mb-2" />
                <p className="text-lg font-bold">{sessionData.shares}</p>
                <p className="text-xs text-muted-foreground">Compartilhamentos</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                +8%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Users className="h-5 w-5 text-green-500 mb-2" />
                <p className="text-lg font-bold">34</p>
                <p className="text-xs text-muted-foreground">Novos Seguidores</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                +24%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Baixe um relatório detalhado das métricas da sua transmissão
          </p>
          <div className="flex gap-2">
            <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 transition-colors">
              PDF Completo
            </button>
            <button className="flex-1 px-4 py-2 border border-muted rounded text-sm hover:bg-muted/50 transition-colors">
              CSV de Dados
            </button>
            <button className="flex-1 px-4 py-2 border border-muted rounded text-sm hover:bg-muted/50 transition-colors">
              Imagem de Resumo
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudioAnalyticsTab;