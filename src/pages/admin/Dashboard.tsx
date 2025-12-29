import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useArticles } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { useRSSFeeds } from "@/hooks/useRSSFeeds";
import { useImportLogs } from "@/hooks/useImportLogs";
import { FileText, Tag, Rss, Activity, TrendingUp, Clock, AlertCircle, Users, UserPlus, List, Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { FIXED_CATEGORIES } from "@/lib/newsUtils";
import { AccessibilityCard } from "@/components/dashboard/AccessibilityCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: articles, isLoading: articlesLoading } = useArticles({ limit: 100 });
  const { data: rawCategories } = useCategories();
  const { data: feeds } = useRSSFeeds();
  const { data: logs } = useImportLogs(10);

  // Sort categories according to FIXED_CATEGORIES order
  const categories = rawCategories?.sort((a, b) => {
    const indexA = FIXED_CATEGORIES.indexOf(a.name);
    const indexB = FIXED_CATEGORIES.indexOf(b.name);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Calculate statistics
  const publishedArticles = articles?.filter(article => article.published_at) || [];
  const draftArticles = articles?.filter(article => !article.published_at) || [];
  const activeFeeds = feeds?.filter(feed => feed.active) || [];
  const recentLogs = logs?.slice(0, 5) || [];

  const stats = [
    {
      title: "Artigos Publicados",
      value: publishedArticles.length,
      icon: FileText,
      description: `${draftArticles.length} em rascunho`,
      trend: "+12% desde o último mês",
      color: "from-blue-500/10 to-blue-600/5",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600"
    },
    {
      title: "Categorias",
      value: categories?.length || 0,
      icon: Tag,
      description: "Categorias ativas",
      trend: "Estável",
      color: "from-emerald-500/10 to-emerald-600/5",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600"
    },
    {
      title: "Feeds RSS",
      value: activeFeeds.length,
      icon: Rss,
      description: `${feeds?.length || 0} total`,
      trend: `${feeds?.filter(f => !f.active).length || 0} inativos`,
      color: "from-amber-500/10 to-amber-600/5",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600"
    },
    {
      title: "Importações Hoje",
      value: logs?.filter(log => {
        const today = new Date();
        const logDate = new Date(log.started_at);
        return logDate.toDateString() === today.toDateString();
      }).length || 0,
      icon: Activity,
      description: "Processamentos realizados",
      trend: "Últimas 24h",
      color: "from-purple-500/10 to-purple-600/5",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600"
    }
  ];

  const getStatusBadge = (status: string) => {
    if (status === 'success') {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
          Sucesso
        </Badge>
      );
    }
    if (status === 'error') {
      return (
        <Badge className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20">
          Erro
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">
        Processando
      </Badge>
    );
  };

  return (
    <div className="space-y-6 relative">
      {/* Subtle tech background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M30 0v60M0 30h60' stroke='%23003366' stroke-width='0.5'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Header with decorative element */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/30 rounded-full" />
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <p className="text-muted-foreground ml-4">
          Visão geral do sistema de notícias ITL Brasil
        </p>
      </div>

      {/* Stats Cards with enhanced styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/40 bg-gradient-to-br ${stat.color} animate-fade-in`}
            style={{ animationDelay: `${index * 75}ms` }}
          >
            {/* Subtle hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`h-10 w-10 rounded-lg ${stat.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                <span className="text-xs text-emerald-600">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accessibility Card */}
        <AccessibilityCard />

        {/* Recent Articles with enhanced styling */}
        <Card className="lg:col-span-2 hover:shadow-md transition-all duration-200 hover:border-primary/20 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle>Artigos Recentes</CardTitle>
                <CardDescription>Últimos artigos publicados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              {articlesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : publishedArticles.slice(0, 5).map((article) => (
                <div 
                  key={article.id} 
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                >
                  {/* Status indicator */}
                  <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {article.category?.name || 'Sem categoria'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {article.published_at && formatDistanceToNow(new Date(article.published_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trending Articles & Quick Actions */}
        <div className="space-y-6">
          {/* Trending Articles */}
          <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/20 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <CardTitle>Mais Pesquisadas</CardTitle>
                  <CardDescription>Notícias em alta no momento</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {publishedArticles.slice(0, 3).map((article, index) => (
                  <div key={article.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-bold ${
                        index === 0 ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                        index === 1 ? 'bg-slate-500/10 text-slate-600 border-slate-500/30' :
                        'bg-orange-500/10 text-orange-600 border-orange-500/30'
                      }`}
                    >
                      #{index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {article.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 500) + 100} visualizações
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/20 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-indigo-600" />
                </div>
                <CardTitle>Gestão de Usuários</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-2">
              <Button 
                className="w-full justify-start hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all" 
                variant="outline"
                onClick={() => navigate('/admin/users')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
              <Button 
                className="w-full justify-start hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all" 
                variant="outline"
                onClick={() => navigate('/admin/users')}
              >
                <List className="h-4 w-4 mr-2" />
                Listar Usuários
              </Button>
              <Button 
                className="w-full justify-start hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all" 
                variant="outline"
                onClick={() => navigate('/admin/security')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Permissões
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Import Logs */}
        <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/20 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <Rss className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <CardTitle>Logs de Importação</CardTitle>
                <CardDescription>Atividades recentes de feeds RSS</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {recentLogs.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum log de importação encontrado</p>
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {log.rss_feeds?.name || 'Feed desconhecido'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.articles_imported} artigos importados
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(log.status)}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.started_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats with progress bars */}
        <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/20 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-cyan-600" />
              </div>
              <div>
                <CardTitle>Estatísticas Rápidas</CardTitle>
                <CardDescription>Resumo do desempenho</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Artigos esta semana</span>
                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  {Math.floor(Math.random() * 20) + 5}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Feeds ativos</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  {activeFeeds.length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Média de views/artigo</span>
                <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                  {Math.floor(Math.random() * 200) + 50}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Taxa de sucesso RSS</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-[95%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono">
                    95%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;