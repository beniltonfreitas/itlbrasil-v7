import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Shield, Download, Trash2, Filter, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useActivityLogs, useDeleteActivityLogs, useActivityStats } from '@/hooks/useActivityLogs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const activityTypeColors: Record<string, string> = {
  login: 'bg-green-500/10 text-green-500',
  logout: 'bg-gray-500/10 text-gray-500',
  create: 'bg-blue-500/10 text-blue-500',
  update: 'bg-yellow-500/10 text-yellow-500',
  delete: 'bg-red-500/10 text-red-500',
  view: 'bg-purple-500/10 text-purple-500',
  export: 'bg-indigo-500/10 text-indigo-500',
  import: 'bg-orange-500/10 text-orange-500'
};

export default function ActivityLogs() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({});
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('');
  const [searchEmail, setSearchEmail] = useState('');

  const { data, isLoading, refetch } = useActivityLogs(filters, page, 50);
  const { data: stats } = useActivityStats();
  const deleteMutation = useDeleteActivityLogs();

  const handleDeleteSelected = async () => {
    if (selectedLogs.length === 0) return;
    if (!confirm(`Deseja excluir ${selectedLogs.length} registro(s)?`)) return;
    
    await deleteMutation.mutateAsync(selectedLogs);
    setSelectedLogs([]);
  };

  const handleExportCSV = () => {
    if (!data?.logs) return;

    const headers = ['Data/Hora', 'Usuário', 'Email', 'IP', 'Tipo', 'Descrição', 'Recurso'];
    const rows = data.logs.map(log => [
      format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
      log.user_id || 'Sistema',
      log.user_email || '-',
      log.ip_address || '-',
      log.activity_type,
      log.activity_description,
      log.resource_type ? `${log.resource_type}${log.resource_id ? `:${log.resource_id}` : ''}` : '-'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const toggleLogSelection = (logId: string) => {
    setSelectedLogs(prev =>
      prev.includes(logId) ? prev.filter(id => id !== logId) : [...prev, logId]
    );
  };

  const toggleSelectAll = () => {
    if (!data?.logs) return;
    setSelectedLogs(selectedLogs.length === data.logs.length ? [] : data.logs.map(log => log.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Logs de Atividade
          </h1>
          <p className="text-muted-foreground mt-2">
            Auditoria completa de todas as atividades do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm" disabled={!data?.logs?.length}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button
            onClick={handleDeleteSelected}
            variant="destructive"
            size="sm"
            disabled={selectedLogs.length === 0 || deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir ({selectedLogs.length})
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Atividades (30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString('pt-BR')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Tipos de Atividade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byType).slice(0, 5).map(([type, count]) => (
                  <Badge key={type} variant="outline" className={activityTypeColors[type] || ''}>
                    {type}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Registros Atuais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.total.toLocaleString('pt-BR')}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>Filtre os logs por tipo, email ou período</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Atividade</label>
              <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="create">Criar</SelectItem>
                  <SelectItem value="update">Atualizar</SelectItem>
                  <SelectItem value="delete">Excluir</SelectItem>
                  <SelectItem value="view">Visualizar</SelectItem>
                  <SelectItem value="export">Exportar</SelectItem>
                  <SelectItem value="import">Importar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email do Usuário</label>
              <Input
                placeholder="Buscar por email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => setFilters({ activityType: activityTypeFilter || undefined })}
                className="w-full"
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Atividade</CardTitle>
          <CardDescription>
            {data?.total ? `${data.total.toLocaleString('pt-BR')} registro(s) encontrado(s)` : 'Carregando...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !data?.logs?.length ? (
            <Alert>
              <AlertDescription>Nenhum registro de atividade encontrado.</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedLogs.length === data.logs.length}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Recurso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedLogs.includes(log.id)}
                            onCheckedChange={() => toggleLogSelection(log.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(log.created_at), 'dd/MM/yy HH:mm:ss', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-sm">{log.user_email || '-'}</TableCell>
                        <TableCell className="font-mono text-xs">{String(log.ip_address || '-')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={activityTypeColors[log.activity_type] || ''}>
                            {log.activity_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{log.activity_description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {log.resource_type ? String(log.resource_type) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page + 1} de {Math.ceil((data.total || 0) / 50)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * 50 >= (data.total || 0)}
                >
                  Próxima
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
