import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Heart, 
  Star, 
  UserPlus,
  Activity,
  Crown,
  Trophy
} from "lucide-react";

const CommunityDashboard = () => {
  // Mock data - em produção, vir da API
  const stats = {
    totalMembers: 1247,
    activeCommunities: 8,
    totalPosts: 342,
    totalComments: 1829,
    onlineMembers: 89,
    upcomingEvents: 5,
    newMembersToday: 23,
    totalReactions: 5683
  };

  const recentActivities = [
    { id: 1, type: 'post', user: 'Maria Silva', action: 'criou um novo post', community: 'Tecnologia', time: '2 min atrás' },
    { id: 2, type: 'comment', user: 'João Santos', action: 'comentou em', community: 'Política', time: '5 min atrás' },
    { id: 3, type: 'join', user: 'Ana Costa', action: 'entrou na comunidade', community: 'Design', time: '10 min atrás' },
    { id: 4, type: 'event', user: 'Pedro Lima', action: 'criou um evento', community: 'Negócios', time: '15 min atrás' },
  ];

  const topCommunities = [
    { name: 'Tecnologia', members: 324, posts: 89, engagement: 95 },
    { name: 'Política', members: 298, posts: 67, engagement: 87 },
    { name: 'Economia', members: 201, posts: 45, engagement: 82 },
    { name: 'Design', members: 156, posts: 34, engagement: 78 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard da Comunidade</h1>
        <p className="text-muted-foreground">
          Visão geral das atividades e estatísticas da comunidade ITL Brasil
        </p>
      </div>

      {/* Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalMembers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.newMembersToday}</span> hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros Online</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.onlineMembers}</div>
            <p className="text-xs text-muted-foreground">
              agora mesmo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Totais</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalComments.toLocaleString()} comentários
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas ações dos membros da comunidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">{activity.user}</span>{' '}
                      <span className="text-muted-foreground">{activity.action}</span>{' '}
                      <span className="font-medium text-primary">{activity.community}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" size="sm">
              Ver Todas as Atividades
            </Button>
          </CardContent>
        </Card>

        {/* Top Comunidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Comunidades Mais Ativas
            </CardTitle>
            <CardDescription>
              Ranking por engajamento e participação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCommunities.map((community, index) => (
                <div key={community.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{community.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {community.members} membros • {community.posts} posts
                      </p>
                    </div>
                  </div>
                  <Badge variant={community.engagement > 90 ? "default" : "secondary"}>
                    {community.engagement}%
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" size="sm">
              Ver Todas as Comunidades
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Ação Rápida */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <UserPlus className="h-8 w-8 mx-auto text-primary" />
            <CardTitle className="text-lg">Criar Comunidade</CardTitle>
            <CardDescription>
              Inicie uma nova comunidade para seus usuários
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Calendar className="h-8 w-8 mx-auto text-primary" />
            <CardTitle className="text-lg">Criar Evento</CardTitle>
            <CardDescription>
              Organize eventos e encontros para a comunidade
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <Trophy className="h-8 w-8 mx-auto text-primary" />
            <CardTitle className="text-lg">Configurar Gamificação</CardTitle>
            <CardDescription>
              Defina conquistas e recompensas para os membros
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default CommunityDashboard;