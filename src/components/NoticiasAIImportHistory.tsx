import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink, Check, X, Edit, RefreshCw, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNoticiasAIImports, detectNewsSource } from "@/hooks/useNoticiasAIImports";

const NoticiasAIImportHistory = () => {
  const { data: imports, isLoading, refetch, isRefetching } = useNoticiasAIImports(50);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!imports || imports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhuma importação registrada ainda.</p>
        <p className="text-sm mt-1">As notícias importadas aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {imports.length} importação(ões) recente(s)
        </p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefetching ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Fonte</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {imports.map((item) => {
              const source = item.source_url ? detectNewsSource(item.source_url) : null;
              
              return (
                <TableRow key={item.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(item.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="truncate font-medium text-sm" title={item.article_title}>
                      {item.article_title}
                    </p>
                    {item.format_corrected && (
                      <Badge variant="outline" className="text-xs mt-1 border-amber-500 text-amber-600">
                        Auto-corrigido
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {source ? (
                      <Badge className={`${source.color} text-white text-xs`}>
                        {source.badge}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {item.import_type === 'batch' ? 'Lote' : 
                       item.import_type === 'json' ? 'JSON' : 'URL'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.status === 'success' ? (
                      <Badge variant="outline" className="text-green-600 border-green-500">
                        <Check className="h-3 w-3 mr-1" />
                        OK
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <X className="h-3 w-3 mr-1" />
                        Erro
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {item.article_id && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/articles/edit/${item.article_id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {item.source_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={item.source_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default NoticiasAIImportHistory;
