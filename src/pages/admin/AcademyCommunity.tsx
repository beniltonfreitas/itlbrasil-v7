import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  MessageSquare, 
  Users, 
  Plus, 
  Search,
  ThumbsUp,
  Eye,
  Edit,
  Trash2,
  Pin,
  Flag,
  BookOpen,
  TrendingUp,
  Heart,
  Reply,
  Share2,
  BarChart3
} from 'lucide-react';

interface CommunityPost {
  id: string;
  title?: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role: string;
  };
  course?: string;
  postType: 'discussion' | 'question' | 'announcement' | 'poll';
  upvotes: number;
  comments: number;
  views?: number;
  createdAt: Date;
  isPinned?: boolean;
  isFlagged?: boolean;
  tags?: string[];
}

interface CommunityStats {
  totalPosts: number;
  totalComments: number;
  activeUsers: number;
  weeklyGrowth: number;
}

const AcademyCommunity: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'discussions' | 'questions' | 'announcements' | 'polls'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'discussion' | 'question' | 'announcement' | 'poll'>('discussion');

  // Mock data - will be replaced with real data from hooks
  const communityStats: CommunityStats = {
    totalPosts: 1847,
    totalComments: 5234,
    activeUsers: 892,
    weeklyGrowth: 12.5
  };

  const communityPosts: CommunityPost[] = [
    {
      id: '1',
      title: 'Dúvida sobre Funil de Vendas',
      content: 'Estou com dificuldade para entender como criar um funil eficiente. Alguém pode me ajudar com dicas práticas?',
      author: {
        name: 'João Silva',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150',
        role: 'Aluno'
      },
      course: 'Marketing Digital Completo',
      postType: 'question',
      upvotes: 23,
      comments: 8,
      views: 156,
      createdAt: new Date(2025, 0, 28, 14, 30),
      tags: ['funil', 'vendas', 'marketing']
    },
    {
      id: '2',
      title: 'Nova Aula sobre IA na Vendas',
      content: 'Pessoal, acabei de publicar uma nova aula sobre como usar Inteligência Artificial para otimizar processos de vendas. Confiram!',
      author: {
        name: 'Maria Santos',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=150',
        role: 'Instrutora'
      },
      course: 'Vendas Consultivas Avançadas',
      postType: 'announcement',
      upvotes: 45,
      comments: 12,
      views: 289,
      createdAt: new Date(2025, 0, 28, 10, 15),
      isPinned: true,
      tags: ['ia', 'vendas', 'novidade']
    },
    {
      id: '3',
      content: 'Qual ferramenta de automação vocês mais usam no dia a dia? Estou pesquisando para melhorar meu workflow.',
      author: {
        name: 'Ana Costa',
        role: 'Aluna'
      },
      postType: 'poll',
      upvotes: 18,
      comments: 15,
      views: 203,
      createdAt: new Date(2025, 0, 27, 16, 45),
      tags: ['automacao', 'ferramentas', 'produtividade']
    },
    {
      id: '4',
      title: 'Compartilhando Minha Experiência',
      content: 'Depois de 3 meses aplicando as técnicas do curso, consegui aumentar minhas vendas em 40%! Queria compartilhar algumas estratégias que funcionaram comigo...',
      author: {
        name: 'Carlos Oliveira',
        role: 'Aluno'
      },
      course: 'Técnicas de Vendas B2B',
      postType: 'discussion',
      upvotes: 67,
      comments: 24,
      views: 445,
      createdAt: new Date(2025, 0, 27, 9, 20),
      tags: ['sucesso', 'experiencia', 'vendas']
    }
  ];

  const getPostTypeColor = (type: CommunityPost['postType']) => {
    switch (type) {
      case 'discussion':
        return 'default';
      case 'question':
        return 'secondary';
      case 'announcement':
        return 'destructive';
      case 'poll':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getPostTypeIcon = (type: CommunityPost['postType']) => {
    switch (type) {
      case 'discussion':
        return <MessageSquare className="h-4 w-4" />;
      case 'question':
        return <Search className="h-4 w-4" />;
      case 'announcement':
        return <TrendingUp className="h-4 w-4" />;
      case 'poll':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPostTypeName = (type: CommunityPost['postType']) => {
    switch (type) {
      case 'discussion':
        return 'Discussão';
      case 'question':
        return 'Pergunta';
      case 'announcement':
        return 'Anúncio';
      case 'poll':
        return 'Enquete';
      default:
        return 'Post';
    }
  };

  const filteredPosts = communityPosts.filter(post => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'discussions' && post.postType === 'discussion') ||
      (activeFilter === 'questions' && post.postType === 'question') ||
      (activeFilter === 'announcements' && post.postType === 'announcement') ||
      (activeFilter === 'polls' && post.postType === 'poll');
    
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Comunidade Academy
          </h1>
          <p className="text-muted-foreground mt-2">
            Fórum de discussões, perguntas e interação entre alunos e instrutores
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Publicação
        </Button>
      </div>

      {/* Community Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Posts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communityStats.totalPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round(communityStats.totalPosts * 0.08)} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comentários</CardTitle>
            <Reply className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communityStats.totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Engajamento ativo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{communityStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{communityStats.weeklyGrowth}% esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">
              Taxa de resposta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Post Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Publicação Rápida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Select value={newPostType} onValueChange={(value: any) => setNewPostType(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discussion">Discussão</SelectItem>
                  <SelectItem value="question">Pergunta</SelectItem>
                  <SelectItem value="announcement">Anúncio</SelectItem>
                  <SelectItem value="poll">Enquete</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Curso (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="marketing">Marketing Digital</SelectItem>
                  <SelectItem value="vendas">Vendas Consultivas</SelectItem>
                  <SelectItem value="lideranca">Liderança</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="O que você gostaria de compartilhar com a comunidade?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button>Publicar</Button>
              <Button variant="outline">Salvar Rascunho</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Conteúdo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar posts, autores ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('all')}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={activeFilter === 'discussions' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('discussions')}
                size="sm"
              >
                Discussões
              </Button>
              <Button
                variant={activeFilter === 'questions' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('questions')}
                size="sm"
              >
                Perguntas
              </Button>
              <Button
                variant={activeFilter === 'announcements' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('announcements')}
                size="sm"
              >
                Anúncios
              </Button>
              <Button
                variant={activeFilter === 'polls' ? 'default' : 'outline'}
                onClick={() => setActiveFilter('polls')}
                size="sm"
              >
                Enquetes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Posts Feed */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          {filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>
                        {post.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{post.author.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {post.author.role}
                        </Badge>
                        <Badge variant={getPostTypeColor(post.postType)} className="text-xs gap-1">
                          {getPostTypeIcon(post.postType)}
                          {getPostTypeName(post.postType)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{new Intl.DateTimeFormat('pt-BR', { 
                          dateStyle: 'short',
                          timeStyle: 'short'
                        }).format(post.createdAt)}</span>
                        {post.course && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {post.course}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.isPinned && (
                      <Pin className="h-4 w-4 text-primary" />
                    )}
                    {post.isFlagged && (
                      <Flag className="h-4 w-4 text-destructive" />
                    )}
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {post.title && (
                  <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                )}
                <p className="text-muted-foreground mb-4">{post.content}</p>
                
                {post.tags && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ThumbsUp className="h-4 w-4" />
                      {post.upvotes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Reply className="h-4 w-4" />
                      {post.comments}
                    </Button>
                    {post.views && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Reply className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['vendas', 'marketing', 'funil', 'automacao', 'ia', 'lideranca', 'produtividade', 'estrategia'].map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Most Active Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usuários Mais Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Maria Santos', role: 'Instrutora', posts: 28 },
                  { name: 'João Silva', role: 'Aluno', posts: 15 },
                  { name: 'Ana Costa', role: 'Mentora', posts: 12 }
                ].map((user, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.posts} posts</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Diretrizes da Comunidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Seja respeitoso e educado</p>
                <p>• Mantenha as discussões relevantes</p>
                <p>• Não compartilhe spam ou autopromoção</p>
                <p>• Use tags apropriadas</p>
                <p>• Reporte conteúdo inadequado</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AcademyCommunity;