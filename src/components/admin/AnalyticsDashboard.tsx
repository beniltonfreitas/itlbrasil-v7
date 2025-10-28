import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useSiteStatistics, useAnalyticsData, useCollectDailyStats } from "@/hooks/useAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, FileText, Mail, Eye, Calendar, Download, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: dashboardStats, isLoading: dashboardLoading } = useDashboardStats();
  const { data: siteStats, isLoading: statsLoading } = useSiteStatistics(selectedPeriod);
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalyticsData();
  const collectStatsMutation = useCollectDailyStats();

  const handleCollectStats = async () => {
    try {
      await collectStatsMutation.mutateAsync();
      toast.success("Estatísticas coletadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao coletar estatísticas");
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const prepareChartData = () => {
    if (!siteStats) return [];
    
    const metrics = ['articles_total', 'users_total', 'newsletter_subscribers'];
    const dataByDate: { [key: string]: any } = {};

    siteStats.forEach(stat => {
      if (metrics.includes(stat.metric_name)) {
        const date = new Date(stat.recorded_date).toLocaleDateString('pt-BR');
        if (!dataByDate[date]) {
          dataByDate[date] = { date };
        }
        dataByDate[date][stat.metric_name] = Number(stat.metric_value);
      }
    });

    return Object.values(dataByDate).reverse();
  };

  const prepareViewsData = () => {
    if (!analyticsData) return [];
    
    const viewsByDate: { [key: string]: number } = {};
    
    analyticsData.forEach(item => {
      if (item.event_type === 'page_view') {
        const date = new Date(item.created_at).toLocaleDateString('pt-BR');
        viewsByDate[date] = (viewsByDate[date] || 0) + 1;
      }
    });

    return Object.entries(viewsByDate)
      .map(([date, views]) => ({ date, views }))
      .slice(-30) // Últimos 30 dias
      .reverse();
  };

  const prepareSourcesData = () => {
    if (!analyticsData) return [];
    
    const sourceCount: { [key: string]: number } = {};
    
    analyticsData.forEach(item => {
      const source = item.source || 'Direct';
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });

    return Object.entries(sourceCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend 
  }: { 
    title: string; 
    value: number | string; 
    description: string; 
    icon: any; 
    trend?: number 
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' ? formatNumber(value) : value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {trend && (
            <>
              <TrendingUp className={`h-3 w-3 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
              <span className={trend > 0 ? 'text-green-500' : 'text-red-500'}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </>
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );

  if (dashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho e estatísticas do seu site
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 dias</SelectItem>
              <SelectItem value="month">30 dias</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleCollectStats} 
            disabled={collectStatsMutation.isPending}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${collectStatsMutation.isPending ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Artigos"
          value={dashboardStats?.totalArticles || 0}
          description="artigos publicados"
          icon={FileText}
          trend={5}
        />
        
        <StatCard
          title="Usuários"
          value={dashboardStats?.totalUsers || 0}
          description="usuários registrados"
          icon={Users}
          trend={12}
        />
        
        <StatCard
          title="Assinantes"
          value={dashboardStats?.totalSubscribers || 0}
          description="newsletter subscribers"
          icon={Mail}
          trend={8}
        />
        
        <StatCard
          title="Visualizações"
          value={dashboardStats?.totalViews || 0}
          description="visualizações totais"
          icon={Eye}
          trend={15}
        />
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="traffic">Tráfego</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="sources">Fontes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Crescimento Geral</CardTitle>
                <CardDescription>Evolução dos principais indicadores</CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={prepareChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="articles_total" 
                        stroke="#3b82f6" 
                        name="Artigos"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="users_total" 
                        stroke="#10b981" 
                        name="Usuários"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Artigos Populares</CardTitle>
                <CardDescription>Mais visualizados nos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardStats?.popularArticles?.slice(0, 5).map((article, index) => (
                    <div key={article.id} className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{article.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(article.views_count || 0)} visualizações
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-muted-foreground">Nenhum dado disponível</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualizações por Dia</CardTitle>
              <CardDescription>Últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareViewsData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Publicações por Período</CardTitle>
                <CardDescription>Quantidade de artigos publicados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Esta semana</span>
                    <span className="text-sm font-medium">12 artigos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Este mês</span>
                    <span className="text-sm font-medium">45 artigos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total</span>
                    <span className="text-sm font-medium">
                      {dashboardStats?.totalArticles || 0} artigos
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo de Leitura Médio</CardTitle>
                <CardDescription>Baseado nos artigos publicados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6.5 min</div>
                <p className="text-xs text-muted-foreground">
                  +1.2 min vs. mês anterior
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fontes de Tráfego</CardTitle>
              <CardDescription>De onde vêm seus visitantes</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={prepareSourcesData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {prepareSourcesData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-3">
                    {prepareSourcesData().map((source, index) => (
                      <div key={source.name} className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{source.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {source.value} visitantes
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;