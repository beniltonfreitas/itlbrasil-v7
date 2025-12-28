import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNoticiasAIStats } from "@/hooks/useNoticiasAIStats";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  Wand2, 
  Calendar,
  Newspaper
} from "lucide-react";

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

type Period = 'day' | 'week' | 'month';

const NoticiasAIStatsDashboard = () => {
  const [period, setPeriod] = useState<Period>('week');
  const { data: stats, isLoading, error } = useNoticiasAIStats(period);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Erro ao carregar estatísticas</p>
      </div>
    );
  }

  const periodLabels: Record<Period, string> = {
    day: 'Hoje',
    week: 'Última Semana',
    month: 'Último Mês',
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Período: {periodLabels[period]}
        </h3>
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {periodLabels[p]}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Newspaper className="h-8 w-8 text-primary" />
              <Badge variant="secondary">{period === 'day' ? 'hoje' : period === 'week' ? '7d' : '30d'}</Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Importado</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              {stats.successRate >= 90 ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <p className="text-2xl font-bold mt-2">{stats.successRate.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Wand2 className="h-8 w-8 text-purple-500" />
              <Badge variant="outline">{stats.correctedCount}</Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.correctionRate.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">Auto-Corrigidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <XCircle className="h-8 w-8 text-red-500" />
              <Badge variant="destructive">{stats.errorCount}</Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.dailyAverage.toFixed(1)}</p>
            <p className="text-sm text-muted-foreground">Média Diária</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* By Source Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distribuição por Fonte</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.bySource.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.bySource.slice(0, 6)}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {stats.bySource.slice(0, 6).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Sem dados para o período
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Bar Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Importações por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.byDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.byDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => value.split('-').slice(1).join('/')}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    labelFormatter={(value) => `Data: ${value}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="success" name="Sucesso" fill="#10B981" stackId="a" />
                  <Bar dataKey="error" name="Erro" fill="#EF4444" stackId="a" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Sem dados para o período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Sources Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top Fontes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.bySource.slice(0, 5).map((source, index) => (
              <div 
                key={source.name} 
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  <Badge 
                    style={{ backgroundColor: source.color || COLORS[index % COLORS.length] }}
                    className="text-white"
                  >
                    {source.badge}
                  </Badge>
                  <span className="font-medium">{source.name}</span>
                </div>
                <Badge variant="outline">{source.count} importações</Badge>
              </div>
            ))}
            {stats.bySource.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma fonte registrada no período
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Import Type Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tipos de Importação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {stats.byType.map((type) => (
              <Badge key={type.type} variant="outline" className="text-sm py-1 px-3">
                {type.type === 'single' ? '🔗 Individual' : 
                 type.type === 'batch' ? '📦 Lote' : 
                 type.type === 'json' ? '📄 JSON' : type.type}
                : {type.count}
              </Badge>
            ))}
            {stats.byType.length === 0 && (
              <span className="text-muted-foreground">Nenhum dado</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoticiasAIStatsDashboard;
