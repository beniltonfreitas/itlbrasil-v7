import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle,
  Search,
  Filter,
  Reply,
  Heart,
  MessageSquare,
  Eye,
  EyeOff,
  Archive,
  Flag,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Send,
  Smile,
  ThumbsUp,
  ThumbsDown,
  Minus
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SocialInbox = () => {
  const [selectedComment, setSelectedComment] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data para comentários e interações
  const comments = [
    {
      id: "1",
      platform: "instagram",
      postId: "post1",
      postTitle: "Novidades do mercado tech",
      authorName: "João Silva",
      authorUsername: "@joaosilva",
      authorAvatar: "/api/placeholder/40/40",
      content: "Excelente conteúdo! Muito útil para quem está começando na área tech.",
      sentiment: "positive",
      isReplied: false,
      isRead: false,
      createdAt: "2024-01-15T10:30:00Z",
      likes: 12,
      replies: 2
    },
    {
      id: "2",
      platform: "facebook", 
      postId: "post2",
      postTitle: "Dicas de produtividade",
      authorName: "Maria Santos",
      authorUsername: "@mariasantos",
      authorAvatar: "/api/placeholder/40/40",
      content: "Não concordo com algumas dessas dicas. Acho que falta contexto sobre trabalho remoto.",
      sentiment: "negative",
      isReplied: true,
      replyContent: "Obrigado pelo feedback! Vamos preparar um conteúdo específico sobre trabalho remoto.",
      repliedAt: "2024-01-15T11:00:00Z",
      isRead: true,
      createdAt: "2024-01-15T09:15:00Z",
      likes: 5,
      replies: 1
    },
    {
      id: "3",
      platform: "linkedin",
      postId: "post3", 
      postTitle: "Webinar sobre IA",
      authorName: "Carlos Oliveira",
      authorUsername: "@carlosoliveira",
      authorAvatar: "/api/placeholder/40/40",
      content: "Quando vai ser o próximo webinar? Gostaria de participar.",
      sentiment: "neutral",
      isReplied: false,
      isRead: true,
      createdAt: "2024-01-14T16:45:00Z",
      likes: 8,
      replies: 0
    }
  ];

  const platforms = {
    instagram: { name: "Instagram", icon: Instagram, color: "text-pink-500" },
    facebook: { name: "Facebook", icon: Facebook, color: "text-blue-600" },
    linkedin: { name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
    twitter: { name: "Twitter", icon: Twitter, color: "text-gray-900" },
    youtube: { name: "YouTube", icon: Youtube, color: "text-red-600" }
  };

  const sentimentColors = {
    positive: "bg-green-100 text-green-800",
    negative: "bg-red-100 text-red-800", 
    neutral: "bg-gray-100 text-gray-800"
  };

  const sentimentIcons = {
    positive: ThumbsUp,
    negative: ThumbsDown,
    neutral: Minus
  };

  const filteredComments = comments.filter(comment => {
    const matchesPlatform = filterPlatform === "all" || comment.platform === filterPlatform;
    const matchesSentiment = filterSentiment === "all" || comment.sentiment === filterSentiment;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "replied" && comment.isReplied) ||
                         (filterStatus === "unreplied" && !comment.isReplied) ||
                         (filterStatus === "read" && comment.isRead) ||
                         (filterStatus === "unread" && !comment.isRead);
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesPlatform && matchesSentiment && matchesStatus && matchesSearch;
  });

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma resposta antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Resposta Enviada",
      description: "Sua resposta foi publicada com sucesso.",
    });
    
    setReplyText("");
    setSelectedComment(null);
  };

  const handleCommentAction = (action: string, commentId: string) => {
    toast({
      title: `Comentário ${action}`,
      description: `Ação "${action}" executada no comentário ${commentId}`,
    });
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR');
  };

  const getUnreadCount = () => {
    return comments.filter(c => !c.isRead).length;
  };

  const getUnrepliedCount = () => {
    return comments.filter(c => !c.isReplied).length;
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Inbox Social</h1>
            <p className="text-muted-foreground">
              Gerencie comentários e interações de todas as redes sociais
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <MessageCircle className="h-4 w-4 mr-2" />
              {filteredComments.length} mensagens
            </Badge>
            {getUnreadCount() > 0 && (
              <Badge variant="destructive" className="px-3 py-1">
                {getUnreadCount()} não lidas
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtros e Lista */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar comentários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Plataformas</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterSentiment} onValueChange={setFilterSentiment}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Sentimentos</SelectItem>
                      <SelectItem value="positive">Positivo</SelectItem>
                      <SelectItem value="negative">Negativo</SelectItem>
                      <SelectItem value="neutral">Neutro</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Status</SelectItem>
                      <SelectItem value="unread">Não Lidas</SelectItem>
                      <SelectItem value="read">Lidas</SelectItem>
                      <SelectItem value="unreplied">Sem Resposta</SelectItem>
                      <SelectItem value="replied">Respondidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Comentários */}
            <Card>
              <CardHeader>
                <CardTitle>Comentários e Interações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredComments.map(comment => {
                    const platform = platforms[comment.platform as keyof typeof platforms];
                    const PlatformIcon = platform.icon;
                    const SentimentIcon = sentimentIcons[comment.sentiment as keyof typeof sentimentIcons];
                    
                    return (
                      <div 
                        key={comment.id} 
                        className={`border rounded-lg p-4 hover:bg-muted/50 cursor-pointer ${!comment.isRead ? 'bg-blue-50/50 border-blue-200' : ''}`}
                        onClick={() => setSelectedComment(comment.id)}
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={comment.authorAvatar} />
                            <AvatarFallback>{comment.authorName[0]}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{comment.authorName}</h4>
                              <span className="text-sm text-muted-foreground">
                                {comment.authorUsername}
                              </span>
                              <PlatformIcon className={`h-4 w-4 ${platform.color}`} />
                              <Badge className={`text-xs ${sentimentColors[comment.sentiment as keyof typeof sentimentColors]}`}>
                                <SentimentIcon className="h-3 w-3 mr-1" />
                                {comment.sentiment}
                              </Badge>
                              {!comment.isRead && (
                                <Badge variant="destructive" className="text-xs">
                                  Nova
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              Em: <span className="font-medium">{comment.postTitle}</span>
                            </p>
                            
                            <p className="text-sm mb-3">{comment.content}</p>
                            
                            {comment.isReplied && comment.replyContent && (
                              <div className="bg-muted/50 p-3 rounded-lg mb-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Reply className="h-3 w-3 text-primary" />
                                  <span className="text-xs font-medium">Sua resposta:</span>
                                </div>
                                <p className="text-sm">{comment.replyContent}</p>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{formatTime(comment.createdAt)}</span>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {comment.likes}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {comment.replies}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCommentAction("marcar como lido", comment.id);
                                  }}
                                >
                                  {comment.isRead ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedComment(comment.id);
                                  }}
                                >
                                  <Reply className="h-3 w-3" />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCommentAction("arquivar", comment.id);
                                  }}
                                >
                                  <Archive className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredComments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum comentário encontrado</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Estatísticas e Resposta Rápida */}
          <div className="space-y-6">
            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total</span>
                  <Badge variant="outline">{comments.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Não lidas</span>
                  <Badge variant="destructive">{getUnreadCount()}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sem resposta</span>
                  <Badge variant="secondary">{getUnrepliedCount()}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Positivos</span>
                  <Badge className="bg-green-100 text-green-800">
                    {comments.filter(c => c.sentiment === 'positive').length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Resposta Rápida */}
            {selectedComment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resposta Rápida</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Respondendo a {comments.find(c => c.id === selectedComment)?.authorName}
                  </div>
                  
                  <Textarea
                    placeholder="Digite sua resposta..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-20"
                  />
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleReply(selectedComment)}
                      size="sm"
                      className="flex-1"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </Button>
                    
                    <Button variant="outline" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Respostas rápidas disponíveis
                  </div>
                  
                  <div className="space-y-1">
                    {[
                      "Obrigado pelo feedback!",
                      "Vamos analisar sua sugestão.",
                      "Ficamos felizes que tenha gostado!"
                    ].map(template => (
                      <Button
                        key={template}
                        variant="ghost"
                        size="sm"
                        className="w-full text-left justify-start text-xs h-auto p-2"
                        onClick={() => setReplyText(template)}
                      >
                        {template}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default SocialInbox;