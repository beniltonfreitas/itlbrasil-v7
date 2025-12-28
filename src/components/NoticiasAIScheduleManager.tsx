import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  useNoticiasAISchedules, 
  useNoticiasAIScheduleLogs,
  useCreateNoticiasAISchedule,
  useUpdateNoticiasAISchedule,
  useDeleteNoticiasAISchedule,
  useRunScheduleNow,
  NoticiasAISchedule
} from "@/hooks/useNoticiasAISchedules";
import { useNoticiasAISources } from "@/hooks/useNoticiasAISources";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Clock, 
  Play, 
  Pause,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  RefreshCw,
  History
} from "lucide-react";

interface ScheduleFormData {
  name: string;
  source_urls: string;
  source_id: string;
  interval_minutes: number;
  max_articles_per_run: number;
  auto_publish: boolean;
}

const defaultFormData: ScheduleFormData = {
  name: '',
  source_urls: '',
  source_id: '',
  interval_minutes: 60,
  max_articles_per_run: 5,
  auto_publish: false,
};

const intervalOptions = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
  { value: 360, label: '6 horas' },
  { value: 720, label: '12 horas' },
  { value: 1440, label: '24 horas' },
];

const NoticiasAIScheduleManager = () => {
  const { data: schedules, isLoading, refetch } = useNoticiasAISchedules();
  const { data: logs } = useNoticiasAIScheduleLogs(undefined, 10);
  const { data: sources } = useNoticiasAISources();
  const createSchedule = useCreateNoticiasAISchedule();
  const updateSchedule = useUpdateNoticiasAISchedule();
  const deleteSchedule = useDeleteNoticiasAISchedule();
  const runNow = useRunScheduleNow();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<NoticiasAISchedule | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>(defaultFormData);
  const [showLogs, setShowLogs] = useState(false);

  const handleOpenCreate = () => {
    setFormData(defaultFormData);
    setEditingSchedule(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (schedule: NoticiasAISchedule) => {
    setFormData({
      name: schedule.name,
      source_urls: schedule.source_urls.join('\n'),
      source_id: schedule.source_id || '',
      interval_minutes: schedule.interval_minutes,
      max_articles_per_run: schedule.max_articles_per_run,
      auto_publish: schedule.auto_publish,
    });
    setEditingSchedule(schedule);
    setIsCreateOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.source_urls) return;

    const urls = formData.source_urls
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.startsWith('http'));

    if (urls.length === 0) return;

    const data = {
      name: formData.name,
      source_urls: urls,
      source_id: formData.source_id || undefined,
      interval_minutes: formData.interval_minutes,
      max_articles_per_run: formData.max_articles_per_run,
      auto_publish: formData.auto_publish,
    };

    if (editingSchedule) {
      await updateSchedule.mutateAsync({ id: editingSchedule.id, ...data });
    } else {
      await createSchedule.mutateAsync(data);
    }

    setIsCreateOpen(false);
    setFormData(defaultFormData);
    setEditingSchedule(null);
    refetch();
  };

  const handleToggleActive = async (schedule: NoticiasAISchedule) => {
    await updateSchedule.mutateAsync({
      id: schedule.id,
      is_active: !schedule.is_active,
    });
    refetch();
  };

  const handleRunNow = async (scheduleId: string) => {
    await runNow.mutateAsync(scheduleId);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteSchedule.mutateAsync(id);
    refetch();
  };

  const getStatusBadge = (schedule: NoticiasAISchedule) => {
    if (!schedule.is_active) {
      return <Badge variant="secondary"><Pause className="h-3 w-3 mr-1" />Pausado</Badge>;
    }
    if (schedule.next_run && new Date(schedule.next_run) <= new Date()) {
      return <Badge variant="default" className="bg-amber-500"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
    }
    return <Badge variant="default" className="bg-green-500"><Play className="h-3 w-3 mr-1" />Ativo</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Agendamentos</h3>
          <p className="text-sm text-muted-foreground">
            Configure importações automáticas de notícias
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowLogs(!showLogs)}>
            <History className="h-4 w-4 mr-2" />
            {showLogs ? 'Ocultar Logs' : 'Ver Logs'}
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingSchedule ? 'Editar Agendamento' : 'Novo Agendamento'}
                </DialogTitle>
                <DialogDescription>
                  Configure a importação automática de notícias
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Agendamento</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Agência Brasil - Política"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urls">URLs (uma por linha)</Label>
                  <Textarea
                    id="urls"
                    placeholder="https://exemplo.com/noticia-1&#10;https://exemplo.com/noticia-2"
                    rows={4}
                    value={formData.source_urls}
                    onChange={(e) => setFormData({ ...formData, source_urls: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Intervalo</Label>
                    <Select
                      value={formData.interval_minutes.toString()}
                      onValueChange={(v) => setFormData({ ...formData, interval_minutes: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {intervalOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value.toString()}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Máx. artigos/execução</Label>
                    <Select
                      value={formData.max_articles_per_run.toString()}
                      onValueChange={(v) => setFormData({ ...formData, max_articles_per_run: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 3, 5, 10, 15, 20].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n} artigos
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fonte Associada (opcional)</Label>
                  <Select
                    value={formData.source_id}
                    onValueChange={(v) => setFormData({ ...formData, source_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma fonte..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {sources?.filter(s => s.is_active).map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="auto-publish"
                    checked={formData.auto_publish}
                    onCheckedChange={(checked) => setFormData({ ...formData, auto_publish: checked })}
                  />
                  <Label htmlFor="auto-publish">Publicar automaticamente</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.source_urls || createSchedule.isPending || updateSchedule.isPending}
                >
                  {(createSchedule.isPending || updateSchedule.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingSchedule ? 'Salvar' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Schedules List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Agendamentos Ativos ({schedules?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!schedules?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum agendamento configurado</p>
              <p className="text-sm">Clique em "Novo Agendamento" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div 
                  key={schedule.id}
                  className={`p-4 rounded-lg border ${
                    schedule.is_active ? 'bg-muted/30' : 'bg-muted/10 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{schedule.name}</h4>
                        {getStatusBadge(schedule)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <Clock className="h-3 w-3 inline mr-1" />
                          A cada {intervalOptions.find(o => o.value === schedule.interval_minutes)?.label || `${schedule.interval_minutes}min`}
                          {' • '}{schedule.source_urls.length} URL(s)
                        </p>
                        {schedule.last_run && (
                          <p>
                            Última execução: {formatDistanceToNow(new Date(schedule.last_run), { locale: ptBR, addSuffix: true })}
                          </p>
                        )}
                        {schedule.next_run && schedule.is_active && (
                          <p>
                            Próxima: {formatDistanceToNow(new Date(schedule.next_run), { locale: ptBR, addSuffix: true })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunNow(schedule.id)}
                        disabled={runNow.isPending}
                      >
                        {runNow.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                      <Switch
                        checked={schedule.is_active}
                        onCheckedChange={() => handleToggleActive(schedule)}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleOpenEdit(schedule)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover agendamento?</AlertDialogTitle>
                            <AlertDialogDescription>
                              O agendamento "{schedule.name}" será removido permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(schedule.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs Section */}
      {showLogs && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico de Execuções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              {!logs?.length ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma execução registrada
                </p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div 
                      key={log.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
                    >
                      <div className="flex items-center gap-3">
                        {log.status === 'success' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : log.status === 'partial' ? (
                          <Clock className="h-5 w-5 text-amber-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {log.articles_imported} importado(s)
                            {log.articles_failed > 0 && `, ${log.articles_failed} falha(s)`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            {log.duration_ms && ` • ${(log.duration_ms / 1000).toFixed(1)}s`}
                          </p>
                        </div>
                      </div>
                      <Badge variant={log.status === 'success' ? 'default' : log.status === 'partial' ? 'secondary' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NoticiasAIScheduleManager;
