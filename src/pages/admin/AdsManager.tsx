import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSiteAds, adTypes } from '@/hooks/useSiteAds';
import { ImageUpload } from '@/components/ui/image-upload';

export const AdsManager: React.FC = () => {
  const { ads, loading, addAd, updateAd, deleteAd } = useSiteAds();
  const { toast } = useToast();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ad_type: '' as any,
    image_url: '',
    link_url: '',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.ad_type || !formData.image_url) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingId) {
        await updateAd(editingId, formData);
        toast({
          title: "Sucesso",
          description: "Anúncio atualizado com sucesso"
        });
      } else {
        await addAd(formData);
        toast({
          title: "Sucesso",
          description: "Anúncio criado com sucesso"
        });
      }
      
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar anúncio",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      ad_type: '' as any,
      image_url: '',
      link_url: '',
      is_active: true
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleEdit = (ad: any) => {
    setFormData({
      name: ad.name,
      ad_type: ad.ad_type,
      image_url: ad.image_url,
      link_url: ad.link_url || '',
      is_active: ad.is_active
    });
    setEditingId(ad.id);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este anúncio?')) {
      try {
        await deleteAd(id);
        toast({
          title: "Sucesso",
          description: "Anúncio excluído com sucesso"
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir anúncio",
          variant: "destructive"
        });
      }
    }
  };

  const getDimensionsForType = (type: string) => {
    const adType = adTypes.find(at => at.key === type);
    return adType ? adType.dimensions : '';
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciador de Anúncios</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Anúncio
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Anúncio' : 'Novo Anúncio'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Anúncio</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome identificador do anúncio"
                  required
                />
              </div>

              <div>
                <Label htmlFor="ad_type">Tipo de Anúncio</Label>
                <Select
                  value={formData.ad_type}
                  onValueChange={(value) => setFormData({ ...formData, ad_type: value as any })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de anúncio" />
                  </SelectTrigger>
                  <SelectContent>
                    {adTypes.map(type => (
                      <SelectItem key={type.key} value={type.key}>
                        {type.label} ({type.dimensions})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ImageUpload
                label="Imagem do Anúncio"
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                placeholder={`Dimensões recomendadas: ${getDimensionsForType(formData.ad_type)}`}
              />

              <div>
                <Label htmlFor="link_url">Link (opcional)</Label>
                <Input
                  id="link_url"
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  placeholder="https://exemplo.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Anúncio Ativo</Label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">
                  {editingId ? 'Atualizar' : 'Criar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map(ad => (
          <Card key={ad.id}>
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                <span>{ad.name}</span>
                <div className="flex space-x-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(ad)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(ad.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                {ad.image_url ? (
                  <img
                    src={ad.image_url}
                    alt={ad.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Sem imagem
                  </div>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Tipo:</strong> {adTypes.find(t => t.key === ad.ad_type)?.label}</p>
                <p><strong>Dimensões:</strong> {getDimensionsForType(ad.ad_type)}</p>
                <p><strong>Status:</strong> {ad.is_active ? 'Ativo' : 'Inativo'}</p>
                {ad.link_url && (
                  <p><strong>Link:</strong> 
                    <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                      Ver link
                    </a>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ads.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Nenhum anúncio criado ainda.</p>
            <Button className="mt-4" onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Anúncio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};