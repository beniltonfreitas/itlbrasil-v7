import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useSiteBanners } from '@/hooks/useSiteBanners';
import { ImageUpload } from '@/components/ui/image-upload';

export const ImageManager: React.FC = () => {
  const { settings, updateSetting, loading: settingsLoading } = useSiteSettings();
  const { banners, loading: bannersLoading, addBanner, updateBanner, deleteBanner } = useSiteBanners();
  const { toast } = useToast();

  const [newBanner, setNewBanner] = useState({
    title: '',
    image_url: '',
    link_url: '',
    order_index: banners.length
  });

  const handleSettingUpdate = async (key: string, value: string) => {
    try {
      await updateSetting(key, value);
      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração",
        variant: "destructive"
      });
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.image_url) {
      toast({
        title: "Erro",
        description: "Selecione uma imagem para o banner",
        variant: "destructive"
      });
      return;
    }

    try {
      await addBanner({
        ...newBanner,
        is_active: true
      });
      setNewBanner({
        title: '',
        image_url: '',
        link_url: '',
        order_index: banners.length + 1
      });
      toast({
        title: "Sucesso",
        description: "Banner adicionado com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Erro ao adicionar banner",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este banner?')) {
      try {
        await deleteBanner(id);
        toast({
          title: "Sucesso",
          description: "Banner excluído com sucesso"
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir banner",
          variant: "destructive"
        });
      }
    }
  };

  if (settingsLoading || bannersLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gerenciador de Imagens</h1>

      <Tabs defaultValue="site-settings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="site-settings">Configurações do Site</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
        </TabsList>

        <TabsContent value="site-settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logotipos e Favicon</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Logotipo Principal (300x125px)</Label>
                  <ImageUpload
                    value={settings.logo_url || ''}
                    onChange={(url) => handleSettingUpdate('logo_url', url)}
                    placeholder="Logotipo principal do site"
                  />
                  {settings.logo_url && (
                    <div className="w-[300px] h-[125px] border rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={settings.logo_url} 
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>Logotipo da Página de Login (300x125px)</Label>
                  <ImageUpload
                    value={settings.login_logo_url || ''}
                    onChange={(url) => handleSettingUpdate('login_logo_url', url)}
                    placeholder="Logo para a página de login"
                  />
                  {settings.login_logo_url && (
                    <div className="w-[300px] h-[125px] border rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={settings.login_logo_url} 
                        alt="Login Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4 md:col-span-2">
                  <Label>Favicon</Label>
                  <ImageUpload
                    value={settings.favicon_url || ''}
                    onChange={(url) => handleSettingUpdate('favicon_url', url)}
                    placeholder="Favicon do site (PNG/JPG)"
                  />
                  {settings.favicon_url && (
                    <div className="w-16 h-16 border rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={settings.favicon_url} 
                        alt="Favicon"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Banner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="banner-title">Título do Banner (opcional)</Label>
                  <Input
                    id="banner-title"
                    value={newBanner.title}
                    onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                    placeholder="Título do banner"
                  />
                </div>
                <div>
                  <Label htmlFor="banner-link">Link (opcional)</Label>
                  <Input
                    id="banner-link"
                    type="url"
                    value={newBanner.link_url}
                    onChange={(e) => setNewBanner({ ...newBanner, link_url: e.target.value })}
                    placeholder="https://exemplo.com"
                  />
                </div>
              </div>

              <ImageUpload
                label="Imagem do Banner"
                value={newBanner.image_url}
                onChange={(url) => setNewBanner({ ...newBanner, image_url: url })}
                placeholder="Dimensões recomendadas: 1600x300px"
              />

              <Button onClick={handleAddBanner}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Banner
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Banners Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              {banners.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum banner criado ainda.
                </p>
              ) : (
                <div className="space-y-4">
                  {banners.map((banner, index) => (
                    <div key={banner.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{banner.title || `Banner ${index + 1}`}</h4>
                          {banner.link_url && (
                            <a 
                              href={banner.link_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              {banner.link_url}
                            </a>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBanner(banner.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                      <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={banner.image_url}
                          alt={banner.title || 'Banner'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};