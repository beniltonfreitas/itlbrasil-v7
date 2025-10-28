import { useState } from 'react';
import { useAdsLibrary, useCreateAd, useUpdateAd, useDeleteAd } from '@/hooks/useAdsLibrary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash, Image as ImageIcon } from 'lucide-react';

export default function AdsLibraryManager() {
  const [open, setOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [tipoFilter, setTipoFilter] = useState<string>('');

  const { data: ads, isLoading } = useAdsLibrary({ tipo: tipoFilter || undefined });
  const createMutation = useCreateAd();
  const updateMutation = useUpdateAd();
  const deleteMutation = useDeleteAd();

  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'banner',
    img_url: '',
    alt_text: '',
    anunciante: '',
    destino_url: '',
    prioridade: 0,
    ativo: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAd) {
      await updateMutation.mutateAsync({
        id: editingAd.id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'banner',
      img_url: '',
      alt_text: '',
      anunciante: '',
      destino_url: '',
      prioridade: 0,
      ativo: true,
    });
    setEditingAd(null);
  };

  const handleEdit = (ad: any) => {
    setEditingAd(ad);
    setFormData({
      nome: ad.nome,
      tipo: ad.tipo,
      img_url: ad.img_url,
      alt_text: ad.alt_text || '',
      anunciante: ad.anunciante || '',
      destino_url: ad.destino_url || '',
      prioridade: ad.prioridade,
      ativo: ad.ativo,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Anúncios</h1>
          <p className="text-muted-foreground">Gerencie os anúncios para suas edições</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Anúncio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAd ? 'Editar Anúncio' : 'Novo Anúncio'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Anúncio</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="banner">Banner</option>
                  <option value="lateral">Lateral</option>
                  <option value="rodape">Rodapé</option>
                  <option value="popup">Popup</option>
                </select>
              </div>
              <div>
                <Label htmlFor="img_url">URL da Imagem</Label>
                <Input
                  id="img_url"
                  value={formData.img_url}
                  onChange={(e) => setFormData({ ...formData, img_url: e.target.value })}
                  required
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="alt_text">Texto Alternativo</Label>
                <Input
                  id="alt_text"
                  value={formData.alt_text}
                  onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="anunciante">Anunciante</Label>
                <Input
                  id="anunciante"
                  value={formData.anunciante}
                  onChange={(e) => setFormData({ ...formData, anunciante: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="destino_url">Link de Destino</Label>
                <Input
                  id="destino_url"
                  value={formData.destino_url}
                  onChange={(e) => setFormData({ ...formData, destino_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="prioridade">Prioridade (0-100)</Label>
                <Input
                  id="prioridade"
                  type="number"
                  value={formData.prioridade}
                  onChange={(e) => setFormData({ ...formData, prioridade: Number(e.target.value) })}
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
                <Label htmlFor="ativo">Ativo</Label>
              </div>
              <Button type="submit" className="w-full">
                {editingAd ? 'Salvar Alterações' : 'Criar Anúncio'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="border rounded-md px-4 h-10"
          >
            <option value="">Todos os tipos</option>
            <option value="banner">Banner</option>
            <option value="lateral">Lateral</option>
            <option value="rodape">Rodapé</option>
            <option value="popup">Popup</option>
          </select>
        </div>

        {isLoading ? (
          <div>Carregando...</div>
        ) : ads && ads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map((ad) => (
              <Card key={ad.id} className="p-4 space-y-3">
                <img
                  src={ad.img_url}
                  alt={ad.alt_text || ad.nome}
                  className="w-full h-32 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{ad.nome}</h3>
                  <p className="text-sm text-muted-foreground">{ad.tipo}</p>
                  {ad.anunciante && (
                    <p className="text-xs text-muted-foreground">Por: {ad.anunciante}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${ad.ativo ? 'text-green-600' : 'text-gray-400'}`}>
                    {ad.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(ad)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Excluir este anúncio?')) {
                          deleteMutation.mutate(ad.id);
                        }
                      }}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum anúncio encontrado
          </div>
        )}
      </Card>
    </div>
  );
}
