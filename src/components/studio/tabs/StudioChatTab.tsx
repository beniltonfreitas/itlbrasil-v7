import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { 
  MessageSquare, 
  Send, 
  Heart, 
  ThumbsUp, 
  Filter, 
  Settings,
  Youtube,
  Facebook,
  Instagram,
  Twitch,
  Shield,
  Flag,
  Trash2
} from "lucide-react";

interface StudioChatTabProps {
  sessionStatus: 'preparing' | 'live' | 'ended';
}

const StudioChatTab = ({ sessionStatus }: StudioChatTabProps) => {
  const [message, setMessage] = useState("");
  
  const chatMessages = [
    {
      id: "1",
      user: "João Silva",
      platform: "youtube",
      message: "Ótima apresentação! 👏",
      timestamp: "14:35",
      isModerated: false
    },
    {
      id: "2", 
      user: "Maria Santos",
      platform: "facebook",
      message: "Quando sai o próximo episódio?",
      timestamp: "14:36",
      isModerated: false
    },
    {
      id: "3",
      user: "Pedro Costa",
      platform: "instagram", 
      message: "Alguém pode me explicar melhor esse ponto?",
      timestamp: "14:37",
      isModerated: false
    },
    {
      id: "4",
      user: "Ana Oliveira",
      platform: "twitch",
      message: "Stream perfeita! Muito conteúdo de qualidade",
      timestamp: "14:38",
      isModerated: false
    }
  ];

  const reactions = [
    { icon: Heart, count: 156, active: false },
    { icon: ThumbsUp, count: 89, active: true }
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return Youtube;
      case 'facebook': return Facebook; 
      case 'instagram': return Instagram;
      case 'twitch': return Twitch;
      default: return MessageSquare;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'youtube': return 'text-red-500';
      case 'facebook': return 'text-blue-600';
      case 'instagram': return 'text-pink-500';
      case 'twitch': return 'text-purple-500';
      default: return 'text-muted-foreground';
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      // Adicionar lógica para enviar mensagem
      setMessage("");
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Chat Messages */}
      <ResizablePanel defaultSize={70} className="pr-2">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat ao Vivo ({chatMessages.length} mensagens)
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Configurar
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-4">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {chatMessages.map((msg) => {
                const PlatformIcon = getPlatformIcon(msg.platform);
                return (
                  <div key={msg.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    {/* Platform Icon */}
                    <div className="flex-shrink-0">
                      <PlatformIcon className={`h-5 w-5 ${getPlatformColor(msg.platform)}`} />
                    </div>
                    
                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{msg.user}</span>
                        <Badge variant="outline" className="text-xs">
                          {msg.platform}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    
                    {/* Moderation Actions */}
                    <div className="flex-shrink-0 flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Heart className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Flag className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Message Input */}
            <div className="flex gap-2 border-t pt-4">
              <Input
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Chat Controls & Stats */}
      <ResizablePanel defaultSize={30} className="pl-2">
        <div className="space-y-4 h-full">
          {/* Live Reactions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Reações ao Vivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {reactions.map((reaction, index) => (
                  <Button 
                    key={index}
                    variant={reaction.active ? "default" : "outline"}
                    size="sm"
                    className="flex items-center justify-center gap-2"
                  >
                    <reaction.icon className="h-4 w-4" />
                    <span className="text-xs">{reaction.count}</span>
                  </Button>
                ))}
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Total de interações: <span className="font-medium">245</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Platform Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Por Plataforma</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-500" />
                    <span className="text-sm">YouTube</span>
                  </div>
                  <Badge variant="secondary">45</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Facebook</span>
                  </div>
                  <Badge variant="secondary">23</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-pink-500" />
                    <span className="text-sm">Instagram</span>
                  </div>
                  <Badge variant="secondary">18</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Twitch className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Twitch</span>
                  </div>
                  <Badge variant="secondary">12</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Moderation Tools */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Moderação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm">
                  <span>Palavras proibidas</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Filtro de spam</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Aprovação manual</span>
                  <input type="checkbox" className="rounded" />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Modo apenas seguidores</span>
                  <input type="checkbox" className="rounded" />
                </label>
              </div>
              
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configurar Filtros
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Fixar Mensagem
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Modo Lento
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default StudioChatTab;