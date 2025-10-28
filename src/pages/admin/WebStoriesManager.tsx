import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useWebStories, useDeleteWebStory, useToggleWebStoryPublish } from "@/hooks/useWebStories";
import { Plus, Search, Edit, Eye, EyeOff, Trash2, FileText, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const WebStoriesManager = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: webstories, isLoading } = useWebStories();
  const deleteMutation = useDeleteWebStory();
  const togglePublishMutation = useToggleWebStoryPublish();

  const filteredWebStories = webstories?.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleTogglePublish = async (id: string, currentStatus: 'rascunho' | 'publicado') => {
    const newStatus = currentStatus === 'publicado' ? 'rascunho' : 'publicado';
    await togglePublishMutation.mutateAsync({ id, status: newStatus });
  };

  const getStatusBadge = (status: 'rascunho' | 'publicado') => {
    if (status === 'publicado') {
      return <Badge className="bg-green-100 text-green-800">Publicado</Badge>;
    }
    return <Badge variant="secondary">Rascunho</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">WebStories</h1>
          <p className="text-muted-foreground">
            Crie e gerencie suas WebStories
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/webstories/new">
            <Plus className="h-4 w-4 mr-2" />
            Nova WebStory
          </Link>
        </Button>
      </div>

      {/* Search Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar WebStories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* WebStories List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredWebStories.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma WebStory encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Crie sua primeira WebStory ou converta um artigo existente.
              </p>
              <Button asChild>
                <Link to="/admin/webstories/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar WebStory
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredWebStories.map((story) => (
                <div key={story.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{story.title}</h3>
                        {getStatusBadge(story.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Criado {formatDistanceToNow(new Date(story.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTogglePublish(story.id, story.status)}
                        disabled={togglePublishMutation.isPending}
                      >
                        {story.status === 'publicado' ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/webstories/${story.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a WebStory "{story.title}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(story.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebStoriesManager;