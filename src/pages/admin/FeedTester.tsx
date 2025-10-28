import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  useFeedsWithTestResults, 
  useTestAllFeeds, 
  useTestSingleFeed,
  useDeleteProblematicFeeds,
  useReactivateFeeds,
  type FeedWithTestResult
} from "@/hooks/useFeedTesting";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Play,
  Trash2,
  RotateCcw,
  TestTube2,
  Zap
} from "lucide-react";

const FeedTester = () => {
  const [selectedFeeds, setSelectedFeeds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'success' | 'error' | 'timeout' | 'invalid_content' | 'untested'>('all');

  const { data: feedsWithTests, isLoading, refetch } = useFeedsWithTestResults();
  const testAllFeeds = useTestAllFeeds();
  const testSingleFeed = useTestSingleFeed();
  const deleteFeeds = useDeleteProblematicFeeds();
  const reactivateFeeds = useReactivateFeeds();

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'timeout': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'invalid_content': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <TestTube2 className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success': return <Badge variant="default" className="bg-green-500">Sucesso</Badge>;
      case 'error': return <Badge variant="destructive">Erro</Badge>;
      case 'timeout': return <Badge variant="secondary" className="bg-yellow-500 text-yellow-900">Timeout</Badge>;
      case 'invalid_content': return <Badge variant="secondary" className="bg-orange-500 text-orange-900">Conteúdo Inválido</Badge>;
      default: return <Badge variant="outline">Não Testado</Badge>;
    }
  };

  const handleTestAllFeeds = async () => {
    try {
      await testAllFeeds.mutateAsync();
      toast.success("Teste de todos os feeds iniciado!");
      setTimeout(() => refetch(), 2000); // Aguardar um pouco e recarregar
    } catch (error) {
      toast.error(`Erro ao testar feeds: ${error.message}`);
    }
  };

  const handleTestSingleFeed = async (feedId: string, feedUrl: string) => {
    try {
      await testSingleFeed.mutateAsync({ feedId, feedUrl });
      toast.success("Feed testado com sucesso!");
      refetch();
    } catch (error) {
      toast.error(`Erro ao testar feed: ${error.message}`);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFeeds.length === 0) {
      toast.error("Selecione pelo menos um feed para deletar");
      return;
    }

    try {
      await deleteFeeds.mutateAsync(selectedFeeds);
      toast.success(`${selectedFeeds.length} feed(s) deletado(s) com sucesso!`);
      setSelectedFeeds([]);
      refetch();
    } catch (error) {
      toast.error(`Erro ao deletar feeds: ${error.message}`);
    }
  };

  const handleReactivateSelected = async () => {
    if (selectedFeeds.length === 0) {
      toast.error("Selecione pelo menos um feed para reativar");
      return;
    }

    try {
      await reactivateFeeds.mutateAsync(selectedFeeds);
      toast.success(`${selectedFeeds.length} feed(s) reativado(s) com sucesso!`);
      setSelectedFeeds([]);
      refetch();
    } catch (error) {
      toast.error(`Erro ao reativar feeds: ${error.message}`);
    }
  };

  const toggleFeedSelection = (feedId: string) => {
    setSelectedFeeds(prev => 
      prev.includes(feedId) 
        ? prev.filter(id => id !== feedId)
        : [...prev, feedId]
    );
  };

  const getFilteredFeeds = (): FeedWithTestResult[] => {
    if (!feedsWithTests) return [];
    
    switch (filter) {
      case 'success':
        return feedsWithTests.filter(feed => feed.latest_test?.status === 'success');
      case 'error':
        return feedsWithTests.filter(feed => feed.latest_test?.status === 'error');
      case 'timeout':
        return feedsWithTests.filter(feed => feed.latest_test?.status === 'timeout');
      case 'invalid_content':
        return feedsWithTests.filter(feed => feed.latest_test?.status === 'invalid_content');
      case 'untested':
        return feedsWithTests.filter(feed => !feed.latest_test);
      default:
        return feedsWithTests;
    }
  };

  const filteredFeeds = getFilteredFeeds();
  const stats = feedsWithTests ? {
    total: feedsWithTests.length,
    success: feedsWithTests.filter(f => f.latest_test?.status === 'success').length,
    error: feedsWithTests.filter(f => f.latest_test?.status === 'error').length,
    timeout: feedsWithTests.filter(f => f.latest_test?.status === 'timeout').length,
    invalid: feedsWithTests.filter(f => f.latest_test?.status === 'invalid_content').length,
    untested: feedsWithTests.filter(f => !f.latest_test).length,
  } : null;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <TestTube2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Carregando feeds...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teste de Feeds RSS</h1>
          <p className="text-muted-foreground">
            Monitore e teste a saúde dos feeds RSS nativos
          </p>
        </div>
        <Button 
          onClick={handleTestAllFeeds}
          disabled={testAllFeeds.isPending}
          className="gap-2"
        >
          <TestTube2 className="h-4 w-4" />
          {testAllFeeds.isPending ? "Testando..." : "Testar Todos"}
        </Button>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-500">{stats.success}</div>
            <div className="text-sm text-muted-foreground">Sucesso</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-red-500">{stats.error}</div>
            <div className="text-sm text-muted-foreground">Erro</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-yellow-500">{stats.timeout}</div>
            <div className="text-sm text-muted-foreground">Timeout</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-orange-500">{stats.invalid}</div>
            <div className="text-sm text-muted-foreground">Inválido</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-gray-500">{stats.untested}</div>
            <div className="text-sm text-muted-foreground">Não Testado</div>
          </Card>
        </div>
      )}

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ações em Lote
          </CardTitle>
          <CardDescription>
            Selecione feeds para executar ações em lote
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setFilter('all')}>
              Todos ({stats?.total || 0})
            </Button>
            <Button variant="outline" onClick={() => setFilter('success')}>
              Sucesso ({stats?.success || 0})
            </Button>
            <Button variant="outline" onClick={() => setFilter('error')}>
              Erro ({stats?.error || 0})
            </Button>
            <Button variant="outline" onClick={() => setFilter('timeout')}>
              Timeout ({stats?.timeout || 0})
            </Button>
            <Button variant="outline" onClick={() => setFilter('invalid_content')}>
              Inválido ({stats?.invalid || 0})
            </Button>
            <Button variant="outline" onClick={() => setFilter('untested')}>
              Não Testado ({stats?.untested || 0})
            </Button>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              onClick={handleDeleteSelected}
              disabled={selectedFeeds.length === 0 || deleteFeeds.isPending}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Deletar Selecionados ({selectedFeeds.length})
            </Button>
            <Button 
              onClick={handleReactivateSelected}
              disabled={selectedFeeds.length === 0 || reactivateFeeds.isPending}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reativar Selecionados ({selectedFeeds.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Feeds */}
      <div className="space-y-4">
        {filteredFeeds.map((feed) => (
          <Card key={feed.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={selectedFeeds.includes(feed.id)}
                    onCheckedChange={() => toggleFeedSelection(feed.id)}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(feed.latest_test?.status)}
                      <h3 className="font-semibold">{feed.name}</h3>
                      {getStatusBadge(feed.latest_test?.status)}
                      <Badge variant={feed.active ? "default" : "secondary"}>
                        {feed.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {feed.url}
                    </p>
                    
                    {feed.latest_test && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Testado:</span>{" "}
                          {new Date(feed.latest_test.test_date).toLocaleString()}
                        </div>
                        {feed.latest_test.response_time_ms && (
                          <div>
                            <span className="font-medium">Tempo:</span>{" "}
                            {feed.latest_test.response_time_ms}ms
                          </div>
                        )}
                        {feed.latest_test.http_status && (
                          <div>
                            <span className="font-medium">HTTP:</span>{" "}
                            {feed.latest_test.http_status}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Artigos:</span>{" "}
                          {feed.latest_test.articles_found}
                        </div>
                      </div>
                    )}
                    
                    {feed.latest_test?.error_message && (
                      <Alert className="mt-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {feed.latest_test.error_message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTestSingleFeed(feed.id, feed.url)}
                  disabled={testSingleFeed.isPending}
                  className="gap-2"
                >
                  <Play className="h-3 w-3" />
                  Testar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFeeds.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <TestTube2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum feed encontrado</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? "Não há feeds para exibir"
                : `Não há feeds com status "${filter}"`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FeedTester;