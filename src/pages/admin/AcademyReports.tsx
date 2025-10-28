import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  BookOpen,
  Download,
  Calendar,
  CreditCard,
  Target,
  Award,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  FileText
} from 'lucide-react';

interface SalesData {
  month: string;
  courses: number;
  ebooks: number;
  mentorships: number;
  total: number;
}

interface CoursePerformance {
  id: string;
  title: string;
  category: string;
  students: number;
  revenue: number;
  completion: number;
  rating: number;
  growth: number;
}

const AcademyReports: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'revenue' | 'engagement' | 'courses' | 'students'>('revenue');

  // Mock data - will be replaced with real data from hooks
  const salesData: SalesData[] = [
    { month: 'Jan', courses: 15600, ebooks: 4200, mentorships: 3200, total: 23000 },
    { month: 'Fev', courses: 18200, ebooks: 5100, mentorships: 4100, total: 27400 },
    { month: 'Mar', courses: 22100, ebooks: 6800, mentorships: 5200, total: 34100 },
    { month: 'Abr', courses: 28600, ebooks: 8200, mentorships: 6800, total: 43600 },
    { month: 'Mai', courses: 32400, ebooks: 9600, mentorships: 8200, total: 50200 },
    { month: 'Jun', courses: 35800, ebooks: 11200, mentorships: 9400, total: 56400 }
  ];

  const engagementData = [
    { week: 'Sem 1', activeUsers: 1200, completionRate: 78, newEnrollments: 145 },
    { week: 'Sem 2', activeUsers: 1350, completionRate: 82, newEnrollments: 167 },
    { week: 'Sem 3', activeUsers: 1420, completionRate: 85, newEnrollments: 189 },
    { week: 'Sem 4', activeUsers: 1580, completionRate: 87, newEnrollments: 203 }
  ];

  const coursePerformance: CoursePerformance[] = [
    {
      id: '1',
      title: 'Marketing Digital Completo',
      category: 'Marketing',
      students: 1247,
      revenue: 37286,
      completion: 87,
      rating: 4.8,
      growth: 23
    },
    {
      id: '2',
      title: 'Vendas Consultivas Avançadas',
      category: 'Vendas',
      students: 834,
      revenue: 41616,
      completion: 92,
      rating: 4.9,
      growth: 31
    },
    {
      id: '3',
      title: 'Liderança na Era Digital',
      category: 'Liderança',
      students: 567,
      revenue: 22623,
      completion: 78,
      rating: 4.7,
      growth: 15
    },
    {
      id: '4',
      title: 'Comunicação Assertiva',
      category: 'Comunicação',
      students: 423,
      revenue: 16820,
      completion: 84,
      rating: 4.6,
      growth: 8
    }
  ];

  const categoryDistribution = [
    { name: 'Marketing', value: 35, revenue: 67500, color: '#3B82F6' },
    { name: 'Vendas', value: 28, revenue: 58200, color: '#10B981' },
    { name: 'Tecnologia', value: 20, revenue: 42800, color: '#8B5CF6' },
    { name: 'Liderança', value: 17, revenue: 35600, color: '#F59E0B' }
  ];

  const totalRevenue = salesData[salesData.length - 1]?.total || 0;
  const monthlyGrowth = salesData.length > 1 
    ? ((salesData[salesData.length - 1].total - salesData[salesData.length - 2].total) / salesData[salesData.length - 2].total) * 100
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Relatórios & Financeiro
          </h1>
          <p className="text-muted-foreground mt-2">
            Análise completa de vendas, engajamento e performance da Academy
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            Relatório Detalhado
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{monthlyGrowth.toFixed(1)}% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Alunos</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {engagementData.reduce((acc, week) => acc + week.newEnrollments, 0)}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Award className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {coursePerformance.reduce((acc, course) => acc + course.completion, 0) / coursePerformance.length}%
            </div>
            <Progress value={84} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              R$ 347
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Por transação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'revenue' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('revenue')}
          className="gap-2"
        >
          <DollarSign className="h-4 w-4" />
          Receita
        </Button>
        <Button
          variant={activeTab === 'engagement' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('engagement')}
          className="gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Engajamento
        </Button>
        <Button
          variant={activeTab === 'courses' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('courses')}
          className="gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Cursos
        </Button>
        <Button
          variant={activeTab === 'students' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('students')}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Alunos
        </Button>
      </div>

      {/* Charts based on active tab */}
      {activeTab === 'revenue' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Evolução da Receita
              </CardTitle>
              <CardDescription>
                Receita por categoria ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area 
                    type="monotone" 
                    dataKey="courses" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.8}
                    name="Cursos"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ebooks" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.8}
                    name="E-books"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="mentorships" 
                    stackId="1"
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.8}
                    name="Mentorias"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Receita por Categoria
              </CardTitle>
              <CardDescription>
                Distribuição da receita total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="revenue"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {categoryDistribution.map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">{formatCurrency(category.revenue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'engagement' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Métricas de Engajamento
            </CardTitle>
            <CardDescription>
              Usuários ativos e taxa de conclusão semanal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="activeUsers" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  name="Usuários Ativos"
                />
                <Line 
                  type="monotone" 
                  dataKey="completionRate" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Taxa de Conclusão (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="newEnrollments" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  name="Novas Matrículas"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {(activeTab === 'courses' || activeTab === 'students') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Performance dos Cursos
            </CardTitle>
            <CardDescription>
              Análise detalhada de cada curso da Academy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Alunos</TableHead>
                  <TableHead>Receita</TableHead>
                  <TableHead>Conclusão</TableHead>
                  <TableHead>Avaliação</TableHead>
                  <TableHead>Crescimento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coursePerformance.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.students.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(course.revenue)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={course.completion} className="w-16" />
                        <span className="text-sm">{course.completion}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {course.rating}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={course.growth > 0 ? 'default' : 'secondary'}
                        className={course.growth > 0 ? 'bg-green-100 text-green-800' : ''}
                      >
                        {course.growth > 0 ? '+' : ''}{course.growth}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Resumo Financeiro
          </CardTitle>
          <CardDescription>
            Análise detalhada das transações e split de receita
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Receita Bruta</h4>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </div>
              <p className="text-sm text-muted-foreground">
                Total sem descontos
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Comissões de Plataforma</h4>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalRevenue * 0.08)}
              </div>
              <p className="text-sm text-muted-foreground">
                8% da receita bruta
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Receita Líquida</h4>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalRevenue * 0.92)}
              </div>
              <p className="text-sm text-muted-foreground">
                Após comissões
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademyReports;