import { useState, useRef, useEffect } from "react";
import { Newspaper, Send, Trash2, Copy, Check, Loader2, Upload, Download, Eye, List, AlertCircle, History, Wand2, BarChart3, Settings, Clock, HelpCircle, BookOpen, Play, Lock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadImageToStorage } from "@/lib/imageUpload";
import { useCreateArticle } from "@/hooks/useArticleMutations";
import { useCategories } from "@/hooks/useCategories";
import { validateFirstParagraphBold, autoFixFirstParagraph } from "@/lib/textUtils";
import ArticlePreviewDialog from "@/components/ArticlePreviewDialog";
import NoticiasAIImportHistory from "@/components/NoticiasAIImportHistory";
import NoticiasAIStatsDashboard from "@/components/NoticiasAIStatsDashboard";
import NoticiasAISourcesManager from "@/components/NoticiasAISourcesManager";
import NoticiasAIScheduleManager from "@/components/NoticiasAIScheduleManager";
import { NoticiasAITutorial } from "@/components/NoticiasAITutorial";
import { NoticiasAITour } from "@/components/NoticiasAITour";
import { ContextualTip } from "@/components/ContextualTip";
import { useNoticiasAITour } from "@/hooks/useNoticiasAITour";
import { useContextualTips } from "@/hooks/useContextualTips";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { AchievementToast } from "@/components/AchievementToast";
import { useCreateNoticiasAIImport, detectNewsSource } from "@/hooks/useNoticiasAIImports";
import type { CallBackProps } from 'react-joyride';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GeneratedContent {
  cadastroManual: {
    titulo: string;
    slug: string;
    resumo: string;
    categoria: string;
    fonte: string;
    imagens: {
      hero: string;
      og: string;
      card: string;
    };
    textoAlternativo: string;
    creditoImagem: string;
    conteudo: string;
    galeriaImagens: string[];
    seo: {
      metaTitulo: string;
      metaDescricao: string;
    };
  } | null;
  json: {
    noticias?: Array<{
      titulo: string;
      slug: string;
      resumo: string;
      categoria: string;
      fonte: string;
      imagem: {
        hero: string;
        alt: string;
        credito: string;
      };
      conteudo: string;
      tags: string[];
      seo: {
        meta_titulo: string;
        meta_descricao: string;
      };
    }>;
  } | null;
}

