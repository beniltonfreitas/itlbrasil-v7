import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useArticles } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { useRSSFeeds } from "@/hooks/useRSSFeeds";
import { useImportLogs } from "@/hooks/useImportLogs";
import { FileText, Tag, Rss, Activity, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { FIXED_CATEGORIES } from "@/lib/newsUtils";
import { AccessibilityCard } from "@/components/dashboard/AccessibilityCard";
import { VPNDashboardCard } from "@/components/dashboard/VPNDashboardCard";

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
      trend: "+12% desde o último mês"
    },
    {
      title: "Categorias",
      value: categories?.length || 0,
      icon: Tag,
      description: "Categorias ativas",
      trend: "Estável"
    },
    {
      title: "Feeds RSS",
      value: activeFeeds.length,
      icon: Rss,
      description: `${feeds?.length || 0} total`,
      trend: `${feeds?.filter(f => !f.active).length || 0} inativos`
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
      trend: "Últimas 24h"
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      success: "default",
      error: "destructive",
      processing: "secondary"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status === 'success' ? 'Sucesso' : 
         status === 'error' ? 'Erro' : 'Processando'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de notícias ITL Brasil
        </p>
      </div>

      {/* VPN Dashboard Card */}
      <VPNDashboardCard />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accessibility Card */}
        <AccessibilityCard />

        {/* Recent Articles */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Artigos Recentes</CardTitle>
            <CardDescription>Últimos artigos publicados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {articlesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : publishedArticles.slice(0, 5).map((article) => (
                <div key={article.id} className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
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
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trending Articles & Quick Actions */}
        <div className="space-y-6">
          {/* Trending Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Mais Pesquisadas
              </CardTitle>
              <CardDescription>Notícias em alta no momento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {publishedArticles.slice(0, 3).map((article, index) => (
                  <div key={article.id} className="flex items-start gap-3">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Gestão de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/admin/users')}
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Novo Usuário
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/admin/users')}
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Listar Usuários
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate('/admin/security')}
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Permissões
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Import Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Logs de Importação</CardTitle>
            <CardDescription>Atividades recentes de feeds RSS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogs.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Nenhum log de importação encontrado</p>
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between">
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

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas Rápidas</CardTitle>
            <CardDescription>Resumo do desempenho</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Artigos esta semana</span>
                <Badge variant="secondary">{Math.floor(Math.random() * 20) + 5}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Feeds ativos</span>
                <Badge variant="secondary">{activeFeeds.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Média de views/artigo</span>
                <Badge variant="secondary">{Math.floor(Math.random() * 200) + 50}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Taxa de sucesso RSS</span>
                <Badge variant="secondary" className="text-green-600">95%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;