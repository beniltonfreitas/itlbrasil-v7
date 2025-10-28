import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Video, 
  Mic, 
  Users, 
  Settings,
  Play,
  Calendar,
  BarChart3
} from 'lucide-react';

const StudioPro = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Studio Pro</h1>
          <p className="text-muted-foreground">
            Estúdio profissional para transmissões ao vivo e gravações
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Disponível
          </Badge>
          <Button className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Iniciar Transmissão
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <div className="w-6 h-6 bg-red-600 dark:bg-red-400 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white dark:bg-red-900 rounded-full"></div>
                </div>
              </div>
              <div>
                <p className="font-semibold">Gravar</p>
                <p className="text-sm text-muted-foreground">Nova gravação</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold">Ao Vivo</p>
                <p className="text-sm text-muted-foreground">Transmitir agora</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-semibold">Agendar</p>
                <p className="text-sm text-muted-foreground">Programar live</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-semibold">Analytics</p>
                <p className="text-sm text-muted-foreground">Ver estatísticas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Studio Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Controles do Estúdio
              </CardTitle>
              <CardDescription>
                Configure e gerencie suas transmissões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Câmera Principal</span>
                    <Badge variant="outline" className="text-green-600">Ativa</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">1920x1080 @ 30fps</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Microfone</span>
                    <Badge variant="outline" className="text-green-600">Conectado</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Audio Technica AT2020</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Qualidade Stream</span>
                    <Badge variant="outline">HD</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">1080p - 6000 kbps</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Plataformas</span>
                    <Badge variant="outline">3 conectadas</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">YouTube, Twitch, Facebook</p>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Live
                </Button>
                <Button variant="outline" className="flex-1">
                  <div className="w-4 h-4 bg-red-600 rounded-full mr-2"></div>
                  Gravar Offline
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Streams */}
          <Card>
            <CardHeader>
              <CardTitle>Transmissões Recentes</CardTitle>
              <CardDescription>
                Histórico das suas últimas lives e gravações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: "Análise Política Semanal", date: "2 horas atrás", viewers: "1.2k", duration: "45 min" },
                  { title: "Entrevista com Especialista", date: "1 dia atrás", viewers: "890", duration: "32 min" },
                  { title: "Notícias da Semana", date: "3 dias atrás", viewers: "2.1k", duration: "28 min" },
                ].map((stream, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div>
                      <p className="font-medium">{stream.title}</p>
                      <p className="text-sm text-muted-foreground">{stream.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{stream.viewers} viewers</p>
                      <p className="text-sm text-muted-foreground">{stream.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Live Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Status Ao Vivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-sm text-muted-foreground">Viewers atuais</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="font-semibold">0</div>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </div>
                  <div>
                    <div className="font-semibold">0</div>
                    <p className="text-xs text-muted-foreground">Comments</p>
                  </div>
                </div>

                <Badge variant="secondary" className="w-full justify-center">
                  Offline
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-record</span>
                <Badge variant="outline" className="text-green-600">On</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Chat moderado</span>
                <Badge variant="outline" className="text-blue-600">Ativo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Notificações</span>
                <Badge variant="outline">Ativadas</Badge>
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-4">
                <Settings className="h-4 w-4 mr-2" />
                Configurações Avançadas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudioPro;