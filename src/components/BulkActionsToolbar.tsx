import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Square, Trash2, Eye, Edit } from "lucide-react";
import { useBulkUpdateStatus, useBulkDelete } from "@/hooks/useBulkArticleOperations";

interface BulkActionsToolbarProps {
  selectedArticles: string[];
  allArticleIds: string[];
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onClearSelection: () => void;
  selectedArticlesTitles: string[];
}

const BulkActionsToolbar = ({
  selectedArticles,
  allArticleIds,
  isAllSelected,
  onSelectAll,
  onClearSelection,
  selectedArticlesTitles,
}: BulkActionsToolbarProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const bulkUpdateStatus = useBulkUpdateStatus();
  const bulkDelete = useBulkDelete();

  const handlePublish = () => {
    bulkUpdateStatus.mutate({
      articleIds: selectedArticles,
      status: 'published',
      publishedAt: new Date().toISOString(),
    });
    onClearSelection();
  };

  const handleMoveToDraft = () => {
    bulkUpdateStatus.mutate({
      articleIds: selectedArticles,
      status: 'draft',
      publishedAt: null,
    });
    onClearSelection();
  };

  const handleDelete = () => {
    bulkDelete.mutate(selectedArticles);
    onClearSelection();
    setShowDeleteDialog(false);
  };

  if (selectedArticles.length === 0) {
    return null;
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={onSelectAll}
            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
          />
          <div className="flex items-center gap-2">
            {isAllSelected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium">
              {isAllSelected ? "Todos selecionados" : `${selectedArticles.length} selecionados`}
            </span>
            <Badge variant="secondary" className="ml-1">
              {selectedArticles.length}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePublish}
            disabled={bulkUpdateStatus.isPending}
            className="text-green-700 border-green-200 hover:bg-green-50"
          >
            <Eye className="h-4 w-4 mr-1" />
            {bulkUpdateStatus.isPending ? "Publicando..." : "Publicar"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMoveToDraft}
            disabled={bulkUpdateStatus.isPending}
            className="text-orange-700 border-orange-200 hover:bg-orange-50"
          >
            <Edit className="h-4 w-4 mr-1" />
            {bulkUpdateStatus.isPending ? "Movendo..." : "Rascunho"}
          </Button>

          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/20 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão em lote</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div>
                    <p className="mb-3">
                      Tem certeza que deseja excluir {selectedArticles.length} notícias?
                      Esta ação não pode ser desfeita.
                    </p>
                    <div className="max-h-32 overflow-y-auto bg-muted/30 p-3 rounded">
                      <p className="text-sm font-medium mb-2">Notícias selecionadas:</p>
                      <ul className="text-sm space-y-1">
                        {selectedArticlesTitles.map((title, index) => (
                          <li key={index} className="truncate">• {title}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={bulkDelete.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {bulkDelete.isPending ? "Excluindo..." : "Excluir tudo"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-muted-foreground"
          >
            Desselecionar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;