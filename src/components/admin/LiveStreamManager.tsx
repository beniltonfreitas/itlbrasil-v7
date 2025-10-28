import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useLiveStreams, useCreateLiveStream, useUpdateLiveStream, useDeleteLiveStream, LiveStream } from "@/hooks/useLiveStreams";
import { Plus, Edit, Trash2, Radio, Tv, Mic, Users, Calendar, Settings } from "lucide-react";

const LiveStreamManager = () => {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<LiveStream | null>(null);

  const { data: streams, isLoading, error } = useLiveStreams(selectedType === "all" ? undefined : selectedType);
  const createStreamMutation = useCreateLiveStream();
  const updateStreamMutation = useUpdateLiveStream();
  const deleteStreamMutation = useDeleteLiveStream();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stream_url: "",
    stream_type: "tv" as 'tv' | 'radio' | 'podcast',
    status: "offline" as 'live' | 'offline' | 'scheduled',
    thumbnail_url: "",
    scheduled_start: "",
    scheduled_end: "",
    chat_enabled: true,
    embed_code: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      stream_url: "",
      stream_type: "tv",
      status: "offline",
      thumbnail_url: "",
      scheduled_start: "",
      scheduled_end: "",
      chat_enabled: true,
      embed_code: "",
    });
    setEditingStream(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingStream) {
        await updateStreamMutation.mutateAsync({
          id: editingStream.id,
          ...formData,
          viewer_count: editingStream.viewer_count,
        });
        toast.success("Transmissão atualizada com sucesso!");
      } else {
        await createStreamMutation.mutateAsync({
          ...formData,
          viewer_count: 0,
        });
        toast.success("Transmissão criada com sucesso!");
      }
      
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error(editingStream ? "Erro ao atualizar transmissão" : "Erro ao criar transmissão");
    }
  };

  const handleEdit = (stream: LiveStream) => {
    setEditingStream(stream);
    setFormData({
      title: stream.title,
      description: stream.description || "",
      stream_url: stream.stream_url,
      stream_type: (stream.stream_type || "tv") as "tv" | "radio" | "podcast",
      status: (stream.status || "scheduled") as "live" | "scheduled" | "offline",
      thumbnail_url: stream.thumbnail_url || "",
      scheduled_start: stream.scheduled_at ? new Date(stream.scheduled_at).toISOString().slice(0, 16) : "",
      scheduled_end: "",
      chat_enabled: stream.chat_enabled ?? true,
      embed_code: stream.embed_code || "",
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (streamId: string) => {
    try {
      await deleteStreamMutation.mutateAsync(streamId);
      toast.success("Transmissão excluída com sucesso!");
    } catch (error) {
      toast.error("Erro ao excluir transmissão");
    }
  };

  const getStreamTypeIcon = (type: string) => {
    switch (type) {
      case 'tv': return <Tv className="h-4 w-4" />;
      case 'radio': return <Radio className="h-4 w-4" />;
      case 'podcast': return <Mic className="h-4 w-4" />;
      default: return <Radio className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500';
      case 'scheduled': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Erro ao carregar transmissões: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Transmissões</h1>
          <p className="text-muted-foreground">
            Gerencie transmissões ao vivo, rádio e podcasts
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Transmissão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingStream ? "Editar Transmissão" : "Nova Transmissão"}
              </DialogTitle>
              <DialogDescription>
                {editingStream ? "Edite as informações da transmissão" : "Configure uma nova transmissão ao vivo"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nome da transmissão"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stream_type">Tipo</Label>
                  <Select 
                    value={formData.stream_type} 
                    onValueChange={(value: any) => setFormData({ ...formData, stream_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tv">TV</SelectItem>
                      <SelectItem value="radio">Rádio</SelectItem>
                      <SelectItem value="podcast">Podcast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da transmissão"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stream_url">URL da Transmissão</Label>
                <Input
                  id="stream_url"
                  value={formData.stream_url}
                  onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                  placeholder="https://exemplo.com/stream"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="live">Ao Vivo</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url">URL da Thumbnail</Label>
                  <Input
                    id="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="https://exemplo.com/thumb.jpg"
                  />
                </div>
              </div>

              {formData.status === 'scheduled' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_start">Início Agendado</Label>
                    <Input
                      id="scheduled_start"
                      type="datetime-local"
                      value={formData.scheduled_start}
                      onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_end">Fim Agendado</Label>
                    <Input
                      id="scheduled_end"
                      type="datetime-local"
                      value={formData.scheduled_end}
                      onChange={(e) => setFormData({ ...formData, scheduled_end: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="chat_enabled"
                  checked={formData.chat_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, chat_enabled: checked })}
                />
                <Label htmlFor="chat_enabled">Chat habilitado</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="embed_code">Código de Incorporação (opcional)</Label>
                <Textarea
                  id="embed_code"
                  value={formData.embed_code}
                  onChange={(e) => setFormData({ ...formData, embed_code: e.target.value })}
                  placeholder="<iframe src=...></iframe>"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createStreamMutation.isPending || updateStreamMutation.isPending}>
                  {editingStream ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="tv">TV</TabsTrigger>
          <TabsTrigger value="radio">Rádio</TabsTrigger>
          <TabsTrigger value="podcast">Podcast</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : streams && streams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {streams.map((stream) => (
                <Card key={stream.id} className="relative">
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getStatusColor(stream.status)}`} />
                  
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {getStreamTypeIcon(stream.stream_type)}
                      <CardTitle className="text-lg truncate">{stream.title}</CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {stream.stream_type}
                      </Badge>
                      <Badge variant={stream.status === 'live' ? 'destructive' : 'secondary'}>
                        {stream.status === 'live' ? 'Ao Vivo' : 
                         stream.status === 'scheduled' ? 'Agendado' : 'Offline'}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {stream.thumbnail_url && (
                      <img 
                        src={stream.thumbnail_url} 
                        alt={stream.title}
                        className="w-full h-32 object-cover rounded-md mb-4"
                      />
                    )}
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {stream.description || "Sem descrição"}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Users className="h-4 w-4" />
                      <span>{stream.viewer_count} espectadores</span>
                    </div>

                    {stream.scheduled_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(stream.scheduled_at).toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(stream)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a transmissão "{stream.title}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(stream.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Radio className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma transmissão encontrada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {selectedType === "all" 
                    ? "Você ainda não criou nenhuma transmissão."
                    : `Você ainda não criou nenhuma transmissão de ${selectedType}.`
                  }
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Transmissão
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveStreamManager;