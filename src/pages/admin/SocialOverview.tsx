import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3, 
  Calendar, 
  FileText, 
  Share2, 
  TrendingUp,
  Users,
  MessageCircle,
  Eye,
  Heart,
  Send
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const SocialOverview = () => {
  // Mock data para demonstração
  const stats = {
    totalPosts: 156,
    scheduledPosts: 12,
    publishedToday: 8,
    totalEngagement: 2847,
    followers: 15420,
    impressions: 98765
  };

  const chartData = [
    { name: 'Instagram', posts: 45, engagement: 1200 },
    { name: 'Facebook', posts: 38, engagement: 800 },
    { name: 'LinkedIn', posts: 32, engagement: 650 },
    { name: 'Twitter', posts: 25, engagement: 400 },
    { name: 'YouTube', posts: 16, engagement: 300 }
  ];

  const weeklyData = [
    { day: 'Seg', posts: 12, engagement: 450 },
    { day: 'Ter', posts: 8, engagement: 320 },
    { day: 'Qua', posts: 15, engagement: 680 },
    { day: 'Qui', posts: 10, engagement: 540 },
    { day: 'Sex', posts: 18, engagement: 720 },
    { day: 'Sáb', posts: 6, engagement: 280 },
    { day: 'Dom', posts: 9, engagement: 340 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Social Post - Visão Geral</h1>
            <p className="text-muted-foreground">
              Acompanhe o desempenho das suas redes sociais
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Badge>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <div className="text-2xl font-bold">{stats.totalPosts}</div>
              </div>
              <p className="text-xs text-muted-foreground">Total de Posts</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-orange-500" />
                <div className="text-2xl font-bold">{stats.scheduledPosts}</div>
              </div>
              <p className="text-xs text-muted-foreground">Agendados</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Send className="h-4 w-4 text-green-500" />
                <div className="text-2xl font-bold">{stats.publishedToday}</div>
              </div>
              <p className="text-xs text-muted-foreground">Publicados Hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <div className="text-2xl font-bold">{stats.totalEngagement.toLocaleString()}</div>
              </div>
              <p className="text-xs text-muted-foreground">Engajamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-500" />
                <div className="text-2xl font-bold">{stats.followers.toLocaleString()}</div>
              </div>
              <p className="text-xs text-muted-foreground">Seguidores</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-cyan-500" />
                <div className="text-2xl font-bold">{stats.impressions.toLocaleString()}</div>
              </div>
              <p className="text-xs text-muted-foreground">Impressões</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Posts por Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="posts" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Engajamento Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="engagement" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Post publicado no Instagram", time: "há 2 horas", platform: "Instagram" },
                { action: "Comentário respondido no Facebook", time: "há 4 horas", platform: "Facebook" },
                { action: "Post agendado para LinkedIn", time: "há 6 horas", platform: "LinkedIn" },
                { action: "Story publicado no Instagram", time: "há 8 horas", platform: "Instagram" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Share2 className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{activity.platform}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default SocialOverview;