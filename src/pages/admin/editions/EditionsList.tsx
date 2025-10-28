import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEditions } from '@/hooks/useEditions';
import { useDeleteEdition, usePublishEdition } from '@/hooks/useEditionMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Search, MoreVertical, Eye, Edit, Trash, CheckCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EditionsList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: editions, isLoading } = useEditions({ status: statusFilter, search });
  const deleteMutation = useDeleteEdition();
  const publishMutation = usePublishEdition();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Edições</h1>
          <p className="text-muted-foreground">Gerencie suas edições de jornal</p>
        </div>
        <Button asChild>
          <Link to="/admin/tools/jornal/nova">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Edição
          </Link>
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou número da edição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-4 h-10"
          >
            <option value="">Todos os status</option>
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
            <option value="arquivado">Arquivado</option>
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : editions && editions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Edição</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Data Publicação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Métricas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editions.map((edition) => (
                <TableRow key={edition.id}>
                  <TableCell className="font-medium">{edition.numero_edicao}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{edition.titulo}</div>
                      {edition.subtitulo && (
                        <div className="text-sm text-muted-foreground">{edition.subtitulo}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(edition.data_publicacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        edition.status === 'publicado' ? 'default' :
                        edition.status === 'rascunho' ? 'secondary' : 'outline'
                      }
                    >
                      {edition.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>👁️ {edition.visualizacoes} visualizações</div>
                      <div>📄 {edition.downloads_pdf} PDFs</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/jornal/edicao/${edition.slug}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/tools/jornal/${edition.id}/editar`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/tools/jornal/preview/${edition.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Prévia
                          </Link>
                        </DropdownMenuItem>
                        {edition.status !== 'publicado' && (
                          <DropdownMenuItem
                            onClick={() => publishMutation.mutate(edition.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Publicar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir esta edição?')) {
                              deleteMutation.mutate(edition.id);
                            }
                          }}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhuma edição encontrada</p>
            <Button asChild>
              <Link to="/admin/tools/jornal/nova">
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Primeira Edição
              </Link>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
