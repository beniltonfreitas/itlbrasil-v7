import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Link2, Image, AlertCircle, Loader2, CheckCircle, FileText, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useJsonHistory } from "@/hooks/useJsonHistory";

interface ProcessedJob {
  id: string;
  url: string;
  imageUrl?: string;
  status: 'processing' | 'done' | 'error';
  result?: any;
  error?: string;
  created_at: string;
}

const ReporterAIv2 = () => {
  const [newsUrl, setNewsUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<ProcessedJob[]>([]);
  
  const { saveToHistory, loadHistory, deleteFromHistory, history } = useJsonHistory();

  useEffect(() => {
    loadHistory('reporter-ai');
  }, []);

  const handleProcess = async () => {
    if (!newsUrl.trim()) {
      toast.error("Por favor, insira a URL da notícia");
      return;
    }

    // Validate URL format
    try {
      new URL(newsUrl);
    } catch {
      toast.error("URL inválida. Insira uma URL completa (ex: https://exemplo.com/noticia)");
      return;
    }

    if (imageUrl && imageUrl.trim()) {
      try {
        new URL(imageUrl);
      } catch {
        toast.error("URL da imagem inválida");
        return;
      }
    }

    const jobId = crypto.randomUUID();
    const newJob: ProcessedJob = {
      id: jobId,
      url: newsUrl.trim(),
      imageUrl: imageUrl.trim() || undefined,
      status: 'processing',
      created_at: new Date().toISOString()
    };

    // Add job to list immediately
    setJobs(prev => [newJob, ...prev]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('reporter-ai', {
        body: { 
          newsUrl: newsUrl.trim(),
          imageUrl: imageUrl.trim() || undefined
        }
      });

      if (error) throw error;

      // Update job with result
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'done', result: data.json }
          : job
      ));

      // Save to history
      await saveToHistory(
        data.json, 
        'reporter-ai', 
        {
          newsUrl: newsUrl.trim(),
          imageUrl: imageUrl.trim() || undefined,
          articlesCount: 1
        },
        'done'
      );

      toast.success("JSON gerado com sucesso!");
      setNewsUrl("");
      setImageUrl("");
    } catch (error: any) {
      console.error('Erro ao processar:', error);
      
      // Update job with error
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'error', error: error.message }
          : job
      ));
      
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJSON = (job: ProcessedJob) => {
    if (!job.result) return;
    
    const jsonStr = JSON.stringify(job.result, null, 2);
    navigator.clipboard.writeText(jsonStr);
    toast.success("JSON copiado! Cole na Importação em Massa.");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return <Badge variant="outline" className="bg-yellow-50"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processando</Badge>;
      case 'done':
        return <Badge variant="outline" className="bg-green-50"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Erro</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Repórter AI
        </h1>
        <p className="text-muted-foreground mt-1">
          Extração automática de notícias com IA
        </p>
      </div>

      {/* Process Form */}
      <Card>
        <CardHeader>
          <CardTitle>Processar Notícia</CardTitle>
          <CardDescription>
            Cole aqui o LINK da notícia + o LINK da imagem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newsUrl" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Link da Notícia *
            </Label>
            <Input
              id="newsUrl"
              type="url"
              placeholder="https://exemplo.com.br/noticia"
              value={newsUrl}
              onChange={(e) => setNewsUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Link da Imagem (opcional)
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://exemplo.com.br/imagem.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button 
            onClick={handleProcess} 
            disabled={loading || !newsUrl.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Processar Agora
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results History */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Processamento</CardTitle>
            <CardDescription>
              Últimas notícias processadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(job.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">
                        {job.url}
                      </p>
                    </div>
                  </div>

                  {job.status === 'done' && job.result && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCopyJSON(job)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar JSON
                      </Button>
                    </div>
                  )}

                  {job.status === 'error' && job.error && (
                    <Alert variant="destructive">
                      <AlertDescription className="text-xs">
                        {job.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved History from Database */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico Salvo</CardTitle>
            <CardDescription>
              JSONs salvos no banco de dados (últimos 20)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium truncate">{item.news_url}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const jsonStr = JSON.stringify(item.generated_json, null, 2);
                          navigator.clipboard.writeText(jsonStr);
                          toast.success("JSON copiado!");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteFromHistory(item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Como usar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Cole a URL da notícia e clique em "Processar Agora"</li>
            <li>Aguarde o processamento (geralmente 30-60 segundos)</li>
            <li>Quando concluído, clique em "Copiar JSON"</li>
            <li>Vá em <strong>Importar em Massa</strong> e cole o JSON</li>
            <li>Clique em "Importar Notícias" para publicar</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReporterAIv2;
