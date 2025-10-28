import React, { useState } from "react";
import { useArticlesQueue, useApproveArticle, useRejectArticle, useDeleteQueueArticle } from "@/hooks/useArticlesQueue";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, Check, X, Trash2, Eye, Calendar, User, Tag, Clock, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ArticlesQueueManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  
  const { data: articles, isLoading } = useArticlesQueue();
  const { data: categories } = useCategories();
  const approveMutation = useApproveArticle();
  const rejectMutation = useRejectArticle();
  const deleteMutation = useDeleteQueueArticle();
  const { toast } = useToast();

  const filteredArticles = articles?.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleApprove = async (articleId: string, articleTitle: string) => {
    try {
      await approveMutation.mutateAsync({ articleId, userId: 'admin' });
      toast({
        title: "Notícia aprovada",
        description: `"${articleTitle}" foi publicada com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao aprovar",
        description: "Não foi possível aprovar o artigo.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (articleId: string, articleTitle: string) => {
    try {
      await rejectMutation.mutateAsync({ articleId, userId: 'admin' });
      toast({
        title: "Notícia rejeitada",
        description: `"${articleTitle}" foi rejeitada.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Erro ao rejeitar",
        description: "Não foi possível rejeitar o artigo.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (articleId: string, articleTitle: string) => {
    try {
      await deleteMutation.mutateAsync(articleId);
      toast({
        title: "Notícia excluída",
        description: `"${articleTitle}" foi excluída da fila.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o artigo.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><Check className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600"><X className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = articles?.filter(a => a.status === 'pending').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fila de Revisão</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie notícias importadas que aguardam revisão antes da publicação
          </p>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="mt-2">
              {pendingCount} notícia{pendingCount !== 1 ? 's' : ''} pendente{pendingCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por título ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notícias na Fila ({filteredArticles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Carregando artigos...</p>
          ) : filteredArticles.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma notícia encontrada.</p>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <div key={article.id} className="border rounded-lg p-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(article.status)}
                          <span className="text-sm text-muted-foreground">
                            {new Date(article.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg line-clamp-2">{article.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {article.excerpt || article.content.slice(0, 200) + '...'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {categories?.find(cat => cat.id === article.category_id)?.name || 'Sem categoria'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.read_time} min
                          </div>
                          {article.source_name && (
                            <div className="flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              {article.source_name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedArticle(article)}>
                              <Eye className="h-4 w-4" />
                              Visualizar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>{selectedArticle?.title}</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh]">
                              <div className="space-y-4">
                                {selectedArticle?.featured_image && (
                                  <img 
                                    src={selectedArticle.featured_image} 
                                    alt={selectedArticle.title}
                                    className="w-full h-48 object-cover rounded-lg"
                                  />
                                )}
                                <div className="prose max-w-none">
                                  <div dangerouslySetInnerHTML={{ __html: selectedArticle?.content || '' }} />
                                </div>
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>

                        {article.status === 'pending' && (
                          <>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-green-600">
                                  <Check className="h-4 w-4" />
                                  Aprovar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Aprovar notícia</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja aprovar e publicar esta notícia? Ela ficará visível no site imediatamente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleApprove(article.id, article.title)}
                                    disabled={approveMutation.isPending}
                                  >
                                    Aprovar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600">
                                  <X className="h-4 w-4" />
                                  Rejeitar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Rejeitar notícia</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja rejeitar esta notícia? Ela não será publicada no site.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleReject(article.id, article.title)}
                                    disabled={rejectMutation.isPending}
                                  >
                                    Rejeitar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir notícia</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir esta notícia da fila? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(article.id, article.title)}
                                disabled={deleteMutation.isPending}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
}