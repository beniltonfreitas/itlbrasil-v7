import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRSSFeeds, useCreateRSSFeed, useUpdateRSSFeed, useDeleteRSSFeed } from "@/hooks/useRSSFeeds";
import { useRSSToJson, FeedSelection } from "@/hooks/useRSSToJson";
import { useFeedValidation } from "@/hooks/useFeedValidation";
import { useJsonHistory } from "@/hooks/useJsonHistory";
import { 
  useRSSJsonSchedules, 
  useCreateRSSJsonSchedule, 
  useDeleteRSSJsonSchedule,
  useToggleScheduleActive 
} from "@/hooks/useRSSToJsonSchedules";
import ArticlePreviewCard from "@/components/ArticlePreviewCard";
import JsonHistoryPanel from "@/components/JsonHistoryPanel";
import { 
  Rss, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Download, 
  Copy, 
  CheckCircle2, 
  XCircle,
  Loader2,
  FileJson,
  RefreshCw,
  Settings2,
  Clock,
  AlertCircle,
  CheckCircle,
  Timer,
  Calendar,
  Zap,
  History,
  AlertTriangle,
  EyeOff
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

const RSSToJsonGenerator = () => {
  const { toast } = useToast();
  const { data: feeds = [], isLoading: loadingFeeds } = useRSSFeeds();
  const createFeed = useCreateRSSFeed();
  const updateFeed = useUpdateRSSFeed();
  const deleteFeed = useDeleteRSSFeed();
  
  const { validateFeed, getValidationResult } = useFeedValidation();
  
  const { data: schedules = [], isLoading: loadingSchedules } = useRSSJsonSchedules();
  const createSchedule = useCreateRSSJsonSchedule();
  const deleteSchedule = useDeleteRSSJsonSchedule();
  const toggleScheduleActive = useToggleScheduleActive();
  
  // JSON History
  const { 
    history, 
    isLoading: loadingHistory, 
    loadHistory, 
    deleteFromHistory 
  } = useJsonHistory();
  
  const {
    articles,
    visibleArticles,
    generatedJson,
    isFetching,
    isGenerating,
    isCheckingDuplicates,
    duplicatesCount,
    hideDuplicates,
    setHideDuplicates,
    progress,
    fetchArticlesFromFeeds,
    generateJsonFromArticles,
    toggleArticleSelection,
    selectAllArticles,
    clearArticles,
    setGeneratedJson
  } = useRSSToJson();

  // UI State
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [editingFeed, setEditingFeed] = useState<any>(null);
  const [newFeedName, setNewFeedName] = useState("");
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  
  // Schedule dialog
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState("");
  const [newScheduleInterval, setNewScheduleInterval] = useState("60");
  const [newScheduleQuantity, setNewScheduleQuantity] = useState("3");
  const [newScheduleAction, setNewScheduleAction] = useState<'generate_only' | 'generate_and_import'>('generate_only');
  const [selectedScheduleFeeds, setSelectedScheduleFeeds] = useState<string[]>([]);
  
  // Feed selections with quantities
  const [feedSelections, setFeedSelections] = useState<FeedSelection[]>([]);

  // Load history when tab changes
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory('rss-to-json');
    }
  }, [activeTab]);

  // Update selections when feeds change
  useEffect(() => {
    if (feeds.length > 0) {
      setFeedSelections(prev => {
        return feeds.map(feed => {
          const existing = prev.find(s => s.feedId === feed.id);
          return existing || {
            feedId: feed.id,
            feedName: feed.name,
            feedUrl: feed.url,
            quantity: 3,
            selected: false
          };
        });
      });
    }
  }, [feeds]);

  const handleValidateFeed = async (url: string) => {
    setIsValidating(true);
    await validateFeed(url);
    setIsValidating(false);
  };

  const handleAddFeed = async () => {
    if (!newFeedName.trim() || !newFeedUrl.trim()) {
      toast({
        title: "Erro",
        description: "Nome e URL são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Validate before adding
    const validation = getValidationResult(newFeedUrl);
    if (!validation || validation.status !== 'success') {
      const result = await validateFeed(newFeedUrl);
      if (!result.isValid) {
        toast({
          title: "Feed inválido",
          description: result.errorMessage || "A URL não retorna um feed RSS válido",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      await createFeed.mutateAsync({
        name: newFeedName,
        url: newFeedUrl,
        active: true
      });
      setNewFeedName("");
      setNewFeedUrl("");
      setShowAddFeed(false);
      toast({
        title: "Feed adicionado",
        description: `${newFeedName} foi adicionado com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar feed",
        description: "Não foi possível adicionar o feed",
        variant: "destructive"
      });
    }
  };

  const handleUpdateFeed = async () => {
    if (!editingFeed) return;
    
    try {
      await updateFeed.mutateAsync({
        id: editingFeed.id,
        name: editingFeed.name,
        url: editingFeed.url
      });
      setEditingFeed(null);
      toast({
        title: "Feed atualizado",
        description: "As alterações foram salvas"
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o feed",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFeed = async (feedId: string, feedName: string) => {
    try {
      await deleteFeed.mutateAsync(feedId);
      toast({
        title: "Feed removido",
        description: `${feedName} foi removido`
      });
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o feed",
        variant: "destructive"
      });
    }
  };

  const toggleFeedSelection = (feedId: string) => {
    setFeedSelections(prev => 
      prev.map(s => s.feedId === feedId ? { ...s, selected: !s.selected } : s)
    );
  };

  const updateFeedQuantity = (feedId: string, quantity: number) => {
    setFeedSelections(prev => 
      prev.map(s => s.feedId === feedId ? { ...s, quantity } : s)
    );
  };

  const handleFetchArticles = async () => {
    const selectedFeeds = feedSelections.filter(s => s.selected);
    if (selectedFeeds.length === 0) {
      toast({
        title: "Nenhum feed selecionado",
        description: "Selecione ao menos um feed para buscar artigos",
        variant: "destructive"
      });
      return;
    }
    await fetchArticlesFromFeeds(selectedFeeds);
  };

  const handleGenerateJson = async () => {
    const selectedArticles = articles.filter(a => a.selected);
    const selectedFeedIds = feedSelections.filter(s => s.selected).map(s => s.feedId);
    await generateJsonFromArticles(selectedArticles, selectedFeedIds);
  };

  const handleReimport = (json: any) => {
    const jsonString = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    setGeneratedJson(jsonString);
    setActiveTab('manual');
    toast({
      title: "JSON carregado",
      description: "O JSON foi carregado para edição"
    });
  };

  const handleCreateSchedule = async () => {
    if (!newScheduleName.trim() || selectedScheduleFeeds.length === 0) {
      toast({
        title: "Erro",
        description: "Nome e pelo menos um feed são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      await createSchedule.mutateAsync({
        name: newScheduleName,
        feed_ids: selectedScheduleFeeds,
        quantity_per_feed: parseInt(newScheduleQuantity),
        interval_minutes: parseInt(newScheduleInterval),
        output_action: newScheduleAction,
        is_active: true,
        created_by: null
      });
      setShowScheduleDialog(false);
      setNewScheduleName("");
      setSelectedScheduleFeeds([]);
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedJson);
    toast({
      title: "Copiado!",
      description: "JSON copiado para a área de transferência"
    });
  };

  const downloadJson = () => {
    const blob = new Blob([generatedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noticias-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedFeedsCount = feedSelections.filter(s => s.selected).length;
  const totalArticlesEstimate = feedSelections.filter(s => s.selected).reduce((sum, s) => sum + s.quantity, 0);
  const selectedArticlesCount = articles.filter(a => a.selected).length;

  const renderValidationStatus = (url: string) => {
    const result = getValidationResult(url);
    if (!result) return null;

    switch (result.status) {
      case 'validating':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'success':
        return (
          <div className="flex items-center gap-1.5 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs">
              {result.articlesFound} artigos • {result.responseTimeMs}ms
            </span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1.5 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">{result.errorMessage || 'Inválido'}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Rss className="h-8 w-8 text-primary" />
            Gerador RSS → JSON
          </h1>
          <p className="text-muted-foreground mt-1">
            Importe notícias de feeds RSS e gere JSON formatado para importação
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowScheduleDialog(true)}>
            <Clock className="h-4 w-4 mr-2" />
            Agendar
          </Button>
          <Button onClick={() => setShowAddFeed(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Feed
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="manual">
            <Zap className="h-4 w-4 mr-2" />
            Geração Manual
          </TabsTrigger>
          <TabsTrigger value="schedules">
            <Calendar className="h-4 w-4 mr-2" />
            Agendamentos
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 1: Manage Feeds */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5" />
                  Feeds RSS Cadastrados
                </CardTitle>
                <CardDescription>
                  Selecione os feeds e defina a quantidade de artigos por fonte
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingFeeds ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : feeds.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Rss className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum feed cadastrado</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowAddFeed(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar primeiro feed
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {feeds.map(feed => {
                        const selection = feedSelections.find(s => s.feedId === feed.id);
                        const isSelected = selection?.selected || false;
                        const quantity = selection?.quantity || 3;
                        
                        return (
                          <div 
                            key={feed.id} 
                            className={`p-4 rounded-lg border transition-colors ${
                              isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleFeedSelection(feed.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">{feed.name}</span>
                                  {feed.active ? (
                                    <Badge variant="secondary" className="text-xs">Ativo</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs">Inativo</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {feed.url}
                                </p>
                                {renderValidationStatus(feed.url)}
                              </div>
                              
                              {isSelected && (
                                <Select
                                  value={quantity.toString()}
                                  onValueChange={(value) => updateFeedQuantity(feed.id, parseInt(value))}
                                >
                                  <SelectTrigger className="w-20">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => setEditingFeed(feed)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteFeed(feed.id, feed.name)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
                
                {feeds.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {selectedFeedsCount} feeds selecionados • ~{totalArticlesEstimate} artigos
                      </div>
                      <Button 
                        onClick={handleFetchArticles}
                        disabled={selectedFeedsCount === 0 || isFetching}
                      >
                        {isFetching ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Buscando...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Buscar Artigos
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Section 2: Articles Found - Visual Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  Artigos Encontrados
                </CardTitle>
                <CardDescription>
                  {articles.length > 0 
                    ? `${visibleArticles.length} artigos${duplicatesCount > 0 ? ` (${duplicatesCount} duplicados)` : ''} • ${selectedArticlesCount} selecionados`
                    : 'Selecione feeds e clique em "Buscar Artigos"'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {articles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum artigo carregado</p>
                    <p className="text-xs mt-1">Selecione feeds e busque artigos</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => selectAllArticles(true, true)}>
                          Selecionar válidos
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => selectAllArticles(false)}>
                          Desmarcar todos
                        </Button>
                      </div>
                      <div className="flex items-center gap-3">
                        {duplicatesCount > 0 && (
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={hideDuplicates}
                              onCheckedChange={setHideDuplicates}
                              id="hide-duplicates"
                            />
                            <Label htmlFor="hide-duplicates" className="text-xs flex items-center gap-1 cursor-pointer">
                              <EyeOff className="h-3 w-3" />
                              Ocultar duplicados
                            </Label>
                          </div>
                        )}
                        <Button variant="ghost" size="sm" onClick={clearArticles}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Limpar
                        </Button>
                      </div>
                    </div>
                    
                    {isCheckingDuplicates && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verificando duplicados...
                      </div>
                    )}
                    
                    {duplicatesCount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-amber-600 mb-3 p-2 rounded-lg bg-amber-500/10">
                        <AlertTriangle className="h-4 w-4" />
                        {duplicatesCount} artigos duplicados detectados e desmarcados
                      </div>
                    )}
                    
                    <ScrollArea className="h-[350px] pr-4">
                      <div className="space-y-3">
                        {visibleArticles.map(article => (
                          <ArticlePreviewCard
                            key={article.id}
                            article={article}
                            onToggle={() => toggleArticleSelection(article.id)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <Separator className="my-4" />
                    
                    <Button 
                      className="w-full"
                      onClick={handleGenerateJson}
                      disabled={selectedArticlesCount === 0 || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Gerando JSON ({progress.current}/{progress.total})
                        </>
                      ) : (
                        <>
                          <FileJson className="h-4 w-4 mr-2" />
                          Gerar JSON com {selectedArticlesCount} artigos
                        </>
                      )}
                    </Button>
                    
                    {isGenerating && (
                      <Progress 
                        value={(progress.current / progress.total) * 100} 
                        className="mt-3"
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Section 3: Generated JSON */}
          {generatedJson && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  JSON Gerado
                </CardTitle>
                <CardDescription>
                  Copie ou baixe o JSON para importar as notícias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar JSON
                  </Button>
                  <Button variant="outline" onClick={downloadJson}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Arquivo
                  </Button>
                  <Button variant="ghost" onClick={() => setGeneratedJson("")}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                </div>
                <ScrollArea className="h-[400px] rounded-lg border bg-muted/30 p-4">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {generatedJson}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Agendamentos Automáticos
              </CardTitle>
              <CardDescription>
                Configure a geração automática de JSON em intervalos regulares
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSchedules ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : schedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum agendamento configurado</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowScheduleDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeiro agendamento
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map(schedule => (
                    <div 
                      key={schedule.id}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={schedule.is_active}
                            onCheckedChange={(checked) => 
                              toggleScheduleActive.mutate({ id: schedule.id, is_active: checked })
                            }
                          />
                          <div>
                            <p className="font-medium">{schedule.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {schedule.feed_ids.length} feeds • {schedule.quantity_per_feed} artigos/feed • 
                              A cada {schedule.interval_minutes} min
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={schedule.is_active ? "default" : "secondary"}>
                            {schedule.is_active ? "Ativo" : "Pausado"}
                          </Badge>
                          {schedule.next_run && (
                            <span className="text-xs text-muted-foreground">
                              Próximo: {format(new Date(schedule.next_run), "dd/MM HH:mm")}
                            </span>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSchedule.mutate(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de JSONs Gerados
              </CardTitle>
              <CardDescription>
                Visualize, baixe ou reimporte JSONs gerados anteriormente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JsonHistoryPanel
                history={history}
                isLoading={loadingHistory}
                onReimport={handleReimport}
                onDelete={deleteFromHistory}
                onRefresh={() => loadHistory('rss-to-json')}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Feed Dialog */}
      <Dialog open={showAddFeed} onOpenChange={setShowAddFeed}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Feed RSS</DialogTitle>
            <DialogDescription>
              Cadastre um novo feed de notícias para importação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="feedName">Nome do Feed</Label>
              <Input
                id="feedName"
                placeholder="Ex: Agência Brasil - Economia"
                value={newFeedName}
                onChange={(e) => setNewFeedName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="feedUrl">URL do Feed</Label>
              <div className="flex gap-2">
                <Input
                  id="feedUrl"
                  placeholder="https://example.com/feed.xml"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={() => handleValidateFeed(newFeedUrl)}
                  disabled={!newFeedUrl.trim() || isValidating}
                >
                  {isValidating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {newFeedUrl && renderValidationStatus(newFeedUrl)}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFeed(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddFeed} 
              disabled={createFeed.isPending || isValidating}
            >
              {createFeed.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Feed Dialog */}
      <Dialog open={!!editingFeed} onOpenChange={() => setEditingFeed(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Feed RSS</DialogTitle>
            <DialogDescription>
              Atualize as informações do feed
            </DialogDescription>
          </DialogHeader>
          {editingFeed && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="editFeedName">Nome do Feed</Label>
                <Input
                  id="editFeedName"
                  value={editingFeed.name}
                  onChange={(e) => setEditingFeed({ ...editingFeed, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editFeedUrl">URL do Feed</Label>
                <div className="flex gap-2">
                  <Input
                    id="editFeedUrl"
                    value={editingFeed.url}
                    onChange={(e) => setEditingFeed({ ...editingFeed, url: e.target.value })}
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => handleValidateFeed(editingFeed.url)}
                    disabled={isValidating}
                  >
                    {isValidating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {editingFeed.url && renderValidationStatus(editingFeed.url)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFeed(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateFeed} disabled={updateFeed.isPending}>
              {updateFeed.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar Agendamento</DialogTitle>
            <DialogDescription>
              Configure a geração automática de JSON
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nome do Agendamento</Label>
              <Input
                placeholder="Ex: Importação Diária"
                value={newScheduleName}
                onChange={(e) => setNewScheduleName(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Feeds para processar</Label>
              <ScrollArea className="h-[150px] border rounded-lg p-2 mt-2">
                {feeds.map(feed => (
                  <div key={feed.id} className="flex items-center gap-2 py-1">
                    <Checkbox
                      checked={selectedScheduleFeeds.includes(feed.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedScheduleFeeds(prev => [...prev, feed.id]);
                        } else {
                          setSelectedScheduleFeeds(prev => prev.filter(id => id !== feed.id));
                        }
                      }}
                    />
                    <span className="text-sm">{feed.name}</span>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Intervalo</Label>
                <Select value={newScheduleInterval} onValueChange={setNewScheduleInterval}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="360">6 horas</SelectItem>
                    <SelectItem value="720">12 horas</SelectItem>
                    <SelectItem value="1440">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Artigos por feed</Label>
                <Select value={newScheduleQuantity} onValueChange={setNewScheduleQuantity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Ação</Label>
              <Select value={newScheduleAction} onValueChange={(v: any) => setNewScheduleAction(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generate_only">Apenas gerar JSON</SelectItem>
                  <SelectItem value="generate_and_import">Gerar e importar automaticamente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSchedule} disabled={createSchedule.isPending}>
              {createSchedule.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Timer className="h-4 w-4 mr-2" />
              )}
              Criar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RSSToJsonGenerator;
