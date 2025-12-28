import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
import { useRSSToJson, FeedSelection, RSSArticle } from "@/hooks/useRSSToJson";
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
  ExternalLink,
  FileJson,
  RefreshCw,
  Settings2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const RSSToJsonGenerator = () => {
  const { toast } = useToast();
  const { data: feeds = [], isLoading: loadingFeeds } = useRSSFeeds();
  const createFeed = useCreateRSSFeed();
  const updateFeed = useUpdateRSSFeed();
  const deleteFeed = useDeleteRSSFeed();
  
  const {
    articles,
    generatedJson,
    isFetching,
    isGenerating,
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
  
  // Feed selections with quantities
  const [feedSelections, setFeedSelections] = useState<FeedSelection[]>([]);

  // Initialize feed selections when feeds load
  useState(() => {
    if (feeds.length > 0 && feedSelections.length === 0) {
      setFeedSelections(feeds.map(feed => ({
        feedId: feed.id,
        feedName: feed.name,
        feedUrl: feed.url,
        quantity: 3,
        selected: false
      })));
    }
  });

  // Update selections when feeds change
  const updateFeedSelections = () => {
    setFeedSelections(feeds.map(feed => {
      const existing = feedSelections.find(s => s.feedId === feed.id);
      return existing || {
        feedId: feed.id,
        feedName: feed.name,
        feedUrl: feed.url,
        quantity: 3,
        selected: false
      };
    }));
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
    await generateJsonFromArticles(selectedArticles);
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
        <Button onClick={() => setShowAddFeed(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Feed
        </Button>
      </div>

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

        {/* Section 2: Articles Found */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Artigos Encontrados
            </CardTitle>
            <CardDescription>
              {articles.length > 0 
                ? `${articles.length} artigos • ${selectedArticlesCount} selecionados`
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
                    <Button variant="outline" size="sm" onClick={() => selectAllArticles(true)}>
                      Selecionar todos
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => selectAllArticles(false)}>
                      Desmarcar todos
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearArticles}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                </div>
                
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {articles.map(article => (
                      <div 
                        key={article.id}
                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                          article.selected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
                        }`}
                        onClick={() => toggleArticleSelection(article.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={article.selected}
                            onCheckedChange={() => toggleArticleSelection(article.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-2">{article.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{article.feedName}</Badge>
                              {article.pubDate && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(article.pubDate), { 
                                    addSuffix: true, 
                                    locale: ptBR 
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                          <a 
                            href={article.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
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
              <Input
                id="feedUrl"
                placeholder="https://example.com/feed.xml"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFeed(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddFeed} disabled={createFeed.isPending}>
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
                <Input
                  id="editFeedUrl"
                  value={editingFeed.url}
                  onChange={(e) => setEditingFeed({ ...editingFeed, url: e.target.value })}
                />
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
    </div>
  );
};

export default RSSToJsonGenerator;
