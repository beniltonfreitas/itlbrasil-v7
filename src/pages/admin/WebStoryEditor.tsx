import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  useWebStory,
  useCreateWebStory,
  useUpdateWebStory,
  useWebStoryPages,
  useCreateWebStoryPage,
  useUpdateWebStoryPage,
  useDeleteWebStoryPage,
} from "@/hooks/useWebStories";
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save, Eye, GripVertical, Image as ImageIcon, Type } from "lucide-react";
import { EnhancedImageUpload } from "@/components/ui/enhanced-image-upload";

interface PageData {
  id?: string;
  page_number: number;
  content_type: 'text' | 'image';
  content_data: {
    text?: string;
    image_url?: string;
    caption?: string;
  };
  background_color: string;
  text_color: string;
  isNew?: boolean;
}

const WebStoryEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSecureAuth();
  const isEditing = !!id;

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Queries and mutations
  const { data: webstory, isLoading } = useWebStory(id);
  const { data: existingPages } = useWebStoryPages(id);
  const createMutation = useCreateWebStory();
  const updateMutation = useUpdateWebStory();
  const createPageMutation = useCreateWebStoryPage();
  const updatePageMutation = useUpdateWebStoryPage();
  const deletePageMutation = useDeleteWebStoryPage();

  // Load existing data
  useEffect(() => {
    if (webstory) {
      setTitle(webstory.title || "");
      setSlug(webstory.slug || "");
      setCoverImage(webstory.cover_image || "");
      setMetaDescription(webstory.meta_description || "");
      setIsPublished(webstory.status === 'published');
    }
  }, [webstory]);

  useEffect(() => {
    if (existingPages && existingPages.length > 0) {
      setPages(existingPages.map((p: any) => ({
        id: p.id,
        page_number: p.page_number,
        content_type: p.content_type || 'text',
        content_data: p.content_data || {},
        background_color: p.background_color || '#ffffff',
        text_color: p.text_color || '#1a1a1a',
      })));
    }
  }, [existingPages]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && title) {
      const generatedSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(generatedSlug);
    }
  }, [title, isEditing]);

  const handleAddPage = (type: 'text' | 'image') => {
    const newPage: PageData = {
      page_number: pages.length + 1,
      content_type: type,
      content_data: type === 'text' ? { text: '' } : { image_url: '', caption: '' },
      background_color: '#ffffff',
      text_color: '#1a1a1a',
      isNew: true,
    };
    setPages([...pages, newPage]);
  };

  const handleRemovePage = (index: number) => {
    const page = pages[index];
    if (page.id) {
      // Mark for deletion on save
      deletePageMutation.mutate({ id: page.id, webstory_id: id! });
    }
    const newPages = pages.filter((_, i) => i !== index);
    // Renumber pages
    setPages(newPages.map((p, i) => ({ ...p, page_number: i + 1 })));
  };

  const handleUpdatePage = (index: number, updates: Partial<PageData>) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], ...updates };
    setPages(newPages);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("O título é obrigatório");
      return;
    }

    if (!slug.trim()) {
      toast.error("O slug é obrigatório");
      return;
    }

    setIsSaving(true);

    try {
      let webstoryId = id;

      if (isEditing) {
        // Update existing webstory
        await updateMutation.mutateAsync({
          id,
          title,
          slug,
          cover_image: coverImage,
          meta_description: metaDescription,
          status: isPublished ? 'published' : 'draft',
        });
      } else {
        // Create new webstory
        const result = await createMutation.mutateAsync({
          title,
          slug,
          cover_image: coverImage,
          meta_description: metaDescription,
          status: isPublished ? 'published' : 'draft',
          author_id: user?.id || '04ff5b92-dde9-427b-9371-e3b2813bcab5',
        });
        webstoryId = result.id;
      }

      // Save pages
      for (const page of pages) {
        if (page.isNew) {
          await createPageMutation.mutateAsync({
            webstory_id: webstoryId!,
            page_number: page.page_number,
            content_type: page.content_type,
            content_data: page.content_data,
            background_color: page.background_color,
            text_color: page.text_color,
            font_family: 'Inter',
          });
        } else if (page.id) {
          await updatePageMutation.mutateAsync({
            id: page.id,
            webstory_id: webstoryId!,
            content_type: page.content_type,
            content_data: page.content_data,
            background_color: page.background_color,
            text_color: page.text_color,
          });
        }
      }

      toast.success(isEditing ? "WebStory atualizada!" : "WebStory criada!");
      navigate("/admin/webstories");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar WebStory");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/webstories")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? "Editar WebStory" : "Nova WebStory"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isEditing ? "Atualize os dados da WebStory" : "Crie uma nova WebStory"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <Label htmlFor="published">
              {isPublished ? (
                <Badge className="bg-green-100 text-green-800">Publicado</Badge>
              ) : (
                <Badge variant="secondary">Rascunho</Badge>
              )}
            </Label>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da WebStory"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="slug-da-webstory"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Descrição (SEO)</Label>
                <Textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Descrição para mecanismos de busca"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Páginas ({pages.length})</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleAddPage('text')}>
                    <Type className="h-4 w-4 mr-2" />
                    Texto
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleAddPage('image')}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Imagem
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {pages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma página adicionada ainda.</p>
                  <p className="text-sm">Clique nos botões acima para adicionar páginas.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pages.map((page, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">Página {page.page_number}</Badge>
                          <Badge variant="secondary">
                            {page.content_type === 'text' ? 'Texto' : 'Imagem'}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemovePage(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {page.content_type === 'text' ? (
                        <Textarea
                          value={page.content_data.text || ''}
                          onChange={(e) => handleUpdatePage(index, {
                            content_data: { ...page.content_data, text: e.target.value }
                          })}
                          placeholder="Conteúdo da página..."
                          rows={4}
                        />
                      ) : (
                        <div className="space-y-3">
                          <EnhancedImageUpload
                            value={page.content_data.image_url || ''}
                            onChange={(url) => handleUpdatePage(index, {
                              content_data: { ...page.content_data, image_url: url }
                            })}
                            label="Imagem"
                          />
                          <Input
                            value={page.content_data.caption || ''}
                            onChange={(e) => handleUpdatePage(index, {
                              content_data: { ...page.content_data, caption: e.target.value }
                            })}
                            placeholder="Legenda da imagem..."
                          />
                        </div>
                      )}

                      <div className="flex gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`bg-${index}`} className="text-xs">Fundo:</Label>
                          <input
                            type="color"
                            id={`bg-${index}`}
                            value={page.background_color}
                            onChange={(e) => handleUpdatePage(index, { background_color: e.target.value })}
                            className="w-8 h-8 rounded border cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`text-${index}`} className="text-xs">Texto:</Label>
                          <input
                            type="color"
                            id={`text-${index}`}
                            value={page.text_color}
                            onChange={(e) => handleUpdatePage(index, { text_color: e.target.value })}
                            className="w-8 h-8 rounded border cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle>Imagem de Capa</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedImageUpload
                value={coverImage}
                onChange={setCoverImage}
                label="Capa"
              />
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Pré-visualização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden relative">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <Eye className="h-8 w-8" />
                  </div>
                )}
                {title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white font-semibold text-sm line-clamp-2">{title}</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                {pages.length} página{pages.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WebStoryEditor;
