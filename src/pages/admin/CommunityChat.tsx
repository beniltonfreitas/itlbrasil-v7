import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  MessageCircle, 
  Users, 
  Settings, 
  Send,
  Search,
  Zap,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Volume2,
  VolumeX,
  Shield,
  Eye,
  Crown
} from "lucide-react";

const CommunityChat = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Mock data - em produção vir da API via WebSocket
  const chatRooms = [
    {
      id: 1,
      name: "Geral - Tecnologia",
      community: "Tecnologia e Inovação",
      activeUsers: 23,
      totalMembers: 324,
      isActive: true,
      hasUnread: true,
      lastMessage: {
        user: "João Silva",
        content: "Alguém já testou a nova versão do React 19?",
        timestamp: "2024-03-20T10:30:00Z"
      }
    },
    {
      id: 2,
      name: "Debate - Política",
      community: "Análise Política Premium",
      activeUsers: 45,
      totalMembers: 156,
      isActive: true,
      hasUnread: false,
      lastMessage: {
        user: "Maria Santos",
        content: "A análise sobre as eleições municipais está muito interessante",
        timestamp: "2024-03-20T10:25:00Z"
      }
    },
    {
      id: 3,
      name: "Investimentos",
      community: "Mercado Financeiro",
      activeUsers: 12,
      totalMembers: 198,
      isActive: true,
      hasUnread: true,
      lastMessage: {
        user: "Pedro Costa",
        content: "Bitcoin subindo novamente, o que acham?",
        timestamp: "2024-03-20T10:20:00Z"
      }
    },
  ];

  const messages = [
    {
      id: 1,
      user: "João Silva",
      avatar: "/placeholder-avatar.jpg",
      content: "Alguém já testou a nova versão do React 19?",
      timestamp: "2024-03-20T10:30:00Z",
      type: "message"
    },
    {
      id: 2,
      user: "Ana Costa",
      avatar: "/placeholder-avatar.jpg",
      content: "Ainda não, mas estou ansioso pelas novas features!",
      timestamp: "2024-03-20T10:31:00Z",
      type: "message"
    },
    {
      id: 3,
      user: "Sistema",
      avatar: null,
      content: "Pedro Lima entrou no chat",
      timestamp: "2024-03-20T10:32:00Z",
      type: "system"
    },
    {
      id: 4,
      user: "Pedro Lima",
      avatar: "/placeholder-avatar.jpg",
      content: "Oi pessoal! Acabei de ver a discussão sobre React 19. A performance melhorou muito!",
      timestamp: "2024-03-20T10:33:00Z",
      type: "message"
    },
  ];

  const onlineUsers = [
    { name: "João Silva", status: "online", role: "member" },
    { name: "Ana Costa", status: "online", role: "moderator" },
    { name: "Pedro Lima", status: "online", role: "member" },
    { name: "Maria Santos", status: "away", role: "admin" },
    { name: "Carlos Oliveira", status: "online", role: "member" },
  ];

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "agora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Aqui seria enviado via WebSocket
      console.log("Enviando mensagem:", newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chat em Tempo Real</h1>
          <p className="text-muted-foreground">
            Moderação e gerenciamento de chats das comunidades
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Configurações do Chat
        </Button>
      </div>

      {/* Estatísticas do Chat */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {chatRooms.reduce((acc, room) => acc + room.activeUsers, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Usuários Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{chatRooms.length}</p>
                <p className="text-sm text-muted-foreground">Salas Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-sm text-muted-foreground">Mensagens Reportadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {chatRooms.reduce((acc, room) => acc + room.totalMembers, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total de Membros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Lista de Salas de Chat */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Salas de Chat</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar salas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {chatRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer border-l-4 border-l-primary"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{room.name}</h4>
                        {room.hasUnread && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{room.community}</p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {room.lastMessage.content}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs">
                        {room.activeUsers}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(room.lastMessage.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Área Principal do Chat */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Geral - Tecnologia</h3>
                  <p className="text-sm text-muted-foreground">
                    23 usuários online • Comunidade: Tecnologia e Inovação
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Mensagens */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-3">
                  {message.type === "system" ? (
                    <div className="flex-1 text-center">
                      <p className="text-sm text-muted-foreground italic">
                        {message.content}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{message.user}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </CardContent>

            {/* Input de Mensagem */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="resize-none"
                  rows={2}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage} className="self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Usuários Online */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usuários Online</CardTitle>
              <CardDescription>
                {onlineUsers.filter(u => u.status === 'online').length} de {onlineUsers.length} online
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {onlineUsers.map((user, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 hover:bg-accent">
                    <div className="relative">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card ${
                        user.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                    {user.role === 'admin' && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                    {user.role === 'moderator' && (
                      <Shield className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;