import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Download, Upload, Loader2, CheckCircle, XCircle, Copy, AlertCircle } from 'lucide-react';
import { useJornalistaProTools } from '@/hooks/useJornalistaProTools';
import { useBulkNewsImport } from '@/hooks/useBulkNewsImport';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FIXED_CATEGORIES } from '@/lib/newsUtils';

export default function JornalistaProTools() {
  const [urls, setUrls] = useState('');
  const [generatedJson, setGeneratedJson] = useState<any>(null);
  const [rewriteWithAI, setRewriteWithAI] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { generateJson, isLoading } = useJornalistaProTools();
  const { importing, progress, results, validateJSON, importNews } = useBulkNewsImport();
  const { toast } = useToast();

  const cleanUrls = (rawText: string): string[] => {
    return rawText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Remove numeração: "1) ", "1. ", "1- ", etc.
        return line.replace(/^\d+[\)\.\-\s]+/, '').trim();
      })
      .filter(url => {
        // Validação básica de URL
        return url.startsWith('http://') || url.startsWith('https://');
      });
  };

  const handleGenerateJson = async () => {
    const urlList = cleanUrls(urls);
    
    if (urlList.length === 0) {
      toast({
        title: 'Erro',
        description: 'Por favor, cole pelo menos um link de notícia válido (deve começar com http:// ou https://).',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Processando...',
      description: `${urlList.length} URL(s) encontrada(s) e validada(s).`,
    });

    try {
      const result = await generateJson(urlList);
      setGeneratedJson(result);
      toast({
        title: 'Sucesso!',
        description: `${result.noticias?.length || 0} notícia(s) processada(s) com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Não foi possível processar os links.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyJson = async () => {
    if (!generatedJson) return;

    try {
      await navigator.clipboard.writeText(JSON.stringify(generatedJson, null, 2));
      toast({
        title: 'JSON Copiado!',
        description: 'O JSON foi copiado para a área de transferência.',
      });
    } catch (error) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = JSON.stringify(generatedJson, null, 2);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: 'JSON Copiado!',
        description: 'O JSON foi copiado para a área de transferência.',
      });
    }
  };

  const handleDownloadJson = () => {
    if (!generatedJson) return;

    const blob = new Blob([JSON.stringify(generatedJson, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `noticias-jornalista-pro-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download iniciado',
      description: 'O arquivo JSON foi baixado com sucesso.',
    });
  };

  const handleImport = async () => {
    if (!generatedJson) {
      toast({
        title: 'Erro',
        description: 'Não há JSON para importar. Gere primeiro.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setValidationError(null);
      
      // Validar JSON antes de importar
      const jsonString = JSON.stringify(generatedJson);
      const validation = validateJSON(jsonString);
      
      if (!validation.success) {
        setValidationError(validation.error || 'JSON inválido');
        toast({
          title: 'Erro de Validação',
          description: validation.error || 'JSON inválido',
          variant: 'destructive',
        });
        return;
      }

      // Importar notícias
      const result = await importNews(validation.data!, { rewriteWithAI });

      // Limpar campos apenas se tudo foi importado com sucesso
      if (result.success) {
        setUrls('');
        setGeneratedJson(null);
        setValidationError(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao importar';
      setValidationError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Jornalista Pró</h1>
      </div>

      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          Cole os links de notícias (um por linha) e deixe a IA reescrever e formatar automaticamente para importação no painel.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Gerador de Notícias com IA</CardTitle>
          <CardDescription>
            Cole os links das notícias que deseja importar e reescrever
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="Cole aqui os links das notícias que deseja importar...&#10;https://exemplo.com/noticia-1&#10;https://exemplo.com/noticia-2"
            className="min-h-[150px] font-mono text-sm"
            disabled={isLoading}
          />
          
          <Button 
            onClick={handleGenerateJson} 
            disabled={isLoading || !urls.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando com IA...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar JSON
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedJson && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pré-visualização JSON</CardTitle>
              <CardDescription>
                Revise o JSON gerado antes de importar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {validationError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    <div className="space-y-3">
                      <p className="font-medium">Erro de Validação do JSON:</p>
                      <pre className="text-xs bg-destructive/10 p-3 rounded overflow-auto max-h-32 font-mono">
                        {validationError}
                      </pre>
                      
                      <div className="border-t border-destructive/20 pt-3">
                        <p className="font-medium mb-2">Formato esperado:</p>
                        <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48 font-mono">
{`{
  "noticias": [
    {
      "categoria": "Esportes",
      "titulo": "Título da notícia",
      "slug": "titulo-da-noticia",
      "resumo": "Resumo breve (max 160)",
      "conteudo": "<p>Conteúdo HTML...</p>",
      "fonte": "https://url-original.com",
      "imagem": "https://imagem.jpg",
      "credito": "Fotógrafo/Agência",
      "tags": ["tag1", "tag2"],
      "seo": {
        "meta_titulo": "Título SEO (max 60)",
        "meta_descricao": "Desc SEO (max 160)"
      }
    }
  ]
}`}</pre>
                      </div>
                      
                      <div className="border-t border-destructive/20 pt-3">
                        <p className="font-medium mb-1">Limites de caracteres:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li><strong>Título:</strong> máximo 120 caracteres</li>
                          <li><strong>Resumo:</strong> máximo 160 caracteres</li>
                          <li><strong>Meta Título:</strong> máximo 60 caracteres</li>
                          <li><strong>Meta Descrição:</strong> máximo 160 caracteres</li>
                          <li><strong>Cada tag:</strong> máximo 20 caracteres</li>
                        </ul>
                      </div>
                      
        <div className="border-t border-destructive/20 pt-3">
          <p className="font-medium mb-1">Categorias válidas:</p>
          <p className="text-xs">{FIXED_CATEGORIES.join(", ")}</p>
        </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px]">
                <pre className="text-sm">
                  {JSON.stringify(generatedJson, null, 2)}
                </pre>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="rewrite-ai-tools" 
                    checked={rewriteWithAI}
                    onChange={(e) => setRewriteWithAI(e.target.checked)}
                    disabled={importing}
                    className="rounded border-border"
                  />
                  <label htmlFor="rewrite-ai-tools" className="text-sm">
                    Reescrever mantendo o tamanho da fonte (quando `fonte` presente)
                  </label>
                </div>

                {importing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Importando notícias...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleCopyJson}
                    variant="outline"
                    disabled={importing}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar
                  </Button>
                  
                  <Button 
                    onClick={handleDownloadJson}
                    variant="outline"
                    className="flex-1"
                    disabled={importing}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar JSON
                  </Button>
                  
                  <Button 
                    onClick={handleImport}
                    disabled={importing}
                    className="flex-1"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Importar para o Painel
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resultado da Geração</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  ✓ {generatedJson.noticias?.length || 0} notícia(s) processada(s)
                </p>
                {generatedJson.noticias?.map((noticia: any, index: number) => (
                  <div key={index} className="text-sm border-l-2 border-primary pl-3 py-1">
                    <p className="font-medium">{noticia.titulo}</p>
                    <p className="text-muted-foreground text-xs">
                      {noticia.categoria} • {noticia.tags?.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado da Importação</CardTitle>
            <CardDescription>
              {results.filter(r => r.success).length} importadas | {results.filter(r => !r.success).length} com erro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.filter(r => r.success).length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Importadas com Sucesso ({results.filter(r => r.success).length})
                </h3>
                <div className="space-y-1">
                  {results.filter(r => r.success).map((result, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded">
                      <span className="text-sm">{result.title}</span>
                      <Badge variant="outline" className="text-green-600">
                        <a href={`/noticia/${result.slug}`} target="_blank" rel="noopener noreferrer">
                          Ver notícia
                        </a>
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.filter(r => !r.success).length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-red-600 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Erros na Importação ({results.filter(r => !r.success).length})
                </h3>
                <div className="space-y-1">
                  {results.filter(r => !r.success).map((result, idx) => (
                    <div key={idx} className="p-2 bg-red-50 dark:bg-red-950 rounded">
                      <p className="text-sm font-medium">{result.title}</p>
                      <p className="text-xs text-red-600">{result.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
