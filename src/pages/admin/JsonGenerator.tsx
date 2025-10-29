import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Copy, Check, Link2, Image, AlertCircle, Loader2, FileJson } from "lucide-react";
import { toast } from "sonner";

const JsonGenerator = () => {
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
      toast.success("JSON copiado! Cole na Importação em Massa.");
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
          <FileJson className="h-8 w-8" style={{ color: '#5B3BE8' }} />
          Gerador de JSON - Padrão Repórter Pró
        </h1>
        <p className="text-muted-foreground mt-1">
          Insira o link da matéria e imagem. O sistema gerará o JSON pronto para importação em massa.
        </p>
      </div>

      <Card className="border-[#5B3BE8]/20" style={{ backgroundColor: '#1E1E1E' }}>
        <CardHeader>
          <CardTitle className="text-white">📰 Gerador de JSON</CardTitle>
          <CardDescription className="text-gray-300">
            Cole o link da notícia (Agência Brasil, etc.) e o link da imagem-base. O sistema gerará o JSON formatado automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newsUrl" className="flex items-center gap-2 text-white">
              <Link2 className="h-4 w-4" />
              🔗 Link da Notícia *
            </Label>
            <Input
              id="newsUrl"
              type="url"
              placeholder="https://agenciabrasil.ebc.com.br/..."
              value={newsUrl}
              onChange={(e) => setNewsUrl(e.target.value)}
              disabled={loading}
              className="bg-[#2B2B2B] border-[#5B3BE8]/30 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-2 text-white">
              <Image className="h-4 w-4" />
              🖼️ Link da Imagem (opcional)
            </Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://imagens.ebc.com.br/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={loading}
              className="bg-[#2B2B2B] border-[#5B3BE8]/30 text-white placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-400">
              Se não informado, a IA tentará extrair a imagem principal da notícia
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate} 
              disabled={loading || !newsUrl.trim()}
              className="flex-1 text-white font-semibold"
              style={{ backgroundColor: '#5B3BE8' }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando JSON...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  ⚡ Gerar JSON
                </>
              )}
            </Button>
            
            {(generatedJson || error) && (
              <Button 
                variant="outline" 
                onClick={handleClear}
                disabled={loading}
                className="bg-[#2B2B2B] border-[#5B3BE8]/30 text-white hover:bg-[#3B3B3B]"
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
        <Card className="border-[#5B3BE8]/20" style={{ backgroundColor: '#1E1E1E' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">📦 Resultado</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="gap-2 bg-[#2B2B2B] border-[#5B3BE8]/30 text-white hover:bg-[#3B3B3B]"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    📋 Copiar JSON
                  </>
                )}
              </Button>
            </div>
            <CardDescription className="text-gray-300">
              O JSON gerado aparecerá aqui. Copie e cole na <strong>Importação em Massa</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedJson}
              readOnly
              className="font-mono text-sm min-h-[400px] bg-[#2B2B2B] border-[#5B3BE8]/30"
              style={{ color: '#FFD24C' }}
            />
          </CardContent>
        </Card>
      )}

      <Card className="border-[#5B3BE8]/20" style={{ backgroundColor: '#1E1E1E' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#5B3BE8' }}>
            <AlertCircle className="h-5 w-5" />
            💡 Como usar o Gerador JSON
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium mb-2 text-white">📋 Passo a passo:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
              <li>Acesse <strong>Repórter AI → Gerador JSON</strong></li>
              <li>Informe o link da notícia (obrigatório)</li>
              <li>Informe o link da imagem (opcional)</li>
              <li>Clique em <strong>"⚡ Gerar JSON"</strong></li>
              <li>Aguarde 10-20 segundos (processamento IA)</li>
              <li>O JSON aparecerá formatado na área de resultado</li>
              <li>Clique em <strong>"📋 Copiar JSON"</strong></li>
              <li>Vá para <strong>Importar em Massa</strong> e cole o JSON</li>
            </ol>
          </div>

          <div className="p-4 bg-[#2B2B2B] rounded-lg border border-[#5B3BE8]/20 space-y-3">
            <p className="font-medium text-sm text-white">✅ Formato JSON gerado:</p>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <code className="bg-[#1E1E1E] px-2 py-0.5 rounded font-mono" style={{ color: '#FFD24C' }}>
                  categoria
                </code>
                <span>Automaticamente classificada pela IA</span>
              </li>
              <li className="flex items-start gap-2">
                <code className="bg-[#1E1E1E] px-2 py-0.5 rounded font-mono" style={{ color: '#FFD24C' }}>
                  titulo
                </code>
                <span>Extraído e formatado pela IA</span>
              </li>
              <li className="flex items-start gap-2">
                <code className="bg-[#1E1E1E] px-2 py-0.5 rounded font-mono" style={{ color: '#FFD24C' }}>
                  slug
                </code>
                <span>Gerado automaticamente</span>
              </li>
              <li className="flex items-start gap-2">
                <code className="bg-[#1E1E1E] px-2 py-0.5 rounded font-mono" style={{ color: '#FFD24C' }}>
                  imagem
                </code>
                <span>Objeto com hero, og, card, alt e credito</span>
              </li>
              <li className="flex items-start gap-2">
                <code className="bg-[#1E1E1E] px-2 py-0.5 rounded font-mono" style={{ color: '#FFD24C' }}>
                  tags
                </code>
                <span>12 tags relevantes geradas pela IA</span>
              </li>
              <li className="flex items-start gap-2">
                <code className="bg-[#1E1E1E] px-2 py-0.5 rounded font-mono" style={{ color: '#FFD24C' }}>
                  seo
                </code>
                <span>Meta título e descrição otimizados</span>
              </li>
            </ul>
          </div>

          <Alert className="bg-[#2B2B2B] border-[#5B3BE8]/30">
            <AlertCircle className="h-4 w-4" style={{ color: '#5B3BE8' }} />
            <AlertDescription className="text-xs text-gray-300">
              <strong className="text-white">Tecnologia:</strong> Este gerador usa <strong style={{ color: '#5B3BE8' }}>Lovable AI (Gemini 2.5 Flash)</strong> para 
              extrair, processar e formatar notícias automaticamente no padrão Repórter Pró v2.1.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default JsonGenerator;
