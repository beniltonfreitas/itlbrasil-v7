import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp,
  Download,
  Share,
  Calendar as CalendarIcon,
  Users,
  Heart,
  MessageCircle,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  AreaChart,
  Area
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { toast } from "@/hooks/use-toast";

const SocialReports = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [reportType, setReportType] = useState("engagement");

  // Mock data para relatórios
  const overallStats = {
    totalPosts: 156,
    totalReach: 45672,
    totalEngagement: 8934,
    totalFollowers: 23456,
    engagementRate: 3.2,
    clickThroughRate: 1.8,
    conversionRate: 0.5,
    growthRate: 12.4
  };

  const platformData = [
    { platform: 'Instagram', posts: 45, reach: 18000, engagement: 3600, followers: 8500, color: '#E4405F' },
    { platform: 'Facebook', posts: 38, reach: 12000, engagement: 2400, followers: 6200, color: '#1877F2' },
    { platform: 'LinkedIn', posts: 32, reach: 8500, engagement: 1700, followers: 4800, color: '#0A66C2' },
    { platform: 'YouTube', posts: 25, reach: 5200, engagement: 1040, followers: 2900, color: '#FF0000' },
    { platform: 'Twitter', posts: 16, reach: 2000, engagement: 194, followers: 1056, color: '#1DA1F2' }
  ];

  const engagementTrend = [
    { month: 'Jan', engagement: 2400, reach: 12000, posts: 8 },
    { month: 'Feb', engagement: 1398, reach: 9800, posts: 12 },
    { month: 'Mar', engagement: 9800, reach: 15600, posts: 15 },
    { month: 'Abr', engagement: 3908, reach: 18200, posts: 18 },
    { month: 'Mai', engagement: 4800, reach: 22000, posts: 22 },
    { month: 'Jun', engagement: 3800, reach: 19800, posts: 20 }
  ];

  const contentPerformance = [
    { type: 'Imagens', posts: 65, avgEngagement: 156, totalReach: 28500 },
    { type: 'Vídeos', posts: 42, avgEngagement: 289, totalReach: 18200 },
    { type: 'Carrossel', posts: 28, avgEngagement: 198, totalReach: 15800 },
    { type: 'Stories', posts: 89, avgEngagement: 87, totalReach: 9500 },
    { type: 'Reels', posts: 15, avgEngagement: 445, totalReach: 12600 }
  ];

  const topPosts = [
    {
      id: '1',
      title: 'Novidades em IA para 2024',
      platform: 'LinkedIn',
      engagement: 856,
      reach: 5200,
      date: '2024-01-15'
    },
    {
      id: '2', 
      title: 'Tutorial: Como usar ChatGPT',
      platform: 'YouTube',
      engagement: 642,
      reach: 3800,
      date: '2024-01-12'
    },
    {
      id: '3',
      title: 'Dicas de produtividade',
      platform: 'Instagram',
      engagement: 534,
      reach: 2900,
      date: '2024-01-10'
    }
  ];

  const platforms = {
    instagram: { name: "Instagram", icon: Instagram, color: "text-pink-500" },
    facebook: { name: "Facebook", icon: Facebook, color: "text-blue-600" },
    linkedin: { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
    twitter: { name: "Twitter", icon: Twitter, color: "text-gray-900" },
    youtube: { name: "YouTube", icon: Youtube, color: "text-red-600" }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  const exportReport = (format: string) => {
    toast({
      title: "Relatório Exportado",
      description: `Relatório exportado em formato ${format.toUpperCase()}`,
    });
  };

  const shareReport = () => {
    toast({
      title: "Link Compartilhado",
      description: "Link do relatório copiado para a área de transferência",
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Relatórios Social</h1>
            <p className="text-muted-foreground">
              Análise detalhada do desempenho das suas redes sociais
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Badge>
            <Button variant="outline" onClick={shareReport}>
              <Share className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
            <Button onClick={() => exportReport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Período:</span>
                <Button variant="outline" size="sm">
                  Últimos 30 dias
                </Button>
              </div>
              
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Plataformas</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engagement">Engajamento</SelectItem>
                  <SelectItem value="reach">Alcance</SelectItem>
                  <SelectItem value="growth">Crescimento</SelectItem>
                  <SelectItem value="conversion">Conversão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Posts</p>
                  <p className="text-2xl font-bold">{overallStats.totalPosts}</p>
                  <p className="text-xs text-green-600">+12% vs mês anterior</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alcance Total</p>
                  <p className="text-2xl font-bold">{overallStats.totalReach.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+18% vs mês anterior</p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Engajamento</p>
                  <p className="text-2xl font-bold">{overallStats.totalEngagement.toLocaleString()}</p>
                  <p className="text-xs text-red-600">-5% vs mês anterior</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Engajamento</p>
                  <p className="text-2xl font-bold">{overallStats.engagementRate}%</p>
                  <p className="text-xs text-green-600">+0.3% vs mês anterior</p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="platforms">Por Plataforma</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
            <TabsTrigger value="growth">Crescimento</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tendência de Engajamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Tendência de Engajamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={engagementTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="engagement" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Distribuição por Plataforma */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Distribuição por Plataforma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={platformData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="engagement"
                          label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                        >
                          {platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Posts com Melhor Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Posts com Melhor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPosts.map((post, index) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <h4 className="font-medium">{post.title}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{post.platform}</span>
                            <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{post.engagement}</div>
                          <div className="text-muted-foreground">Engajamento</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{post.reach.toLocaleString()}</div>
                          <div className="text-muted-foreground">Alcance</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {platformData.map(platform => {
                    const PlatformIcon = platforms[platform.platform.toLowerCase() as keyof typeof platforms]?.icon || BarChart3;
                    
                    return (
                      <div key={platform.platform} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <PlatformIcon className="h-6 w-6" style={{ color: platform.color }} />
                            <h3 className="font-semibold text-lg">{platform.platform}</h3>
                          </div>
                          <Badge variant="outline">{platform.posts} posts</Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{platform.reach.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Alcance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{platform.engagement.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Engajamento</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{platform.followers.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Seguidores</div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>Taxa de Engajamento</span>
                            <span>{((platform.engagement / platform.reach) * 100).toFixed(2)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${(platform.engagement / platform.reach) * 100}%`,
                                backgroundColor: platform.color 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Tipo de Conteúdo</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-80 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="avgEngagement" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contentPerformance.map(content => (
                    <Card key={content.type}>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">{content.type}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Posts:</span>
                            <span className="font-medium">{content.posts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Engajamento Médio:</span>
                            <span className="font-medium">{content.avgEngagement}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Alcance Total:</span>
                            <span className="font-medium">{content.totalReach.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="growth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Seguidores</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engagementTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="reach" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};

export default SocialReports;