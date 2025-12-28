import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  useNoticiasAISources, 
  useCreateNoticiasAISource, 
  useUpdateNoticiasAISource,
  useDeleteNoticiasAISource,
  NoticiasAISource
} from "@/hooks/useNoticiasAISources";
import { Plus, Edit2, Trash2, Globe, Shield, Loader2 } from "lucide-react";

interface SourceFormData {
  name: string;
  domain_pattern: string;
  badge: string;
  badge_color: string;
  parsing_instructions: string;
}

const defaultFormData: SourceFormData = {
  name: '',
  domain_pattern: '',
  badge: '',
  badge_color: '#3B82F6',
  parsing_instructions: '',
};

const NoticiasAISourcesManager = () => {
  const { data: sources, isLoading, refetch } = useNoticiasAISources();
  const createSource = useCreateNoticiasAISource();
  const updateSource = useUpdateNoticiasAISource();
  const deleteSource = useDeleteNoticiasAISource();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<NoticiasAISource | null>(null);
  const [formData, setFormData] = useState<SourceFormData>(defaultFormData);

  const handleOpenCreate = () => {
    setFormData(defaultFormData);
    setEditingSource(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (source: NoticiasAISource) => {
    setFormData({
      name: source.name,
      domain_pattern: source.domain_pattern,
      badge: source.badge,
      badge_color: source.badge_color,
      parsing_instructions: source.parsing_instructions || '',
    });
    setEditingSource(source);
    setIsCreateOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.domain_pattern || !formData.badge) return;

    if (editingSource) {
      await updateSource.mutateAsync({
        id: editingSource.id,
        ...formData,
      });
    } else {
      await createSource.mutateAsync(formData);
    }

    setIsCreateOpen(false);
    setFormData(defaultFormData);
    setEditingSource(null);
    refetch();
  };

  const handleToggleActive = async (source: NoticiasAISource) => {
    await updateSource.mutateAsync({
      id: source.id,
      is_active: !source.is_active,
    });
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteSource.mutateAsync(id);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  const systemSources = sources?.filter(s => s.is_system) || [];
  const customSources = sources?.filter(s => !s.is_system) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Fontes de Notícias</h3>
          <p className="text-sm text-muted-foreground">
            Configure templates de parsing para cada fonte
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Fonte
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSource ? 'Editar Fonte' : 'Nova Fonte de Notícias'}
              </DialogTitle>
              <DialogDescription>
                Configure o template de parsing para esta fonte
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Fonte</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Portal Terra"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badge">Badge (sigla)</Label>
                  <Input
                    id="badge"
                    placeholder="Ex: TRR"
                    maxLength={4}
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Padrão de Domínio</Label>
                  <Input
                    id="domain"
                    placeholder="Ex: terra.com.br"
                    value={formData.domain_pattern}
                    onChange={(e) => setFormData({ ...formData, domain_pattern: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Cor do Badge</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      className="w-12 h-10 p-1 cursor-pointer"
                      value={formData.badge_color}
                      onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                    />
                    <Input
                      value={formData.badge_color}
                      onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instruções de Parsing (opcional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Instruções específicas para a IA ao processar notícias desta fonte..."
                  rows={4}
                  value={formData.parsing_instructions}
                  onChange={(e) => setFormData({ ...formData, parsing_instructions: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Ex: "Adaptar tom sensacionalista para neutro. Preservar citações originais."
                </p>
              </div>

              {/* Preview */}
              {formData.badge && (
                <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Preview:</span>
                  <Badge style={{ backgroundColor: formData.badge_color }} className="text-white">
                    {formData.badge}
                  </Badge>
                  <span className="text-sm font-medium">{formData.name || 'Nome da fonte'}</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!formData.name || !formData.domain_pattern || !formData.badge || createSource.isPending || updateSource.isPending}
              >
                {(createSource.isPending || updateSource.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingSource ? 'Salvar' : 'Criar Fonte'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* System Sources */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Fontes do Sistema ({systemSources.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-2">
              {systemSources.map((source) => (
                <div 
                  key={source.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    source.is_active ? 'bg-muted/30' : 'bg-muted/10 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge 
                      style={{ backgroundColor: source.badge_color }}
                      className="text-white min-w-[40px] justify-center"
                    >
                      {source.badge}
                    </Badge>
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-xs text-muted-foreground">{source.domain_pattern}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">Sistema</Badge>
                    <Switch
                      checked={source.is_active}
                      onCheckedChange={() => handleToggleActive(source)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Custom Sources */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-green-500" />
            Fontes Customizadas ({customSources.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customSources.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma fonte customizada</p>
              <p className="text-sm">Clique em "Nova Fonte" para adicionar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customSources.map((source) => (
                <div 
                  key={source.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    source.is_active ? 'bg-muted/30' : 'bg-muted/10 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge 
                      style={{ backgroundColor: source.badge_color }}
                      className="text-white min-w-[40px] justify-center"
                    >
                      {source.badge}
                    </Badge>
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <p className="text-xs text-muted-foreground">{source.domain_pattern}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={source.is_active}
                      onCheckedChange={() => handleToggleActive(source)}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenEdit(source)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover fonte?</AlertDialogTitle>
                          <AlertDialogDescription>
                            A fonte "{source.name}" será removida permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(source.id)}>
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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

export default NoticiasAISourcesManager;
