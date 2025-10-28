import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRSSFeeds, useDeleteRSSFeed } from "@/hooks/useRSSFeeds";
import { useRSSImport } from "@/hooks/useRSSImport";
import { useImportLogs } from "@/hooks/useImportLogs";
import RSSFeedFormWithSidebar from "./RSSFeedFormWithSidebar";
import { Plus, Play, Trash2, AlertCircle, CheckCircle2, Clock, Rss } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const RSSImportManager = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<any>(null);

  const { data: feeds, isLoading } = useRSSFeeds();
  const { data: logs } = useImportLogs();
  const deleteMutation = useDeleteRSSFeed();
  const importMutation = useRSSImport();

  const handleEdit = (feed: any) => {
    setSelectedFeed(feed);
    setShowForm(true);
  };

  const handleNew = () => {
    setSelectedFeed(null);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedFeed(null);
  };

  const handleDelete = async (feedId: string) => {
    await deleteMutation.mutateAsync(feedId);
  };

  const handleImport = async (feedId: string) => {
    await importMutation.mutateAsync(feedId);
  };

  const getStatusBadge = (active: boolean) => {
    if (active) {
      return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
    }
    return <Badge variant="secondary">Inativo</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Importação RSS</h1>
          <p className="text-muted-foreground">
            Configure e importe notícias de feeds RSS
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Feed RSS
        </Button>
      </div>

      {/* Feeds List */}
      <Card>
        <CardHeader>
          <CardTitle>Feeds Configurados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : !feeds || feeds.length === 0 ? (
            <div className="text-center py-12">
              <Rss className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum feed configurado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione seu primeiro feed RSS para começar a importar notícias.
              </p>
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Feed
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {feeds.map((feed) => (
                <div key={feed.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{feed.name}</h3>
                        {getStatusBadge(feed.active)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{feed.url}</p>
                      
                      {feed.last_fetched && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            Última importação {formatDistanceToNow(new Date(feed.last_fetched), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleImport(feed.id)}
                        disabled={importMutation.isPending || !feed.active}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(feed)}>
                        Editar
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
                              Tem certeza que deseja excluir o feed "{feed.name}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(feed.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
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

      {/* Recent Import Logs */}
      {logs && logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Importações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {log.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium">{log.rss_feeds?.name || 'Feed desconhecido'}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.articles_imported || 0} notícias importadas
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(log.started_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>
              {selectedFeed ? 'Editar Feed RSS' : 'Novo Feed RSS'}
            </DialogTitle>
          </DialogHeader>
          <RSSFeedFormWithSidebar
            feed={selectedFeed}
            onSuccess={handleClose}
            onCancel={handleClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RSSImportManager;