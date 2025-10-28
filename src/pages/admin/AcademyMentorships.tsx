import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
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
  Video, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock,
  Users,
  Play,
  Eye,
  Edit,
  Trash2,
  Zap,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface Mentorship {
  id: string;
  title: string;
  mentor: string;
  student?: string;
  course?: string;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  meetingUrl?: string;
  replayUrl?: string;
  type: 'individual' | 'group';
  maxParticipants?: number;
  currentParticipants: number;
}

const AcademyMentorships: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Mock data - will be replaced with real data from hooks
  const mentorships: Mentorship[] = [
    {
      id: '1',
      title: 'Estratégias de Marketing Digital',
      mentor: 'Maria Silva',
      student: 'João Almeida',
      course: 'Marketing Digital Completo',
      scheduledAt: new Date(2025, 0, 30, 14, 0),
      duration: 60,
      status: 'scheduled',
      type: 'individual',
      currentParticipants: 1
    },
    {
      id: '2',
      title: 'Sessão de Vendas Consultivas',
      mentor: 'João Santos',
      scheduledAt: new Date(2025, 0, 30, 16, 0),
      duration: 90,
      status: 'ongoing',
      type: 'group',
      maxParticipants: 8,
      currentParticipants: 6,
      meetingUrl: 'https://meet.academy.com/room/abc123'
    },
    {
      id: '3',
      title: 'Liderança em Tempos de Crise',
      mentor: 'Ana Costa',
      student: 'Maria Fernanda',
      course: 'Liderança e Gestão',
      scheduledAt: new Date(2025, 0, 29, 10, 0),
      duration: 45,
      status: 'completed',
      type: 'individual',
      currentParticipants: 1,
      replayUrl: 'https://academy.com/replays/leadership-crisis'
    },
    {
      id: '4',
      title: 'Programação React Avançada',
      mentor: 'Pedro Oliveira',
      scheduledAt: new Date(2025, 0, 31, 20, 0),
      duration: 120,
      status: 'scheduled',
      type: 'group',
      maxParticipants: 12,
      currentParticipants: 8
    }
  ];

  const getStatusIcon = (status: Mentorship['status']) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'ongoing':
        return <Zap className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Mentorship['status']) => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'ongoing':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: Mentorship['status']) => {
    switch (status) {
      case 'scheduled':
        return 'Agendada';
      case 'ongoing':
        return 'Em Andamento';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Desconhecido';
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const todaysMentorships = mentorships.filter(m => 
    m.scheduledAt.toDateString() === (selectedDate || new Date()).toDateString()
  );

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Mentorias & Aulas Ao Vivo
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie sessões de mentoria e aulas ao vivo
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Mentoria
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mentorias Hoje</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysMentorships.length}</div>
            <p className="text-xs text-muted-foreground">
              {todaysMentorships.filter(m => m.status === 'scheduled').length} agendadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Video className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mentorships.filter(m => m.status === 'ongoing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Sessões ativas agora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mentorships.filter(m => m.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mentorships.reduce((acc, m) => acc + m.currentParticipants, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Alunos participando
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar and Sessions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário
            </CardTitle>
            <CardDescription>
              Selecione uma data para ver as mentorias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Today's Sessions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Sessões do Dia
            </CardTitle>
            <CardDescription>
              {selectedDate?.toLocaleDateString('pt-BR')} - {todaysMentorships.length} sessão(ões)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysMentorships.length > 0 ? (
                todaysMentorships.map((mentorship) => (
                  <div key={mentorship.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getStatusIcon(mentorship.status)}
                      </div>
                      <div>
                        <h4 className="font-medium">{mentorship.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {mentorship.mentor} • {formatDuration(mentorship.duration)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(mentorship.scheduledAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(mentorship.status)}>
                        {getStatusText(mentorship.status)}
                      </Badge>
                      {mentorship.type === 'group' && (
                        <div className="text-xs text-muted-foreground">
                          {mentorship.currentParticipants}/{mentorship.maxParticipants} pessoas
                        </div>
                      )}
                      {mentorship.status === 'ongoing' && mentorship.meetingUrl && (
                        <Button size="sm" className="gap-2">
                          <Video className="h-3 w-3" />
                          Entrar
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma mentoria agendada para este dia</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Mentorships Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Mentorias</CardTitle>
          <CardDescription>
            Lista completa de mentorias e aulas ao vivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mentoria</TableHead>
                <TableHead>Mentor</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mentorships.map((mentorship) => (
                <TableRow key={mentorship.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                        <Video className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{mentorship.title}</div>
                        {mentorship.course && (
                          <div className="text-sm text-muted-foreground">
                            {mentorship.course}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{mentorship.mentor}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDateTime(mentorship.scheduledAt)}
                    </div>
                  </TableCell>
                  <TableCell>{formatDuration(mentorship.duration)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {mentorship.type === 'individual' ? 'Individual' : 'Grupo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {mentorship.currentParticipants}
                      {mentorship.maxParticipants && `/${mentorship.maxParticipants}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(mentorship.status)}>
                      {getStatusText(mentorship.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {mentorship.status === 'ongoing' && mentorship.meetingUrl && (
                        <Button size="sm" variant="outline" className="gap-1">
                          <Video className="h-3 w-3" />
                        </Button>
                      )}
                      {mentorship.status === 'completed' && mentorship.replayUrl && (
                        <Button size="sm" variant="outline" className="gap-1">
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademyMentorships;