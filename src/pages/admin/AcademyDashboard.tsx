import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  DollarSign, 
  GraduationCap,
  Play,
  Star,
  Trophy,
  Calendar,
  BarChart3,
  Plus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AcademyDashboard: React.FC = () => {
  // Mock data - will be replaced with real data from hooks
  const stats = {
    totalCourses: 24,
    activeStudents: 1847,
    totalRevenue: 125690,
    completionRate: 87
  };

  const recentActivity = [
    { name: 'Curso de Marketing Digital', students: 156, completion: 78, revenue: 15600 },
    { name: 'Vendas Consultivas Avançadas', students: 89, completion: 92, revenue: 12800 },
    { name: 'Liderança e Gestão', students: 203, completion: 65, revenue: 28400 },
    { name: 'Comunicação Assertiva', students: 134, completion: 84, revenue: 9800 }
  ];

  const engagementData = [
    { month: 'Jan', students: 1200, completion: 65 },
    { month: 'Fev', students: 1350, completion: 72 },
    { month: 'Mar', students: 1580, completion: 78 },
    { month: 'Abr', students: 1720, completion: 82 },
    { month: 'Mai', students: 1847, completion: 87 }
  ];

  const categoryData = [
    { name: 'Marketing', value: 35, color: '#3B82F6' },
    { name: 'Vendas', value: 28, color: '#10B981' },
    { name: 'Tecnologia', value: 20, color: '#8B5CF6' },
    { name: 'Liderança', value: 17, color: '#F59E0B' }
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Academy Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Visão geral completa da sua plataforma educacional
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Relatório Mensal
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Curso
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalCourses}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.activeStudents.toLocaleString()}</div>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +8.2% crescimento
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              R$ {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +23% este mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <GraduationCap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.completionRate}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              Acima da média do setor (75%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Engagement Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tendências de Engajamento
            </CardTitle>
            <CardDescription>
              Evolução do número de alunos e taxa de conclusão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="students" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Alunos"
                />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="% Conclusão"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Categories Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Distribuição por Categoria
            </CardTitle>
            <CardDescription>
              Performance por área de conhecimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {categoryData.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <span className="text-sm font-medium">{category.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Course Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Performance dos Cursos
          </CardTitle>
          <CardDescription>
            Cursos com melhor desempenho nas últimas semanas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((course, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Play className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{course.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {course.students} alunos matriculados
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm font-medium">{course.completion}%</div>
                    <div className="text-xs text-muted-foreground">Conclusão</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-green-600">
                      R$ {course.revenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Receita</div>
                  </div>
                  <Badge 
                    variant={course.completion > 80 ? "default" : "secondary"}
                    className="ml-2"
                  >
                    {course.completion > 80 ? "Excelente" : "Bom"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademyDashboard;