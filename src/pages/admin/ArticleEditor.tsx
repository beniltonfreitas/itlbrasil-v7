import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import SafeHTML from "@/components/SafeHTML";
import { calculateReadTime } from "@/lib/textUtils";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useArticle, useArticleById, ImageData } from "@/hooks/useArticles";
import { useCategories } from "@/hooks/useCategories";
import { useCreateArticle, useUpdateArticle } from "@/hooks/useArticleMutations";
import { useArticleRewrite } from "@/hooks/useArticleRewrite";
import { ImageGalleryEditor } from "@/components/ImageGalleryEditor";
import { ImageUpload } from "@/components/ui/image-upload";
import { ArrowLeft, Save, Eye, Globe, FileText, Settings, Tag, Image, Wand2, RefreshCw, Link as LinkIcon, MessageSquare, AlertCircle, X, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import { DEFAULT_AUTHOR_ID } from "@/constants/authors";
import { 
  FIXED_CATEGORIES, 
  generateSlug, 
  validateSlug, 
  ensureWhatsAppCTA, 
  hasWhatsAppCTA, 
  normalizeContent,
  validateImageUrl,
  isHttpsImageUrl,
  normalizeImageInput,
  countCharacters,
  countWords,
  generateMetaTitle,
  generateMetaDescription,
  parseTags,
  generateMissingTags,
  validateTags,
  type ArticleImageObject
} from "@/lib/newsUtils";
import { uploadImageToStorage } from "@/lib/imageUpload";

// Image object schema
const imageObjectSchema = z.object({
  hero: z.string().url().refine(u => u.startsWith("https://"), "Hero deve usar HTTPS"),
  og: z.string().url().refine(u => u.startsWith("https://"), "OG deve usar HTTPS"),
  card: z.string().url().refine(u => u.startsWith("https://"), "Card deve usar HTTPS"),
  alt: z.string().min(5, "Alt deve ter pelo menos 5 caracteres").max(140, "Alt deve ter no máximo 140 caracteres")
});

const articleSchema = z.object({
  title: z.string()
    .min(6, "Título deve ter pelo menos 6 caracteres")
    .max(120, "Título deve ter no máximo 120 caracteres"),
  slug: z.string()
    .min(6, "Slug deve ter pelo menos 6 caracteres")
    .max(120, "Slug deve ter no máximo 120 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hífens (sem duplos hífens)"),
  excerpt: z.string()
    .max(160, "Resumo deve ter no máximo 160 caracteres")
    .optional(),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  category_id: z.string().min(1, "Categoria é obrigatória"),
  imagem: z.union([
    z.string().url("Imagem deve ser uma URL válida"),
    imageObjectSchema
  ])
  .transform(input => normalizeImageInput(input))
  .refine(img => img.hero && isHttpsImageUrl(img.hero), "Imagem hero deve usar HTTPS e formato válido"),
  image_credit: z.string().optional(),
  source_url: z.string().url("URL da fonte deve ser válida").optional().or(z.literal("")),
  meta_title: z.string().max(60, "Meta título deve ter no máximo 60 caracteres").optional(),
  meta_description: z.string().max(160, "Meta descrição deve ter no máximo 160 caracteres").optional(),
  meta_keywords: z.string().optional(),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("published"),
  tags: z.union([
    z.string().transform((val) => parseTags(val)),
    z.array(z.string())
  ])
  .transform(arr => {
    const parsed = Array.isArray(arr) ? arr : parseTags(arr);
    return parsed.slice(0, 12);
  })
  .refine((arr) => arr.length === 12, "Exatamente 12 tags são obrigatórias")
  .default([]),
  additional_images: z.array(z.object({
    id: z.string(),
    url: z.string().url("URL inválida"),
    caption: z.string().optional(),
    credit: z.string().optional(),
    position: z.number()
  })).default([]),
});

type ArticleFormData = z.infer<typeof articleSchema>;

const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useSecureAuth();
  const [isPreview, setIsPreview] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  
  // File input refs for image uploads
  const heroInputRef = useRef<HTMLInputElement>(null);
  const ogInputRef = useRef<HTMLInputElement>(null);
  const cardInputRef = useRef<HTMLInputElement>(null);
  
  const isEditing = !!id;
  const { data: article, isLoading: loadingArticle } = useArticleById(id || "");
  const { data: categories } = useCategories();
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  const rewriteMutation = useArticleRewrite();

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category_id: "",
      imagem: { hero: "", og: "", card: "", alt: "" },
      image_credit: "",
      source_url: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      featured: false,
      status: "published",
      tags: [],
      additional_images: [],
    },
  });

  // Auto-generate slug button handler
  const handleGenerateSlug = () => {
    const title = form.getValues("title");
    if (title) {
      const newSlug = generateSlug(title);
      form.setValue("slug", newSlug);
      toast({
        title: "Slug gerado",
        description: `Slug atualizado para: ${newSlug}`,
      });
    }
  };

  // Handle image upload for hero/og/card
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'hero' | 'og' | 'card',
    currentValue: { hero: string; og: string; card: string; alt: string },
    onChange: (value: { hero: string; og: string; card: string; alt: string }) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(field);
    try {
      const result = await uploadImageToStorage(file);
      
      if (field === 'hero') {
        // Auto-replicate to og and card if they're empty
        onChange({
          hero: result.url,
          og: currentValue.og || result.url,
          card: currentValue.card || result.url,
          alt: currentValue.alt
        });
      } else {
        onChange({
          ...currentValue,
          [field]: result.url
        });
      }
      
      toast({
        title: "Imagem enviada",
        description: `Imagem ${field.toUpperCase()} atualizada com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(null);
      // Reset file input
      if (field === 'hero' && heroInputRef.current) heroInputRef.current.value = "";
      if (field === 'og' && ogInputRef.current) ogInputRef.current.value = "";
      if (field === 'card' && cardInputRef.current) cardInputRef.current.value = "";
    }
  };

  // Watch title changes to auto-generate slug
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (watchTitle && !isEditing) {
      const slug = generateSlug(watchTitle);
      form.setValue("slug", slug);
    }
  }, [watchTitle, isEditing, form]);

  // Load article data when editing
  useEffect(() => {
    if (article && isEditing) {
        // Normalize image data (backward compatibility with featured_image)
        const imageData = normalizeImageInput(
          (article as any).imagem || article.featured_image || ""
        );
        
        form.reset({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || "",
          content: article.content,
          category_id: article.category?.id || "",
          imagem: imageData,
          image_credit: (article as any).image_credit || "",
          source_url: (article as any).source_url || "",
      meta_title: article.meta_title || "",
      meta_description: article.meta_description || "",
      meta_keywords: Array.isArray(article.meta_keywords) ? article.meta_keywords.join(', ') : '',
      featured: article.featured || false,
          status: article.published_at ? "published" : "draft",
          tags: article.tags || [],
          additional_images: article.additional_images || [],
        });
        // Set tags input for display
        setTagsInput((article.tags || []).join(", "));
    }
  }, [article, isEditing, form]);

  // Handle auto-apply SEO button
  const handleApplySEO = () => {
    const title = form.getValues("title");
    const excerpt = form.getValues("excerpt");
    
    if (title) {
      form.setValue("meta_title", generateMetaTitle(title));
    }
    if (excerpt) {
      form.setValue("meta_description", generateMetaDescription(excerpt));
    }
    
    toast({
      title: "SEO aplicado",
      description: "Meta título e descrição foram gerados automaticamente.",
    });
  };

  // Handle WhatsApp CTA insertion
  const handleInsertCTA = () => {
    const currentContent = form.getValues("content");
    if (!hasWhatsAppCTA(currentContent)) {
      const updatedContent = ensureWhatsAppCTA(currentContent);
      form.setValue("content", updatedContent);
      toast({
        title: "CTA inserido",
        description: "CTA do WhatsApp foi adicionado ao final do conteúdo.",
      });
    } else {
      toast({
        title: "CTA já presente",
        description: "O CTA do WhatsApp já está presente no conteúdo.",
        variant: "default",
      });
    }
  };

  // Handle rewrite with AI
  const handleRewriteWithAI = async () => {
    const sourceUrl = form.getValues("source_url");
    const currentContent = form.getValues("content");
    
    if (!sourceUrl) {
      toast({
        title: "URL da fonte necessária",
        description: "Preencha a URL da fonte para usar a reescrita com IA.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await rewriteMutation.mutateAsync({
        sourceUrl,
        currentContent,
        preserveCharacterCount: true,
      });

      form.setValue("content", result.rewrittenContent);
      
      toast({
        title: "Conteúdo reescrito",
        description: `Original: ${result.originalCharCount} chars | Reescrito: ${result.rewrittenCharCount} chars (${result.percentageChange >= 0 ? '+' : ''}${result.percentageChange.toFixed(1)}%)`,
      });
    } catch (error) {
      toast({
        title: "Erro na reescrita",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  // Helper function to translate technical errors to user-friendly messages
  const getUserFriendlyError = (error: string): string => {
    if (error.includes('foreign key constraint "articles_author_id_fkey"')) {
      return 'Erro: Autor não encontrado. Entre em contato com o administrador do sistema.';
    }
    if (error.includes('foreign key constraint "articles_category_id_fkey"')) {
      return 'Erro: Categoria inválida ou não existe. Selecione uma categoria válida.';
    }
    if (error.includes('duplicate key')) {
      return 'Erro: Já existe uma notícia com este slug. Tente gerar um novo slug.';
    }
    if (error.includes('permissão') || error.includes('permission')) {
      return 'Erro: Você não tem permissão para realizar esta ação. Contate um administrador para atribuir as permissões necessárias ao seu usuário.';
    }
    if (error.includes('role') || error.includes('papel')) {
      return 'Erro: Seu usuário não possui um papel atribuído. Contate um administrador para configurar suas permissões.';
    }
    return error;
  };

  const onSubmit = async (data: ArticleFormData) => {
    try {
      setSubmitError(null); // Clear previous errors
      console.log('Dados do formulário antes de submeter:', data);
      
      // Convert meta_keywords from comma-separated string to array
      const metaKeywordsArray = data.meta_keywords 
        ? data.meta_keywords.split(',').map(k => k.trim()).filter(Boolean)
        : [];

      const articleData = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || undefined,
        content: data.content,
        category_id: data.category_id || undefined,
        author_id: DEFAULT_AUTHOR_ID, // Sempre "Redação ITL Brasil"
        imagem: data.imagem,
        featured_image: data.imagem.hero, // Backward compatibility
        image_credit: data.image_credit || undefined,
        source_url: data.source_url || undefined,
        meta_title: data.meta_title || undefined,
        meta_description: data.meta_description || undefined,
        meta_keywords: metaKeywordsArray,
        featured: data.featured,
        status: data.status,
        tags: data.tags,
        additional_images: data.additional_images as ImageData[],
        published_at: data.status === "published" ? new Date().toISOString() : null,
      };

      console.log('Dados do artigo após processamento:', articleData);

      if (isEditing && id) {
        await updateMutation.mutateAsync({
          id,
          ...articleData,
        });
        toast({
          title: "Notícia atualizada",
          description: "A notícia foi atualizada com sucesso.",
        });
      } else {
        await createMutation.mutateAsync(articleData);
        toast({
          title: "Notícia criada",
          description: "A notícia foi criada com sucesso.",
        });
        navigate("/admin/articles");
      }
    } catch (error) {
      console.error('Erro detalhado ao salvar notícia:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      const friendlyError = getUserFriendlyError(errorMessage);
      setSubmitError(friendlyError); // Save error to state for prominent display
      
      toast({
        title: "Erro ao salvar notícia",
        description: friendlyError,
        variant: "destructive",
      });
    }
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    const parsed = parseTags(value);
    form.setValue("tags", parsed);
  };

  const handleTagsBlur = () => {
    const currentTags = form.getValues("tags");
    if (currentTags.length < 12) {
      const title = form.getValues("title");
      const content = form.getValues("content");
      const completed = generateMissingTags(currentTags, title, content);
      form.setValue("tags", completed);
      setTagsInput(completed.join(", "));
      toast({
        title: "Tags completadas",
        description: `${12 - currentTags.length} tags foram geradas automaticamente.`,
      });
    } else if (currentTags.length > 12) {
      const limited = currentTags.slice(0, 12);
      form.setValue("tags", limited);
      setTagsInput(limited.join(", "));
      toast({
        title: "Tags limitadas",
        description: "Apenas as 12 primeiras tags foram mantidas.",
        variant: "destructive",
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    const filtered = currentTags.filter(tag => tag !== tagToRemove);
    form.setValue("tags", filtered);
    setTagsInput(filtered.join(", "));
  };

  if (loadingArticle && isEditing) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/articles">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? "Editar Notícia" : "Nova Notícia"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Edite as informações da notícia" : "Crie uma nova notícia para o portal"}
            </p>
          </div>
        </div>

        {/* Desktop buttons - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
            disabled={!form.watch("content")}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreview ? "Editar" : "Prévia"}
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? "Atualizar" : "Salvar"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Error Alert - Prominent Display */}
          {submitError && (
            <Alert variant="destructive" className="border-2">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-semibold">Erro ao salvar notícia</AlertTitle>
              <AlertDescription className="flex items-start justify-between gap-4">
                <span className="flex-1">{submitError}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSubmitError(null)}
                  className="h-auto p-1 text-destructive-foreground hover:text-destructive-foreground/80 hover:bg-transparent shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {!isPreview ? (
                <>
                  {/* Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Informações Básicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título * (6-120 caracteres)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Digite o título da notícia..." />
                            </FormControl>
                            <div className="text-xs text-muted-foreground">
                              {field.value?.length || 0}/120 caracteres
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug * (6-120 caracteres)</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} placeholder="slug-da-noticia" />
                              </FormControl>
                              <Button 
                                type="button"
                                variant="outline" 
                                size="sm"
                                onClick={handleGenerateSlug}
                                disabled={!form.watch("title")}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {field.value?.length || 0}/120 | {validateSlug(field.value) ? "✅ Válido" : "❌ Inválido"}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="excerpt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resumo (máx. 160 caracteres)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Breve descrição da notícia (será usada como meta description)..."
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <div className="text-xs text-muted-foreground">
                              {field.value?.length || 0}/160 caracteres
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Category and Source */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Categoria e Fonte</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="category_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories?.filter(cat => FIXED_CATEGORIES.includes(cat.name)).map(category => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="source_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL da Fonte (opcional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://fonte-original.com.br/noticia" />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                              URL da matéria original (usado para reescrita com IA)
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Featured Image */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        Imagens (Hero, OG, Card)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground mb-4">
                        💡 <strong>Modo rápido:</strong> Cole uma URL no Hero e ela será replicada para OG e Card automaticamente.
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="imagem"
                        render={({ field }) => (
                          <>
                            <FormItem>
                              <FormLabel>Hero (1200×675) *</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input 
                                    value={field.value.hero}
                                    onChange={(e) => {
                                      const url = e.target.value;
                                      const newValue = {
                                        hero: url,
                                        og: field.value.og || url,
                                        card: field.value.card || url,
                                        alt: field.value.alt
                                      };
                                      field.onChange(newValue);
                                    }}
                                    placeholder="https://exemplo.com/hero.jpg" 
                                    type="url"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => heroInputRef.current?.click()}
                                    disabled={uploadingImage === 'hero'}
                                    title="Fazer upload de imagem"
                                  >
                                    {uploadingImage === 'hero' ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Upload className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <input
                                ref={heroInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, 'hero', field.value, field.onChange)}
                              />
                              <div className="text-xs text-muted-foreground">
                                {field.value.hero && isHttpsImageUrl(field.value.hero) 
                                  ? "✅ URL válida" 
                                  : field.value.hero 
                                    ? "⚠️ Use HTTPS e formato válido" 
                                    : "Imagem principal (hero)"}
                              </div>
                            </FormItem>

                            <FormItem>
                              <FormLabel>OG/Social (1200×630)</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input 
                                    value={field.value.og}
                                    onChange={(e) => field.onChange({ ...field.value, og: e.target.value })}
                                    placeholder="https://exemplo.com/og.jpg" 
                                    type="url"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => ogInputRef.current?.click()}
                                    disabled={uploadingImage === 'og'}
                                    title="Fazer upload de imagem"
                                  >
                                    {uploadingImage === 'og' ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Upload className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <input
                                ref={ogInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, 'og', field.value, field.onChange)}
                              />
                              <div className="text-xs text-muted-foreground">
                                {field.value.og && isHttpsImageUrl(field.value.og) 
                                  ? "✅ URL válida" 
                                  : "Imagem para compartilhamento social"}
                              </div>
                            </FormItem>

                            <FormItem>
                              <FormLabel>Card (800×450)</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <Input 
                                    value={field.value.card}
                                    onChange={(e) => field.onChange({ ...field.value, card: e.target.value })}
                                    placeholder="https://exemplo.com/card.jpg" 
                                    type="url"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => cardInputRef.current?.click()}
                                    disabled={uploadingImage === 'card'}
                                    title="Fazer upload de imagem"
                                  >
                                    {uploadingImage === 'card' ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Upload className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <input
                                ref={cardInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, 'card', field.value, field.onChange)}
                              />
                              <div className="text-xs text-muted-foreground">
                                {field.value.card && isHttpsImageUrl(field.value.card) 
                                  ? "✅ URL válida" 
                                  : "Imagem para cartões/thumbnails"}
                              </div>
                            </FormItem>

                            <FormItem>
                              <FormLabel>Texto Alternativo (Alt) *</FormLabel>
                              <FormControl>
                                <Input 
                                  value={field.value.alt}
                                  onChange={(e) => field.onChange({ ...field.value, alt: e.target.value })}
                                  placeholder="Descrição da imagem para acessibilidade" 
                                  maxLength={140}
                                />
                              </FormControl>
                              <div className="text-xs text-muted-foreground">
                                {field.value.alt.length}/140 caracteres
                              </div>
                              <FormMessage />
                            </FormItem>
                          </>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="image_credit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Crédito da Imagem</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Nome do fotógrafo / Agência" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Content */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Conteúdo</span>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleInsertCTA}
                            disabled={!form.watch("content")}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            CTA
                          </Button>
                          {form.watch("source_url") && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRewriteWithAI}
                              disabled={rewriteMutation.isPending || !form.watch("source_url")}
                            >
                              {rewriteMutation.isPending ? (
                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Wand2 className="h-4 w-4 mr-1" />
                              )}
                              Reescrever IA
                            </Button>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RichTextEditor
                                value={field.value || ""}
                                onChange={field.onChange}
                                placeholder="Escreva o conteúdo da notícia..."
                                minHeight="400px"
                              />
                            </FormControl>
                            <div className="text-xs text-muted-foreground mt-2">
                              {countWords(field.value || "")} palavras • {countCharacters(field.value || "")} caracteres • 
                              {hasWhatsAppCTA(field.value || "") ? " ✅ CTA presente" : " ❌ CTA ausente"}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Image Gallery */}
                  <FormField
                    control={form.control}
                    name="additional_images"
                    render={({ field }) => (
                      <FormItem>
                        <ImageGalleryEditor
                          images={(field.value || []).filter((img): img is ImageData => 
                            Boolean(img.id && img.url && typeof img.position === 'number')
                          )}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* SEO */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          SEO
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleApplySEO}
                          disabled={!form.watch("title") && !form.watch("excerpt")}
                        >
                          <Wand2 className="h-4 w-4 mr-1" />
                          Aplicar SEO
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="meta_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Título (máx. 60 caracteres)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Título para mecanismos de busca..." />
                            </FormControl>
                            <div className="text-xs text-muted-foreground">
                              {field.value?.length || 0}/60 caracteres
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="meta_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Descrição (máx. 160 caracteres)</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Descrição para mecanismos de busca..."
                                className="min-h-[80px]"
                              />
                            </FormControl>
                            <div className="text-xs text-muted-foreground">
                              {field.value?.length || 0}/160 caracteres
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </>
              ) : (
                /* Preview */
                <Card>
                  <CardHeader>
                    <CardTitle>Prévia do Artigo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <article className="prose prose-sm max-w-none dark:prose-invert">
                      <h1>{form.watch("title") || "Título do artigo"}</h1>
                      {form.watch("excerpt") && (
                        <p className="text-muted-foreground italic border-l-4 border-primary pl-4">
                          {form.watch("excerpt")}
                        </p>
                      )}
                      <SafeHTML 
                        html={form.watch("content") || "<p>Conteúdo do artigo...</p>"} 
                        className="mt-4"
                      />
                    </article>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Rascunho</SelectItem>
                            <SelectItem value="published">Publicado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="featured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Artigo em Destaque</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Exibir este artigo na seção de destaques
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => {
                      const tagCount = field.value?.length || 0;
                      const validation = validateTags(field.value || []);
                      
                      return (
                        <FormItem>
                          <FormLabel>
                            Tags (exatamente 12) - Separe por vírgula ou pipe (|)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              value={tagsInput}
                              onChange={(e) => handleTagsChange(e.target.value)}
                              onBlur={handleTagsBlur}
                              placeholder="Digite 12 tags separadas por vírgula (ex: Gaza, flotilha global, ajuda humanitária, Israel, bloco naval, marinha...)"
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{tagCount}/12 tags</span>
                            <span className={validation.valid ? "text-green-600" : "text-destructive"}>
                              {validation.valid ? "✅ Válido" : `❌ ${validation.error}`}
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  {/* Tag chips preview */}
                  <div className="flex flex-wrap gap-2">
                    {form.watch("tags").map((tag, index) => (
                      <Badge key={`${tag}-${index}`} variant="secondary" className="cursor-pointer">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Floating Action Buttons - Always visible on all screens */}
          <div className="fixed bottom-6 right-6 z-50 flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setIsPreview(!isPreview)}
              disabled={!form.watch("content")}
              className="shadow-lg hover:shadow-xl transition-all"
            >
              <Eye className="h-5 w-5" />
              <span className="hidden md:inline ml-2">Prévia</span>
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="shadow-lg hover:shadow-xl transition-all"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="hidden md:inline ml-2">Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span className="hidden md:inline ml-2">Salvar</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ArticleEditor;