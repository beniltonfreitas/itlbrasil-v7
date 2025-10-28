import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useArticles } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { useArticleToWebStory } from "@/hooks/useArticleToWebStory";
import { useDeleteArticle } from "@/hooks/useArticleMutations";
import BulkActionsToolbar from "@/components/BulkActionsToolbar";
import { Plus, Search, Edit, Eye, Calendar, Clock, FileText, Zap, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

const ArticlesManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);

  const { data: articles, isLoading } = useArticles({ limit: 100 });
  const { data: categories } = useCategories();
  const { mutate: convertToWebStory, isPending: isCreatingWebStory } = useArticleToWebStory();
  const deleteMutation = useDeleteArticle();
  const { toast } = useToast();

  // Filter articles based on search and filters
  const filteredArticles = articles?.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "published" && article.published_at) ||
                         (statusFilter === "draft" && !article.published_at);
    
    const matchesCategory = categoryFilter === "all" || 
                           article.category?.id === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  const getStatusBadge = (article: any) => {
    if (article.published_at) {
      return <Badge className="bg-green-100 text-green-800">Publicado</Badge>;
    }
    return <Badge variant="secondary">Rascunho</Badge>;
  };

  const handleCreateWebStory = (articleId: string, articleTitle: string) => {
    convertToWebStory(articleId);
  };

  const handleDeleteArticle = async (articleId: string, articleTitle: string) => {
    try {
      await deleteMutation.mutateAsync(articleId);
      toast({
        title: "Notícia excluída",
        description: `A notícia "${articleTitle}" foi excluída com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a notícia.",
        variant: "destructive",
      });
    }
  };

  // Selection handlers
  const allArticleIds = filteredArticles.map(article => article.id);
  const isAllSelected = allArticleIds.length > 0 && selectedArticles.length === allArticleIds.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArticles(allArticleIds);
    } else {
      setSelectedArticles([]);
    }
  };

  const handleSelectArticle = (articleId: string, checked: boolean) => {
    if (checked) {
      setSelectedArticles(prev => [...prev, articleId]);
    } else {
      setSelectedArticles(prev => prev.filter(id => id !== articleId));
    }
  };

  const handleClearSelection = () => {
    setSelectedArticles([]);
  };

  const selectedArticlesTitles = filteredArticles
    .filter(article => selectedArticles.includes(article.id))
    .map(article => article.title);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Notícias</h1>
          <p className="text-muted-foreground">
            Gerencie todas as notícias do portal
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/articles/new">
            <Plus className="h-4 w-4 mr-2" />
            Nova Notícia
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar notícias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Rascunhos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories?.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedArticles={selectedArticles}
        allArticleIds={allArticleIds}
        isAllSelected={isAllSelected}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        selectedArticlesTitles={selectedArticlesTitles}
      />

      {/* Articles List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma notícia encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Não há notícias que correspondam aos filtros selecionados.
              </p>
              <Button asChild>
                <Link to="/admin/articles/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira notícia
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredArticles.map((article) => (
                <div key={article.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Checkbox
                        checked={selectedArticles.includes(article.id)}
                        onCheckedChange={(checked) => handleSelectArticle(article.id, checked as boolean)}
                        className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{article.title}</h3>
                        {getStatusBadge(article)}
                      </div>
                      
                      {article.excerpt && (
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {article.published_at ? (
                            <span>
                              Publicado {formatDistanceToNow(new Date(article.published_at), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </span>
                          ) : (
                            <span>Rascunho</span>
                          )}
                        </div>
                        
                        {article.category && (
                          <Badge variant="outline" className="text-xs">
                            {article.category.name}
                          </Badge>
                        )}
                        
                        {article.author && (
                          <span>Por {article.author.name}</span>
                        )}
                        
                        {article.read_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{article.read_time} min</span>
                          </div>
                        )}
                      </div>
                    </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/noticia/${article.slug}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/admin/articles/${article.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      {article.published_at && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCreateWebStory(article.id, article.title)}
                          disabled={isCreatingWebStory}
                        >
                          <Zap className="h-4 w-4" />
                        </Button>
                      )}
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
                              Tem certeza que deseja excluir a notícia "{article.title}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteArticle(article.id, article.title)}
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

export default ArticlesManager;