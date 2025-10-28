import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Trophy, 
  Medal, 
  Star, 
  Users, 
  TrendingUp, 
  Award,
  Crown,
  Zap,
  Target,
  Gift,
  Plus,
  Edit,
  Eye,
  Trash2
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  badgeColor: string;
  pointsRequired: number;
  isActive: boolean;
  usersEarned: number;
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  totalPoints: number;
  level: number;
  achievements: number;
  coursesCompleted: number;
  position: number;
}

const AcademyGamification: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rankings' | 'achievements' | 'levels'>('rankings');

  // Mock data - will be replaced with real data from hooks
  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'Primeiro Passo',
      description: 'Complete sua primeira aula',
      icon: 'Star',
      badgeColor: '#3B82F6',
      pointsRequired: 10,
      isActive: true,
      usersEarned: 1247
    },
    {
      id: '2',
      name: 'Dedicado',
      description: 'Complete 5 cursos',
      icon: 'Medal',
      badgeColor: '#10B981',
      pointsRequired: 500,
      isActive: true,
      usersEarned: 342
    },
    {
      id: '3',
      name: 'Expert',
      description: 'Alcance o nível 10',
      icon: 'Crown',
      badgeColor: '#F59E0B',
      pointsRequired: 1000,
      isActive: true,
      usersEarned: 89
    },
    {
      id: '4',
      name: 'Mentor',
      description: 'Ajude 10 outros alunos',
      icon: 'Users',
      badgeColor: '#8B5CF6',
      pointsRequired: 750,
      isActive: true,
      usersEarned: 156
    },
    {
      id: '5',
      name: 'Velocista',
      description: 'Complete um curso em menos de 24h',
      icon: 'Zap',
      badgeColor: '#EF4444',
      pointsRequired: 200,
      isActive: true,
      usersEarned: 423
    }
  ];

  const topUsers: User[] = [
    {
      id: '1',
      name: 'Maria Silva',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=150',
      totalPoints: 2850,
      level: 15,
      achievements: 12,
      coursesCompleted: 8,
      position: 1
    },
    {
      id: '2',
      name: 'João Santos',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150',
      totalPoints: 2640,
      level: 14,
      achievements: 10,
      coursesCompleted: 7,
      position: 2
    },
    {
      id: '3',
      name: 'Ana Costa',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      totalPoints: 2420,
      level: 13,
      achievements: 9,
      coursesCompleted: 6,
      position: 3
    },
    {
      id: '4',
      name: 'Pedro Oliveira',
      totalPoints: 2180,
      level: 12,
      achievements: 8,
      coursesCompleted: 5,
      position: 4
    },
    {
      id: '5',
      name: 'Carla Mendes',
      totalPoints: 1950,
      level: 11,
      achievements: 7,
      coursesCompleted: 4,
      position: 5
    }
  ];

  const levelSystem = [
    { level: 1, pointsRequired: 0, name: 'Iniciante', color: '#94A3B8' },
    { level: 2, pointsRequired: 100, name: 'Explorador', color: '#3B82F6' },
    { level: 3, pointsRequired: 250, name: 'Aprendiz', color: '#10B981' },
    { level: 4, pointsRequired: 500, name: 'Estudioso', color: '#F59E0B' },
    { level: 5, pointsRequired: 750, name: 'Dedicado', color: '#EF4444' },
    { level: 6, pointsRequired: 1000, name: 'Expert', color: '#8B5CF6' },
    { level: 7, pointsRequired: 1500, name: 'Mestre', color: '#EC4899' },
    { level: 8, pointsRequired: 2000, name: 'Sábio', color: '#06B6D4' },
    { level: 9, pointsRequired: 2500, name: 'Lenda', color: '#F97316' },
    { level: 10, pointsRequired: 3000, name: 'Grandmaster', color: '#84CC16' }
  ];

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gamificação Academy
          </h1>
          <p className="text-muted-foreground mt-2">
            Sistema de pontuação, conquistas e rankings dos alunos
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Conquista
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pontos</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {topUsers.reduce((acc, user) => acc + user.totalPoints, 0).toLocaleString()}
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Distribuídos entre todos os alunos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conquistas Ativas</CardTitle>
            <Medal className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {achievements.filter(a => a.isActive).length}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              {achievements.reduce((acc, a) => acc + a.usersEarned, 0)} vezes conquistadas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {topUsers.length * 42}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% este mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível Médio</CardTitle>
            <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {(topUsers.reduce((acc, user) => acc + user.level, 0) / topUsers.length).toFixed(1)}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Entre todos os alunos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'rankings' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('rankings')}
          className="gap-2"
        >
          <Trophy className="h-4 w-4" />
          Rankings
        </Button>
        <Button
          variant={activeTab === 'achievements' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('achievements')}
          className="gap-2"
        >
          <Medal className="h-4 w-4" />
          Conquistas
        </Button>
        <Button
          variant={activeTab === 'levels' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('levels')}
          className="gap-2"
        >
          <Star className="h-4 w-4" />
          Níveis
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'rankings' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top 3 Podium */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Pódio
              </CardTitle>
              <CardDescription>
                Top 3 alunos da semana
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {topUsers.slice(0, 3).map((user, index) => (
                <div key={user.id} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getPositionIcon(user.position)}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {user.totalPoints} pontos • Nível {user.level}
                    </p>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {user.achievements} conquistas
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {user.coursesCompleted} cursos
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Full Rankings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Ranking Completo
              </CardTitle>
              <CardDescription>
                Classificação geral dos alunos por pontuação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Posição</TableHead>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Pontos</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Conquistas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPositionIcon(user.position)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-xs">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{user.totalPoints}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Nível {user.level}</Badge>
                      </TableCell>
                      <TableCell>{user.achievements}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'achievements' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5" />
              Sistema de Conquistas
            </CardTitle>
            <CardDescription>
              Gerencie as conquistas e medalhas da Academy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Conquista</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achievements.map((achievement) => (
                  <TableRow key={achievement.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: achievement.badgeColor }}
                        >
                          <Trophy className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{achievement.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-sm text-muted-foreground">
                        {achievement.description}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{achievement.pointsRequired} pts</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {achievement.usersEarned}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={achievement.isActive ? 'default' : 'secondary'}>
                        {achievement.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
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
      )}

      {activeTab === 'levels' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Sistema de Níveis
            </CardTitle>
            <CardDescription>
              Estrutura de progressão e níveis da Academy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {levelSystem.map((level) => (
                <Card key={level.level} className="p-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: level.color }}
                    >
                      {level.level}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium" style={{ color: level.color }}>
                        {level.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {level.pointsRequired} pontos
                      </p>
                      <div className="mt-2">
                        <Progress 
                          value={Math.min((level.pointsRequired / 3000) * 100, 100)} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AcademyGamification;