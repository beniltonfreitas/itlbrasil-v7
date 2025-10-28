import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Copy, Check, Link2, Image, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ReporterAI = () => {
  const [newsUrl, setNewsUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [generatedJson, setGeneratedJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!newsUrl.trim()) {
      toast.error("Por favor, insira a URL da notícia");
      return;
    }

    // Validate URL format
    try {
      new URL(newsUrl);
    } catch {
      toast.error("URL inválida. Por favor, insira uma URL completa (ex: https://exemplo.com/noticia)");
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
    setError("");
    setGeneratedJson("");

    try {
      const { data, error: functionError } = await supabase.functions.invoke('reporter-ai', {
        body: { 
          newsUrl: newsUrl.trim(),
          imageUrl: imageUrl.trim() || undefined
        }
      });

      if (functionError) {
        throw functionError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao gerar JSON');
      }

      const formattedJson = JSON.stringify(data.json, null, 2);
      setGeneratedJson(formattedJson);
      toast.success("JSON gerado com sucesso!");
    } catch (err) {
      console.error('Error generating JSON:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error(`Erro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedJson) return;
    
    try {
      await navigator.clipboard.writeText(generatedJson);
      setCopied(true);
      toast.success("JSON copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Erro ao copiar JSON");
    }
  };

  const handleClear = () => {
    setNewsUrl("");
    setImageUrl("");
    setGeneratedJson("");
    setError("");
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Repórter AI
        </h1>
        <p className="text-muted-foreground mt-1">
          Extraia notícias automaticamente usando Inteligência Artificial
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Extrair Notícia</CardTitle>
          <CardDescription>
            Cole o link da notícia e, opcionalmente, o link da imagem. O Repórter AI irá extrair e formatar 
            automaticamente o conteúdo no formato JSON para importação em massa.
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
            <p className="text-xs text-muted-foreground">
              Se não informado, a IA tentará extrair a imagem principal da notícia
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate} 
              disabled={loading || !newsUrl.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando JSON...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar JSON
                </>
              )}
            </Button>
            
            {(generatedJson || error) && (
              <Button 
                variant="outline" 
                onClick={handleClear}
                disabled={loading}
              >
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {generatedJson && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>JSON Gerado</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
            <CardDescription>
              Copie este JSON e cole na área de <strong>Importação em Massa</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedJson}
              readOnly
              className="font-mono text-xs min-h-[400px]"
            />
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Como usar:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Cole o link da notícia que deseja extrair</li>
            <li>Opcionalmente, cole o link de uma imagem específica</li>
            <li>Clique em "Gerar JSON" e aguarde</li>
            <li>Copie o JSON gerado</li>
            <li>Vá até <strong>Importar em Massa</strong> e cole o JSON</li>
            <li>Revise e publique a notícia</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ReporterAI;