const NoticiasAI = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent>({
    cadastroManual: null,
    json: null,
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("cadastro");
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  // Auto-correction toggle (enabled by default)
  const [autoCorrectEnabled, setAutoCorrectEnabled] = useState(true);
  
  // Batch mode state
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  
  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Tour and contextual tips
  const { 
    run: tourRun, 
    stepIndex: tourStepIndex, 
    startTour, 
    handleJoyrideCallback,
    tourCompleted 
  } = useNoticiasAITour();
  
  const { 
    activeTip, 
    tipVisible, 
    dismissTip, 
    dismissPermanently,
    showTip 
  } = useContextualTips();

  // Onboarding progress system
  const {
    level,
    levelName,
    totalPoints,
    levelProgress,
    recentAchievement,
    leveledUp,
    completeMilestone,
    isMilestoneCompleted,
    isFeatureUnlocked,
    dismissAchievement,
  } = useOnboardingProgress();

  const createArticle = useCreateArticle();
  const { data: categories } = useCategories();
  const createImportLog = useCreateNoticiasAIImport();

  // Track first visit milestone
  useEffect(() => {
    completeMilestone('first_visit');
  }, [completeMilestone]);

  // Track tour completion
  useEffect(() => {
    if (tourCompleted) {
      completeMilestone('tour_completed');
    }
  }, [tourCompleted, completeMilestone]);

  // Detect URLs in input for batch mode
  const detectUrls = (text: string): string[] => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('http://') || line.startsWith('https://'));
  };

  const detectedUrls = detectUrls(input);
  const isMultipleUrls = detectedUrls.length > 1;

  const detectInputType = (text: string): "EXCLUSIVA" | "CADASTRO_MANUAL" | "JSON" | "LINK" | "TEXT" | "BATCH" => {
    if (isMultipleUrls) return "BATCH";
    const trimmed = text.trim().toUpperCase();
    if (trimmed.startsWith("EXCLUSIVA")) return "EXCLUSIVA";
    if (trimmed.startsWith("CADASTRO MANUAL")) return "CADASTRO_MANUAL";
    if (trimmed.startsWith("JSON")) return "JSON";
    if (text.trim().startsWith("http://") || text.trim().startsWith("https://")) return "LINK";
    return "TEXT";
  };

  const findCategoryId = (categoryName: string): string | null => {
    if (!categories || !categoryName) return null;
    
    const normalizedName = categoryName.toLowerCase().trim();
    const found = categories.find(
      cat => cat.name.toLowerCase() === normalizedName || cat.slug.toLowerCase() === normalizedName
    );
    
    // Fallback to "Geral" if not found
    if (!found) {
      const geral = categories.find(cat => cat.name.toLowerCase() === "geral");
      return geral?.id || null;
    }
    
    return found.id;
  };

  const handleImportNews = async () => {
    const jsonData = generatedContent.json;
    if (!jsonData?.noticias?.length) {
      toast.error("Nenhuma notícia para importar");
      return;
    }

    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;
    let formatCorrectedCount = 0;

    try {
      for (const noticia of jsonData.noticias) {
        try {
          const categoryId = findCategoryId(noticia.categoria);
          
          // Validate first paragraph and auto-correct if enabled
          let content = noticia.conteudo;
          let wasFormatCorrected = false;
          const validation = validateFirstParagraphBold(content);
          
          if (!validation.valid && autoCorrectEnabled) {
            content = autoFixFirstParagraph(content);
            wasFormatCorrected = true;
            formatCorrectedCount++;
            console.log('✅ Auto-corrigido primeiro parágrafo para:', noticia.titulo);
          }
          
          const article = await createArticle.mutateAsync({
            title: noticia.titulo,
            slug: noticia.slug,
            excerpt: noticia.resumo,
            content: content,
            category_id: categoryId,
            featured_image: noticia.imagem?.hero || null,
            featured_image_alt: noticia.imagem?.alt || null,
            featured_image_credit: noticia.imagem?.credito || null,
            source_url: noticia.fonte || null,
            meta_title: noticia.seo?.meta_titulo || null,
            meta_description: noticia.seo?.meta_descricao || null,
            tags: noticia.tags || [],
            status: "published",
            published_at: new Date().toISOString(),
          });
          
          // Log import to history
          const sourceInfo = noticia.fonte ? detectNewsSource(noticia.fonte) : null;
          await createImportLog.mutateAsync({
            article_id: article.id,
            article_title: noticia.titulo,
            article_slug: noticia.slug,
            source_url: noticia.fonte || undefined,
            source_name: sourceInfo?.name || undefined,
            import_type: isMultipleUrls ? 'batch' : 'single',
            format_corrected: wasFormatCorrected,
            status: 'success',
          });
          
          successCount++;
        } catch (err) {
          console.error("Erro ao importar notícia:", noticia.titulo, err);
          errorCount++;
          
          // Log failed import
          try {
            await createImportLog.mutateAsync({
              article_id: '',
              article_title: noticia.titulo,
              article_slug: noticia.slug || 'erro',
              source_url: noticia.fonte || undefined,
              import_type: isMultipleUrls ? 'batch' : 'single',
              format_corrected: false,
              status: 'error',
              error_message: err instanceof Error ? err.message : 'Erro desconhecido',
            });
          } catch (logErr) {
            console.error("Erro ao registrar falha:", logErr);
          }
        }
      }

      if (successCount > 0) {
        let message = `${successCount} notícia(s) importada(s) com sucesso!`;
        if (formatCorrectedCount > 0) {
          message += ` (${formatCorrectedCount} com lide corrigido)`;
        }
        toast.success(message);
        
        // Track milestones
        completeMilestone('first_import');
        if (isMultipleUrls) {
          completeMilestone('first_batch');
        }
        // Track import counts
        const totalImports = successCount;
        if (totalImports >= 10) completeMilestone('ten_imports');
        if (totalImports >= 50) completeMilestone('fifty_imports');
        
        handleClear();
        setPreviewOpen(false);
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} notícia(s) falharam na importação`);
      }
    } catch (error) {
      console.error("Erro geral na importação:", error);
      toast.error("Erro ao importar notícias");
    } finally {
      setIsImporting(false);
    }
  };

  const handleBatchProcess = async () => {
    const urls = detectedUrls;
    
    if (urls.length === 0) {
      toast.error("Nenhuma URL válida encontrada");
      return;
    }
    
    if (urls.length > 10) {
      toast.error("Máximo de 10 URLs por vez");
      return;
    }

    setIsLoading(true);
    setBatchProgress({ current: 0, total: urls.length });

    try {
      const { data, error } = await supabase.functions.invoke("reporter-batch", {
        body: { 
          items: urls.map(url => ({ newsUrl: url }))
        },
      });

      if (error) throw error;

      if (data?.json) {
        setGeneratedContent({ cadastroManual: null, json: data.json });
        setActiveTab("json");
        
        const successCount = data.json?.noticias?.length || 0;
        const failedCount = data.failed?.length || 0;
        
        if (successCount > 0) {
          toast.success(`${successCount} notícia(s) processada(s) com sucesso!`);
          // Show contextual tip for first JSON generation
          showTip('first-json');
          // Track batch milestone
          completeMilestone('first_batch');
          completeMilestone('first_json');
        }
        
        if (failedCount > 0) {
          toast.warning(`${failedCount} URL(s) falharam no processamento`);
        }
      }
    } catch (error) {
      console.error("Erro no processamento em lote:", error);
      toast.error("Erro ao processar URLs em lote");
    } finally {
      setIsLoading(false);
      setBatchProgress(null);
    }
  };

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Digite ou cole o conteúdo da notícia");
      return;
    }

    const inputType = detectInputType(input);
    
    // Use batch processing for multiple URLs
    if (inputType === "BATCH") {
      return handleBatchProcess();
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("noticias-ai", {
        body: { 
          input: input.trim(),
          inputType 
        },
      });

      if (error) throw error;

      if (data) {
        setGeneratedContent({
          cadastroManual: data.cadastroManual || null,
          json: data.json || null,
        });

        // Auto-select tab based on input type
        if (inputType === "JSON" || inputType === "LINK") {
          setActiveTab("json");
          // Show contextual tip for first JSON generation
          if (data.json?.noticias?.length) {
            showTip('first-json');
            completeMilestone('first_json');
            completeMilestone('first_link');
          }
        } else {
          setActiveTab("cadastro");
          completeMilestone('first_text');
        }
        
        // Track EXCLUSIVA mode
        if (inputType === "EXCLUSIVA") {
          completeMilestone('first_exclusiva');
        }

        toast.success("Notícia processada com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao processar notícia:", error);
      toast.error("Erro ao processar a notícia. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInput("");
    setGeneratedContent({ cadastroManual: null, json: null });
    setBatchProgress(null);
  };

  // Handler para upload de imagem que insere URL no campo de texto
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await uploadImageToStorage(file);
      
      // Insere a URL da imagem no campo de texto (append se já houver conteúdo)
      setInput(prev => {
        if (prev.trim()) {
          return `${prev}\n${result.url}`;
        }
        return result.url;
      });
      
      toast.success("Imagem enviada! URL inserida no campo de texto.");
      // Show contextual tip and track milestone
      showTip('image-uploaded');
      completeMilestone('first_image');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar imagem");
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      toast.success(`${fieldName} copiado!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error("Erro ao copiar");
    }
  };

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, fieldName)}
      className="h-6 px-2"
    >
      {copiedField === fieldName ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );

  const renderCadastroManual = () => {
    const data = generatedContent.cadastroManual;
    if (!data) return <p className="text-muted-foreground text-center py-8">Nenhum conteúdo gerado ainda.</p>;

    const fields = [
      { label: "1. Título", value: data.titulo, name: "Título" },
      { label: "2. Slug", value: data.slug, name: "Slug" },
      { label: "3. Resumo", value: data.resumo, name: "Resumo", sublabel: `(${data.resumo?.length || 0}/160 caracteres)` },
      { label: "4. Categoria", value: data.categoria, name: "Categoria" },
      { label: "5. Fonte", value: data.fonte, name: "Fonte" },
      { label: "6. Imagem Hero", value: data.imagens?.hero, name: "Imagem Hero" },
      { label: "6. Imagem OG", value: data.imagens?.og, name: "Imagem OG" },
      { label: "6. Imagem Card", value: data.imagens?.card, name: "Imagem Card" },
      { label: "7. Texto Alternativo", value: data.textoAlternativo, name: "Texto Alternativo" },
      { label: "8. Crédito da Imagem", value: data.creditoImagem, name: "Crédito" },
      { label: "9. Conteúdo", value: data.conteudo, name: "Conteúdo", isLarge: true },
      { label: "10. Galeria de Imagens", value: data.galeriaImagens?.join("\n"), name: "Galeria" },
      { label: "11. Meta Título (SEO)", value: data.seo?.metaTitulo, name: "Meta Título", sublabel: `(${data.seo?.metaTitulo?.length || 0}/60 caracteres)` },
      { label: "11. Meta Descrição (SEO)", value: data.seo?.metaDescricao, name: "Meta Descrição", sublabel: `(${data.seo?.metaDescricao?.length || 0}/160 caracteres)` },
    ];

    return (
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="border rounded-lg p-3 bg-muted/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-foreground">
                {field.label}
                {field.sublabel && <span className="text-muted-foreground ml-1">{field.sublabel}</span>}
              </span>
              {field.value && <CopyButton text={field.value} fieldName={field.name} />}
            </div>
            {field.isLarge ? (
              <Textarea
                value={field.value || ""}
                readOnly
                className="min-h-[200px] text-sm bg-background"
              />
            ) : (
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                {field.value || <span className="text-muted-foreground italic">Não disponível</span>}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderJSON = () => {
    const data = generatedContent.json;
    if (!data) return <p className="text-muted-foreground text-center py-8">Nenhum JSON gerado ainda.</p>;

    const jsonString = JSON.stringify(data, null, 2);
    const hasNoticias = data.noticias && data.noticias.length > 0;
    
    // Check if any article has format issues
    const formatIssues = data.noticias?.filter(n => !validateFirstParagraphBold(n.conteudo).valid) || [];

    return (
      <div className="space-y-4">
        {/* Auto-correction toggle */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
          <Checkbox 
            id="auto-correct"
            checked={autoCorrectEnabled}
            onCheckedChange={(checked) => setAutoCorrectEnabled(checked as boolean)}
          />
          <Label htmlFor="auto-correct" className="text-sm flex items-center gap-2 cursor-pointer">
            <Wand2 className="h-4 w-4 text-primary" />
            Auto-corrigir lide em negrito (padrão Agência Brasil)
          </Label>
        </div>
        
        {/* Format warning banner */}
        {formatIssues.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{formatIssues.length} artigo(s) sem o lide em negrito</p>
              <p className="text-xs mt-1 opacity-75">
                {autoCorrectEnabled 
                  ? "A correção será aplicada automaticamente ao importar."
                  : "Ative a auto-correção acima para corrigir automaticamente."}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2 flex-wrap">
          {hasNoticias && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPreviewIndex(0);
                  setPreviewOpen(true);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
              
              <Button
                size="sm"
                onClick={() => handleImportNews()}
                disabled={isImporting}
                className="noticias-ai-import-btn"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Importar Notícias
                    {autoCorrectEnabled && formatIssues.length > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        +correção
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(jsonString, "JSON Completo")}
          >
            {copiedField === "JSON Completo" ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar JSON
              </>
            )}
          </Button>
        </div>
        <Textarea
          value={jsonString}
          readOnly
          className="min-h-[500px] font-mono text-xs bg-muted/30"
        />
      </div>
    );
  };

  // Handle tab changes for contextual tips and milestone tracking
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'historico') {
      showTip('history-tab');
      completeMilestone('viewed_history');
    }
    if (value === 'stats') {
      completeMilestone('viewed_stats');
    }
    if (value === 'sources') showTip('sources-tab');
    if (value === 'schedules') showTip('schedules-tab');
  };

  return (
    <div className="space-y-6">
      {/* Guided Tour */}
      <NoticiasAITour 
        run={tourRun} 
        stepIndex={tourStepIndex} 
        onCallback={handleJoyrideCallback as (data: CallBackProps) => void} 
      />
      
      {/* Contextual Tips */}
      <ContextualTip
        tip={activeTip}
        visible={tipVisible}
        onDismiss={dismissTip}
        onDismissPermanently={dismissPermanently}
      />

      {/* Achievement Toast */}
      <AchievementToast
        achievement={recentAchievement}
        leveledUp={leveledUp}
        newLevel={levelName}
        onDismiss={dismissAchievement}
      />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Newspaper className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Notícias AI</h1>
            <p className="text-muted-foreground">
              Chat inteligente para processamento editorial de notícias
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Onboarding Progress Indicator */}
          <OnboardingProgress compact />

          {/* Start Tour Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={startTour}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {tourCompleted ? 'Repetir Tour' : 'Iniciar Tour'}
          </Button>

          {/* Tutorial Button */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 noticias-ai-tutorial-btn">
                <BookOpen className="h-4 w-4" />
                Tutorial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Tutorial do Notícias AI
                </DialogTitle>
              </DialogHeader>
              <NoticiasAITutorial />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Entrada de Conteúdo
          </CardTitle>
          <CardDescription>
            Digite EXCLUSIVA, CADASTRO MANUAL, JSON ou cole a notícia completa / link da matéria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-2 noticias-ai-badges">
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setInput("EXCLUSIVA\n\n")}>
              EXCLUSIVA
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setInput("CADASTRO MANUAL\n\n")}>
              CADASTRO MANUAL
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setInput("JSON\n\n")}>
              JSON
            </Badge>
            <Badge 
              variant={isMultipleUrls ? "default" : "outline"} 
              className={`cursor-pointer noticias-ai-badge-lote ${isMultipleUrls ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-primary/10"}`}
              onClick={() => {
                setIsBatchMode(!isBatchMode);
                if (!isBatchMode) {
                  setInput("");
                }
                showTip('batch-mode');
              }}
            >
              <List className="h-3 w-3 mr-1" />
              LOTE {isMultipleUrls && `(${detectedUrls.length})`}
            </Badge>
          </div>

          {/* Batch mode hint */}
          {(isBatchMode || isMultipleUrls) && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400 text-sm">
              <p className="font-medium flex items-center gap-2">
                <List className="h-4 w-4" />
                Modo Lote Ativo
              </p>
              <p className="text-xs mt-1 opacity-75">
                Cole até 10 URLs (uma por linha) para processar em paralelo.
                {detectedUrls.length > 0 && ` Detectadas: ${detectedUrls.length} URL(s)`}
              </p>
            </div>
          )}

          {/* Botão Enviar Imagem */}
          <div className="flex items-center gap-2 mb-2">
            <input
              type="file"
              ref={imageInputRef}
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingImage}
              className="border-primary text-primary hover:bg-primary/10 noticias-ai-upload"
            >
              {uploadingImage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Imagem (preenche todos os campos)
                </>
              )}
            </Button>
          </div>
          
          <Textarea
            placeholder={
              isBatchMode || isMultipleUrls
                ? "Cole até 10 URLs (uma por linha):\nhttps://example.com/noticia-1\nhttps://example.com/noticia-2\nhttps://example.com/noticia-3"
                : "Digite EXCLUSIVA, CADASTRO MANUAL, JSON ou cole a notícia completa..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[200px] text-sm noticias-ai-input"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !input.trim()}
              className="flex-1 noticias-ai-generate"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {batchProgress 
                    ? `Processando ${batchProgress.current}/${batchProgress.total}...`
                    : "Processando..."}
                </>
              ) : isMultipleUrls ? (
                <>
                  <List className="h-4 w-4 mr-2" />
                  Processar {detectedUrls.length} URLs
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Gerar Notícia
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Output Section */}
      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="noticias-ai-tabs">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="cadastro" className="noticias-ai-tab-manual">Manual</TabsTrigger>
              <TabsTrigger value="json" className="noticias-ai-tab-json">JSON</TabsTrigger>
              <TabsTrigger value="historico" className="flex items-center gap-1 noticias-ai-tab-historico">
                <History className="h-3 w-3" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-1 noticias-ai-tab-stats">
                <BarChart3 className="h-3 w-3" />
                Estatísticas
              </TabsTrigger>
              <TabsTrigger value="sources" className="flex items-center gap-1 noticias-ai-tab-sources">
                <Settings className="h-3 w-3" />
                Fontes
              </TabsTrigger>
              <TabsTrigger value="schedules" className="flex items-center gap-1 noticias-ai-tab-schedules">
                <Clock className="h-3 w-3" />
                Agendamentos
              </TabsTrigger>
            </TabsList>
            <TabsContent value="cadastro" className="mt-4">
              {renderCadastroManual()}
            </TabsContent>
            <TabsContent value="json" className="mt-4">
              {renderJSON()}
            </TabsContent>
            <TabsContent value="historico" className="mt-4">
              <NoticiasAIImportHistory />
            </TabsContent>
            <TabsContent value="stats" className="mt-4">
              <NoticiasAIStatsDashboard />
            </TabsContent>
            <TabsContent value="sources" className="mt-4">
              <NoticiasAISourcesManager />
            </TabsContent>
            <TabsContent value="schedules" className="mt-4">
              <NoticiasAIScheduleManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Progress and Tips Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Onboarding Checklist */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-primary" />
              Próximos Objetivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OnboardingChecklist maxItems={4} showCompleted={true} />
          </CardContent>
        </Card>

        {/* Quick Tips Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Dicas Rápidas</h3>
                <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-red-600 border-red-300">EXCLUSIVA</Badge>
                    <span>Preservar original</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-blue-600 border-blue-300">JSON</Badge>
                    <span>Importação automática</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-purple-600 border-purple-300">LOTE</Badge>
                    <span>Até 10 URLs</span>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-primary">
                      <HelpCircle className="h-3 w-3 mr-1" />
                      Ver tutorial completo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-primary" />
                        Tutorial do Notícias AI
                      </DialogTitle>
                    </DialogHeader>
                    <NoticiasAITutorial />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Dialog */}
      {generatedContent.json?.noticias && (
        <ArticlePreviewDialog
          articles={generatedContent.json.noticias}
          currentIndex={previewIndex}
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          onConfirmImport={() => handleImportNews()}
          onNavigate={setPreviewIndex}
          isImporting={isImporting}
        />
      )}
    </div>
  );
};

export default NoticiasAI;
