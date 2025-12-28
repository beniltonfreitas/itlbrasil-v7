import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Eye, 
  Download, 
  RotateCcw, 
  Trash2, 
  FileJson,
  Loader2,
  Calendar,
  Hash
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface JsonHistoryItem {
  id: string;
  user_id: string;
  name?: string;
  news_url?: string;
  image_url?: string;
  generated_json: any;
  articles_count?: number;
  status: string;
  error_message?: string;
  source_tool: string;
  feed_ids?: string[];
  created_at: string;
}

interface JsonHistoryPanelProps {
  history: JsonHistoryItem[];
  isLoading: boolean;
  onReimport: (json: any) => void;
  onDelete: (id: string) => Promise<boolean>;
  onRefresh: () => void;
}

const JsonHistoryPanel = ({ 
  history, 
  isLoading, 
  onReimport, 
  onDelete,
  onRefresh 
}: JsonHistoryPanelProps) => {
  const [viewingItem, setViewingItem] = useState<JsonHistoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = (item: JsonHistoryItem) => {
    const jsonString = typeof item.generated_json === 'string' 
      ? item.generated_json 
      : JSON.stringify(item.generated_json, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noticias-${format(new Date(item.created_at), 'yyyy-MM-dd-HHmm')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    
    setIsDeleting(true);
    const success = await onDelete(deletingId);
    setIsDeleting(false);
    
    if (success) {
      setDeletingId(null);
    }
  };

  const getArticlesCount = (item: JsonHistoryItem): number => {
    if (item.articles_count) return item.articles_count;
    
    try {
      const json = typeof item.generated_json === 'string' 
        ? JSON.parse(item.generated_json) 
        : item.generated_json;
      return json?.noticias?.length || 0;
    } catch {
      return 0;
    }
  };

  const getSourceLabel = (source: string): string => {
    switch (source) {
      case 'rss-to-json': return 'RSS → JSON';
      case 'reporter-ai': return 'Reporter AI';
      case 'json-generator': return 'Gerador JSON';
      case 'jornalista-pro': return 'Jornalista Pro';
      default: return source;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileJson className="h-16 w-16 mx-auto mb-4 opacity-40" />
        <p className="font-medium">Nenhum histórico encontrado</p>
        <p className="text-sm mt-1">Os JSONs gerados aparecerão aqui</p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border bg-card hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FileJson className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">
                      {item.name || format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                    <Badge 
                      variant={item.status === 'done' ? 'secondary' : item.status === 'error' ? 'destructive' : 'outline'}
                      className="text-xs"
                    >
                      {item.status === 'done' ? 'Concluído' : item.status === 'error' ? 'Erro' : 'Processando'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {getArticlesCount(item)} artigos
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(item.created_at), "dd 'de' MMMM", { locale: ptBR })}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getSourceLabel(item.source_tool)}
                    </Badge>
                  </div>
                  
                  {item.error_message && (
                    <p className="text-xs text-destructive mt-2 truncate">
                      {item.error_message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewingItem(item)}
                    title="Visualizar JSON"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(item)}
                    title="Baixar JSON"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onReimport(item.generated_json)}
                    title="Reimportar JSON"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingId(item.id)}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* View JSON Dialog */}
      <Dialog open={!!viewingItem} onOpenChange={() => setViewingItem(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Visualizar JSON
            </DialogTitle>
            <DialogDescription>
              {viewingItem && format(new Date(viewingItem.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} 
              • {viewingItem && getArticlesCount(viewingItem)} artigos
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] rounded-lg border bg-muted/30 p-4">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {viewingItem && (
                typeof viewingItem.generated_json === 'string'
                  ? viewingItem.generated_json
                  : JSON.stringify(viewingItem.generated_json, null, 2)
              )}
            </pre>
          </ScrollArea>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setViewingItem(null)}>
              Fechar
            </Button>
            {viewingItem && (
              <>
                <Button variant="outline" onClick={() => handleDownload(viewingItem)}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar
                </Button>
                <Button onClick={() => {
                  onReimport(viewingItem.generated_json);
                  setViewingItem(null);
                }}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reimportar
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir do histórico?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O JSON será removido permanentemente do histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default JsonHistoryPanel;
