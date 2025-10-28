import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { 
  PlusCircle, 
  Image, 
  Sparkles, 
  Calendar, 
  Eye, 
  Hash,
  Smile,
  Save,
  Send,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SocialCreatePost = () => {
  const [postData, setPostData] = useState({
    title: "",
    content: "",
    platforms: [] as string[],
    contentType: "text",
    hashtags: [] as string[],
    scheduledAt: "",
    mediaUrls: [] as string[]
  });

  const [characterCount, setCharacterCount] = useState(0);
  const [aiTone, setAiTone] = useState("informativo");

  const platforms = [
    { id: "instagram", name: "Instagram", icon: Instagram, limit: 2200, color: "text-pink-500" },
    { id: "facebook", name: "Facebook", icon: Facebook, limit: 63206, color: "text-blue-600" },
    { id: "linkedin", name: "LinkedIn", icon: Linkedin, limit: 3000, color: "text-blue-700" },
    { id: "twitter", name: "Twitter/X", icon: Twitter, limit: 280, color: "text-gray-900" },
    { id: "youtube", name: "YouTube", icon: Youtube, limit: 5000, color: "text-red-600" }
  ];

  const tones = [
    { value: "informativo", label: "Informativo" },
    { value: "persuasivo", label: "Persuasivo" },
    { value: "divertido", label: "Divertido" },
    { value: "profissional", label: "Profissional" },
    { value: "casual", label: "Casual" }
  ];

  const contentTypes = [
    { value: "text", label: "Texto" },
    { value: "image", label: "Imagem" },
    { value: "video", label: "Vídeo" },
    { value: "carousel", label: "Carrossel" },
    { value: "story", label: "Story" }
  ];

  const handlePlatformToggle = (platformId: string) => {
    setPostData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const handleContentChange = (content: string) => {
    setPostData(prev => ({ ...prev, content }));
    setCharacterCount(content.length);
  };

  const generateWithAI = () => {
    toast({
      title: "IA Ativada",
      description: `Gerando conteúdo com tom ${aiTone}...`,
    });
    // Aqui seria integrada a IA para gerar conteúdo
  };

  const saveDraft = () => {
    toast({
      title: "Rascunho Salvo",
      description: "Seu post foi salvo como rascunho.",
    });
  };

  const schedulePost = () => {
    if (postData.platforms.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma plataforma.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Post Agendado",
      description: `Post agendado para ${postData.platforms.length} plataforma(s).`,
    });
  };

  const publishNow = () => {
    if (postData.platforms.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma plataforma.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Post Publicado",
      description: `Post publicado em ${postData.platforms.length} plataforma(s).`,
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Criar Post</h1>
            <p className="text-muted-foreground">
              Crie e agende posts para suas redes sociais
            </p>
          </div>
          <Badge variant="outline" className="px-3 py-1">
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Post
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título (opcional)</Label>
                  <Input
                    id="title"
                    value={postData.title}
                    onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título do seu post..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="content">Conteúdo</Label>
                    <span className="text-sm text-muted-foreground">
                      {characterCount} caracteres
                    </span>
                  </div>
                  <Textarea
                    id="content"
                    value={postData.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Escreva o conteúdo do seu post..."
                    className="min-h-32"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={aiTone} onValueChange={setAiTone}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map(tone => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" onClick={generateWithAI}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar com IA
                  </Button>
                  
                  <Button variant="outline">
                    <Hash className="h-4 w-4 mr-2" />
                    Hashtags
                  </Button>
                  
                  <Button variant="outline">
                    <Smile className="h-4 w-4 mr-2" />
                    Emojis
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mídia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Mídia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Tipo de Conteúdo</Label>
                  <Select value={postData.contentType} onValueChange={(value) => setPostData(prev => ({ ...prev, contentType: value }))}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-4 p-4 border-2 border-dashed border-border rounded-lg text-center">
                  <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <Button variant="outline" size="sm">
                    Selecionar Arquivos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plataformas */}
            <Card>
              <CardHeader>
                <CardTitle>Plataformas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {platforms.map(platform => {
                  const Icon = platform.icon;
                  const isSelected = postData.platforms.includes(platform.id);
                  const exceededLimit = characterCount > platform.limit;
                  
                  return (
                    <div key={platform.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handlePlatformToggle(platform.id)}
                        />
                        <Icon className={`h-5 w-5 ${platform.color}`} />
                        <div>
                          <p className="text-sm font-medium">{platform.name}</p>
                          <p className={`text-xs ${exceededLimit ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {platform.limit} caracteres max
                          </p>
                        </div>
                      </div>
                      {exceededLimit && (
                        <Badge variant="destructive" className="text-xs">
                          Limite
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Agendamento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Agendamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="schedule">Data e Hora</Label>
                  <Input
                    id="schedule"
                    type="datetime-local"
                    value={postData.scheduledAt}
                    onChange={(e) => setPostData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    className="mt-2"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="best-time" />
                  <Label htmlFor="best-time" className="text-sm">
                    Sugerir melhor horário
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="instagram">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="instagram">Instagram</TabsTrigger>
                    <TabsTrigger value="facebook">Facebook</TabsTrigger>
                  </TabsList>
                  <TabsContent value="instagram" className="mt-4">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-lg text-white">
                      <div className="bg-white text-black p-3 rounded-lg">
                        <p className="text-sm">
                          {postData.content || "Seu conteúdo aparecerá aqui..."}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="facebook" className="mt-4">
                    <div className="bg-blue-600 p-4 rounded-lg text-white">
                      <div className="bg-white text-black p-3 rounded-lg">
                        <p className="text-sm">
                          {postData.content || "Seu conteúdo aparecerá aqui..."}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button onClick={saveDraft} variant="outline" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Rascunho
                </Button>
                
                <Button onClick={schedulePost} className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Post
                </Button>
                
                <Button onClick={publishNow} variant="secondary" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Publicar Agora
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default SocialCreatePost;