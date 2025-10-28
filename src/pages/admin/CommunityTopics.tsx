import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Heart, 
  MessageCircle,
  Eye,
  Pin,
  Star,
  TrendingUp,
  Clock,
  User,
  Image,
  Video,
  BarChart3
} from "lucide-react";

const CommunityTopics = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Mock data - em produção vir da API
  const posts = [
    {
      id: 1,
      title: "Nova plataforma de IA revoluciona mercado brasileiro",
      content: "Discussão sobre os impactos da nova ferramenta de inteligência artificial...",
      type: "text",
      author: "Maria Silva",
      community: "Tecnologia e Inovação",
      createdAt: "2024-03-20T10:30:00Z",
      isPinned: true,
      isFeatured: false,
      viewCount: 324,
      reactionCount: 45,
      commentCount: 23
    },
    {
      id: 2,
      title: "Análise: Eleições municipais 2024",
      content: "Cenário político atual e projeções para as próximas eleições...",
      type: "text",
      author: "João Santos",
      community: "Análise Política Premium",
      createdAt: "2024-03-20T09:15:00Z",
      isPinned: false,
      isFeatured: true,
      viewCount: 567,
      reactionCount: 89,
      commentCount: 67
    },
    {
      id: 3,
      title: "Tutorial: Configurando ambiente React + TypeScript",
      content: "Passo a passo completo para configurar seu ambiente de desenvolvimento...",
      type: "image",
      author: "Ana Costa",
      community: "Tecnologia e Inovação",
      createdAt: "2024-03-19T16:45:00Z",
      isPinned: false,
      isFeatured: false,
      viewCount: 189,
      reactionCount: 34,
      commentCount: 12
    },
    {
      id: 4,
      title: "Live: Mercado de criptomoedas hoje",
      content: "Análise ao vivo das principais moedas digitais...",
      type: "video",
      author: "Pedro Lima",
      community: "Mercado Financeiro",
      createdAt: "2024-03-19T14:20:00Z",
      isPinned: false,
      isFeatured: false,
      viewCount: 445,
      reactionCount: 67,
      commentCount: 34
    },
  ];

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'poll': return <BarChart3 className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'image': return 'Imagem';
      case 'video': return 'Vídeo';
      case 'poll': return 'Enquete';
      default: return 'Texto';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "pinned") return matchesSearch && post.isPinned;
    if (activeTab === "featured") return matchesSearch && post.isFeatured;
    if (activeTab === "trending") return matchesSearch && post.reactionCount > 50;
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tópicos & Discussões</h1>
          <p className="text-muted-foreground">
            Gerencie posts, discussões e conteúdo das comunidades
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Post
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {posts.length}
                </p>
                <p className="text-sm text-muted-foreground">Posts Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {posts.reduce((acc, p) => acc + p.commentCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Comentários</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {posts.reduce((acc, p) => acc + p.reactionCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Reações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {posts.reduce((acc, p) => acc + p.viewCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Visualizações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tópicos e discussões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtros Avançados</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Categorização */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pinned">Fixados</TabsTrigger>
          <TabsTrigger value="featured">Em Destaque</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.isPinned && (
                        <Badge variant="secondary" className="gap-1">
                          <Pin className="h-3 w-3" />
                          Fixado
                        </Badge>
                      )}
                      {post.isFeatured && (
                        <Badge variant="default" className="gap-1">
                          <Star className="h-3 w-3" />
                          Destaque
                        </Badge>
                      )}
                      <Badge variant="outline" className="gap-1">
                        {getPostTypeIcon(post.type)}
                        {getPostTypeLabel(post.type)}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.community}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 mt-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>{post.viewCount} visualizações</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Heart className="h-4 w-4" />
                        <span>{post.reactionCount} reações</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.commentCount} comentários</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum tópico encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Crie o primeiro post para começar as discussões.'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Post
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CommunityTopics;