import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSiteBanners } from "@/hooks/useSiteBanners";
import { ImageUpload } from "@/components/ui/image-upload";
import { Trash2, Plus, Loader2, ExternalLink } from "lucide-react";
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

const BannersManager = () => {
  const { toast } = useToast();
  const { banners, loading, addBanner, updateBanner, deleteBanner } = useSiteBanners();
  
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newBanner, setNewBanner] = useState({
    title: "",
    image_url: "",
    link_url: "",
    order_index: 0,
    is_active: true
  });

  const handleAddBanner = async () => {
    if (!newBanner.image_url) {
      toast({
        title: "Erro",
        description: "Por favor, insira a URL da imagem do banner",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(true);
    try {
      await addBanner({
        ...newBanner,
        order_index: banners.length
      });
      
      toast({
        title: "Sucesso",
        description: "Banner adicionado com sucesso"
      });
      
      setNewBanner({
        title: "",
        image_url: "",
        link_url: "",
        order_index: 0,
        is_active: true
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar banner",
        description: error.message || "Verifique se a tabela site_banners existe no banco de dados",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateBanner(id, { is_active: !currentStatus });
      toast({
        title: "Sucesso",
        description: `Banner ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do banner",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBanner(id);
      toast({
        title: "Sucesso",
        description: "Banner removido com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover banner",
        variant: "destructive"
      });
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciador de Banners</h1>
        <p className="text-muted-foreground">
          Gerencie os banners exibidos no site
        </p>
      </div>

      {/* Add New Banner Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Novo Banner
          </CardTitle>
          <CardDescription>
            Preencha os dados do banner a ser exibido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título (opcional)</Label>
              <Input
                id="title"
                placeholder="Título do banner"
                value={newBanner.title}
                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="link_url">URL do Link (opcional)</Label>
              <Input
                id="link_url"
                placeholder="https://exemplo.com"
                value={newBanner.link_url}
                onChange={(e) => setNewBanner({ ...newBanner, link_url: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <ImageUpload
              label="Imagem do Banner *"
              placeholder="Cole a URL ou faça upload da imagem"
              value={newBanner.image_url}
              onChange={(url) => setNewBanner({ ...newBanner, image_url: url })}
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: 1200x300px (proporção 4:1) • Máximo: 5MB
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={newBanner.is_active}
              onCheckedChange={(checked) => setNewBanner({ ...newBanner, is_active: checked })}
            />
            <Label htmlFor="is_active">Banner ativo</Label>
          </div>

          <Button 
            onClick={handleAddBanner} 
            disabled={isAdding}
            className="w-full md:w-auto"
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adicionando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Banner
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Banners List */}
      <Card>
        <CardHeader>
          <CardTitle>Banners Cadastrados</CardTitle>
          <CardDescription>
            {banners.length} banner(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum banner cadastrado
            </div>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg"
                >
                  <div className="w-full md:w-48 h-32 flex-shrink-0">
                    <img
                      src={banner.image_url}
                      alt={banner.title || "Banner"}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/400x100?text=Imagem+Indisponível";
                      }}
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-semibold">
                        {banner.title || "Sem título"}
                      </h3>
                      {banner.link_url && (
                        <a
                          href={banner.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          {banner.link_url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={banner.is_active}
                          onCheckedChange={() => handleToggleActive(banner.id, banner.is_active)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {banner.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(banner.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este banner? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BannersManager;
