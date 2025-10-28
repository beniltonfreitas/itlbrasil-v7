import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEdition } from '@/hooks/useEditions';
import { useCreateEdition, useUpdateEdition, useUpdateEditionItems } from '@/hooks/useEditionMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, FileText } from 'lucide-react';
import EditionNewsLibrary from './EditionNewsLibrary';

export default function EditionBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: edition, isLoading } = useEdition(id);
  const createMutation = useCreateEdition();
  const updateMutation = useUpdateEdition();
  const updateItemsMutation = useUpdateEditionItems();

  const [formData, setFormData] = useState({
    titulo: '',
    subtitulo: '',
    numero_edicao: '',
    slug: '',
    data_publicacao: new Date().toISOString().split('T')[0],
    colunas: 2,
    tema_visual: 'claro',
    fonte_base: 'serif',
    tamanho_fonte_base: 16,
    interlinha: 1.5,
    margem: 'media',
    cidade: '',
    uf: '',
  });

  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (edition && !Array.isArray(edition)) {
      setFormData({
        titulo: edition.titulo || '',
        subtitulo: edition.subtitulo || '',
        numero_edicao: edition.numero_edicao || '',
        slug: edition.slug || '',
        data_publicacao: edition.data_publicacao?.split('T')[0] || '',
        colunas: edition.colunas || 2,
        tema_visual: edition.tema_visual || 'claro',
        fonte_base: edition.fonte_base || 'serif',
        tamanho_fonte_base: edition.tamanho_fonte_base || 16,
        interlinha: edition.interlinha || 1.5,
        margem: edition.margem || 'media',
        cidade: edition.cidade || '',
        uf: edition.uf || '',
      });
      if ('items' in edition) {
        setItems(edition.items || []);
      }
    }
  }, [edition]);

  const handleSave = async () => {
    try {
      if (id) {
        await updateMutation.mutateAsync({ id, data: formData });
      } else {
        const newEdition = await createMutation.mutateAsync(formData);
        if (newEdition && 'id' in newEdition) {
          navigate(`/admin/tools/jornal/${newEdition.id}/editar`);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
    }
  };

  const handleAddArticles = async () => {
    if (!id) {
      alert('Salve a edição primeiro antes de adicionar artigos');
      return;
    }

    const newItems = selectedArticles.map((articleId, index) => ({
      tipo: 'artigo',
      ordem: items.length + index,
      referencia_id: articleId,
    }));

    const allItems = [...items, ...newItems];
    setItems(allItems);
    await updateItemsMutation.mutateAsync({ editionId: id, items: allItems });
    setSelectedArticles([]);
  };

  if (isLoading && id) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {id ? 'Editar Edição' : 'Nova Edição'}
          </h1>
          <p className="text-muted-foreground">Configure sua edição de jornal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/tools/jornal')}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </Button>
          {id && (
            <Button variant="secondary" asChild>
              <a href={`/admin/tools/jornal/preview/${id}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Prévia
              </a>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Jornal da Cidade"
                />
              </div>
              <div>
                <Label htmlFor="subtitulo">Subtítulo</Label>
                <Input
                  id="subtitulo"
                  value={formData.subtitulo}
                  onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
                  placeholder="Ex: Edição de Janeiro"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="numero_edicao">Número da Edição</Label>
                <Input
                  id="numero_edicao"
                  value={formData.numero_edicao}
                  onChange={(e) => setFormData({ ...formData, numero_edicao: e.target.value })}
                  placeholder="Ex: #001"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="edicao-001"
                />
              </div>
              <div>
                <Label htmlFor="data_publicacao">Data de Publicação</Label>
                <Input
                  id="data_publicacao"
                  type="date"
                  value={formData.data_publicacao}
                  onChange={(e) => setFormData({ ...formData, data_publicacao: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="São Paulo"
                />
              </div>
              <div>
                <Label htmlFor="uf">UF</Label>
                <Input
                  id="uf"
                  value={formData.uf}
                  onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="conteudo" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Biblioteca de Notícias</h2>
            <EditionNewsLibrary
              selectedArticles={selectedArticles}
              onToggleArticle={(articleId) => {
                setSelectedArticles(prev =>
                  prev.includes(articleId)
                    ? prev.filter(id => id !== articleId)
                    : [...prev, articleId]
                );
              }}
              onAddArticles={handleAddArticles}
            />
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="colunas">Número de Colunas</Label>
                <select
                  id="colunas"
                  value={formData.colunas}
                  onChange={(e) => setFormData({ ...formData, colunas: Number(e.target.value) })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="1">1 coluna</option>
                  <option value="2">2 colunas</option>
                  <option value="3">3 colunas</option>
                </select>
              </div>
              <div>
                <Label htmlFor="tema_visual">Tema Visual</Label>
                <select
                  id="tema_visual"
                  value={formData.tema_visual}
                  onChange={(e) => setFormData({ ...formData, tema_visual: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="claro">Claro</option>
                  <option value="escuro">Escuro</option>
                  <option value="sepia">Sépia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fonte_base">Fonte Base</Label>
                <select
                  id="fonte_base"
                  value={formData.fonte_base}
                  onChange={(e) => setFormData({ ...formData, fonte_base: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="serif">Serif</option>
                  <option value="sans-serif">Sans-serif</option>
                  <option value="mono">Mono</option>
                </select>
              </div>
              <div>
                <Label htmlFor="tamanho_fonte_base">Tamanho da Fonte (px)</Label>
                <Input
                  id="tamanho_fonte_base"
                  type="number"
                  value={formData.tamanho_fonte_base}
                  onChange={(e) => setFormData({ ...formData, tamanho_fonte_base: Number(e.target.value) })}
                  min="12"
                  max="24"
                />
              </div>
              <div>
                <Label htmlFor="margem">Margem</Label>
                <select
                  id="margem"
                  value={formData.margem}
                  onChange={(e) => setFormData({ ...formData, margem: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="pequena">Pequena</option>
                  <option value="media">Média</option>
                  <option value="grande">Grande</option>
                </select>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card className="p-6">
            <p className="text-muted-foreground">
              Configurações de SEO serão implementadas aqui
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {id && items.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Itens da Edição ({items.length})
          </h2>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={item.id || index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4" />
                  <span>Item {index + 1} - {item.tipo}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
