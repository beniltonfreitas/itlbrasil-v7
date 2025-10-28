import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Link2, Image, AlertCircle, Loader2, Clock, CheckCircle, FileText, Copy } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReporterJob {
  id: string;
  input_type: 'url' | 'texto';
  payload: {
    conteudo: string;
    imageUrl?: string;
  };
  status: 'queued' | 'processing' | 'done' | 'error';
  progress: number;
  result?: any;
  error?: string;
  created_at: string;
  updated_at: string;
}

const ReporterAIv2 = () => {
  const [newsUrl, setNewsUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<ReporterJob[]>([]);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      // @ts-ignore - Table will exist after migration is applied
      const { data, error } = await supabase
        .from('reporter_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      // @ts-ignore
      setJobs(data || []);

      // Check if there are active jobs
      // @ts-ignore
      const hasActive = data?.some(j => j.status === 'queued' || j.status === 'processing');
      if (hasActive && !polling) {
        startPolling();
      }
    } catch (error) {
      console.error('Erro ao buscar jobs:', error);
    }
  };

  const startPolling = () => {
    if (polling) return;
    
    setPolling(true);
    const interval = setInterval(async () => {
      await fetchJobs();
      
      // Stop polling if no active jobs
      const hasActive = jobs.some(j => j.status === 'queued' || j.status === 'processing');
      if (!hasActive) {
        clearInterval(interval);
        setPolling(false);
      }
    }, 3000); // Poll every 3 seconds
  };

  const handleAddToQueue = async () => {
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

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('reporter-queue', {
        body: { 
          tipo: 'url',
          conteudo: newsUrl.trim(),
          imageUrl: imageUrl.trim() || undefined
        }
      });

      if (error) throw error;

      toast.success("Notícia adicionada à fila! Acompanhe o progresso abaixo.");
      setNewsUrl("");
      setImageUrl("");
      
      await fetchJobs();
      startPolling();
    } catch (error: any) {
      console.error('Erro ao adicionar à fila:', error);
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJSON = (job: ReporterJob) => {
    if (!job.result) return;
    
    const jsonStr = JSON.stringify(job.result, null, 2);
    navigator.clipboard.writeText(jsonStr);
    toast.success("JSON copiado! Cole na Importação em Massa.");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'queued':
        return <Badge variant="outline" className="bg-blue-50"><Clock className="h-3 w-3 mr-1" />Na fila</Badge>;
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
          Repórter AI v2.0
        </h1>
        <p className="text-muted-foreground mt-1">
          Sistema de fila para extração automática de notícias
        </p>
      </div>

      {/* Add to Queue Form */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar à Fila</CardTitle>
          <CardDescription>
            Cole o link da notícia para processar em background
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
            onClick={handleAddToQueue} 
            disabled={loading || !newsUrl.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adicionando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Adicionar à Fila
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Jobs Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fila de Processamento</CardTitle>
              <CardDescription>
                Últimos 10 jobs {polling && <span className="text-green-600">(atualizando...)</span>}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchJobs}>
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum job na fila. Adicione uma notícia acima.</p>
            </div>
          ) : (
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
                        {job.payload.conteudo}
                      </p>
                    </div>
                  </div>

                  {job.status === 'processing' && (
                    <div className="space-y-2">
                      <Progress value={job.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">{job.progress}% concluído</p>
                    </div>
                  )}

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
          )}
        </CardContent>
      </Card>

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
            <li>Cole a URL da notícia e clique em "Adicionar à Fila"</li>
            <li>O job será processado em background (aguarde 1-2 minutos)</li>
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
