import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Filter, 
  Search,
  Edit,
  Trash2,
  Play,
  Pause,
  MoreHorizontal,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

const SocialSchedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data para posts agendados
  const scheduledPosts = [
    {
      id: "1",
      title: "Novidades do mercado tech",
      content: "Confira as principais tendências em tecnologia para 2024...",
      platforms: ["instagram", "linkedin"],
      scheduledAt: "2024-01-15T10:00:00",
      status: "scheduled",
      contentType: "image"
    },
    {
      id: "2", 
      title: "Dicas de produtividade",
      content: "5 dicas essenciais para aumentar sua produtividade no trabalho...",
      platforms: ["facebook", "twitter"],
      scheduledAt: "2024-01-15T14:30:00",
      status: "scheduled",
      contentType: "text"
    },
    {
      id: "3",
      title: "Webinar sobre IA",
      content: "Participe do nosso webinar sobre inteligência artificial...",
      platforms: ["linkedin", "youtube"],
      scheduledAt: "2024-01-16T09:00:00",
      status: "failed",
      contentType: "video"
    }
  ];

  const platforms = {
    instagram: { name: "Instagram", icon: Instagram, color: "text-pink-500" },
    facebook: { name: "Facebook", icon: Facebook, color: "text-blue-600" },
    linkedin: { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
    twitter: { name: "Twitter", icon: Twitter, color: "text-gray-900" },
    youtube: { name: "YouTube", icon: Youtube, color: "text-red-600" }
  };

  const statusColors = {
    scheduled: "bg-blue-500",
    published: "bg-green-500",
    failed: "bg-red-500",
    draft: "bg-gray-500"
  };

  const statusLabels = {
    scheduled: "Agendado",
    published: "Publicado", 
    failed: "Falhou",
    draft: "Rascunho"
  };

  const filteredPosts = scheduledPosts.filter(post => {
    const matchesStatus = filterStatus === "all" || post.status === filterStatus;
    const matchesPlatform = filterPlatform === "all" || post.platforms.includes(filterPlatform);
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPlatform && matchesSearch;
  });

  const handlePostAction = (action: string, postId: string) => {
    toast({
      title: `Post ${action}`,
      description: `Ação "${action}" executada no post ${postId}`,
    });
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR');
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agendamentos</h1>
            <p className="text-muted-foreground">
              Gerencie posts agendados e planeje seu conteúdo
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendário
          </Badge>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Calendário */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Calendário</CardTitle>
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

              {/* Posts do Dia Selecionado */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Posts de {selectedDate?.toLocaleDateString('pt-BR')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredPosts.map(post => (
                      <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${statusColors[post.status as keyof typeof statusColors]}`} />
                          <div>
                            <h4 className="font-medium">{post.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDateTime(post.scheduledAt)}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {post.platforms.map(platformId => {
                                const platform = platforms[platformId as keyof typeof platforms];
                                const Icon = platform.icon;
                                return (
                                  <Icon key={platformId} className={`h-4 w-4 ${platform.color}`} />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {statusLabels[post.status as keyof typeof statusLabels]}
                          </Badge>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handlePostAction("editar", post.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePostAction("pausar", post.id)}>
                                <Pause className="h-4 w-4 mr-2" />
                                Pausar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePostAction("publicar", post.id)}>
                                <Play className="h-4 w-4 mr-2" />
                                Publicar Agora
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handlePostAction("excluir", post.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                    
                    {filteredPosts.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum post agendado para esta data</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Plataformas</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Posts Agendados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPosts.map(post => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${statusColors[post.status as keyof typeof statusColors]}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-medium">{post.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {post.contentType}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(post.scheduledAt)}
                            </span>
                            <div className="flex items-center gap-1">
                              {post.platforms.map(platformId => {
                                const platform = platforms[platformId as keyof typeof platforms];
                                const Icon = platform.icon;
                                return (
                                  <Icon key={platformId} className={`h-3 w-3 ${platform.color}`} />
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {statusLabels[post.status as keyof typeof statusLabels]}
                        </Badge>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handlePostAction("editar", post.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePostAction("pausar", post.id)}>
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePostAction("publicar", post.id)}>
                              <Play className="h-4 w-4 mr-2" />
                              Publicar Agora
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handlePostAction("excluir", post.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};

export default SocialSchedule;