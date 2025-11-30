import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Check, Link2, AlertCircle, Loader2, FileJson, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ParsedItem {
  newsUrl: string;
  imageUrl?: string;
}

const JsonGenerator = () => {
  const [input, setInput] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [generatedJson, setGeneratedJson] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inputDirty, setInputDirty] = useState(false);

  const parseInput = () => {
    const lines = input.split("\n").filter(line => line.trim());
    
    if (lines.length === 0) {
      toast.error("Cole pelo menos 1 link de notícia.");
      return false;
    }

    if (lines.length > 10) {
      toast.error("Máximo de 10 links por vez.");
      return false;
    }

    const items: ParsedItem[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(/[|;]/).map(p => p.trim());
      const newsUrl = parts[0];
      const rawImageUrl = parts[1];
      
      // Normaliza casos em que a URL da imagem vem duplicada (ex: .../smart/https://site.com/arquivo.jpg)
      let imageUrl = rawImageUrl;
      if (imageUrl && imageUrl.includes('https://')) {
        const segments = imageUrl.split('https://').filter(Boolean);
        if (segments.length > 1) {
          imageUrl = 'https://' + segments[segments.length - 1];
        }
      }

      if (!newsUrl.match(/^https?:\/\/.+/)) {
        errors.push(`Linha ${index + 1}: URL inválida`);
        return;
      }

      if (imageUrl && !imageUrl.match(/^https?:\/\/.+/)) {
        errors.push(`Linha ${index + 1}: URL da imagem inválida`);
        return;
      }

      items.push({ newsUrl, imageUrl });
    });

    if (errors.length > 0) {
      toast.error(errors.join("\n"));
      return false;
    }

    setParsedItems(items);
    setInputDirty(false);
    toast.success(`${items.length} ${items.length === 1 ? 'item detectado' : 'itens detectados'}`);
    return true;
  };

  const removeItem = (index: number) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    // Se não há itens parseados, tenta parsear automaticamente
    if (parsedItems.length === 0) {
      const success = parseInput();
      if (!success) return;
    }

    setLoading(true);
    setGeneratedJson("");

    try {
      console.log('[JsonGenerator] Iniciando geração ITEM A ITEM com', parsedItems.length, 'itens');

      const CONCURRENCY = 3;

      const queue = [...parsedItems];
      const noticiasAgregadas: any[] = [];
      const falhas: { url: string; reason: string }[] = [];

      const processItem = async (item: ParsedItem) => {
        // Timeout de 60s por item
        const perItemTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('ITEM_TIMEOUT')), 60000)
        );

        const invokePromise = supabase.functions.invoke('reporter-ai', {
          body: { newsUrl: item.newsUrl, imageUrl: item.imageUrl }
        });

        const result = await Promise.race([invokePromise, perItemTimeout]) as any;
        const { data, error: functionError } = result || {};

        if (functionError) {
          console.error('[JsonGenerator] Erro detalhado:', {
            name: functionError.name,
            message: functionError.message,
            status: functionError.status,
            details: functionError
          });

          if (functionError.name === 'FunctionsFetchError' ||
              (functionError.message && functionError.message.includes('Failed to send a request'))) {
            throw new Error('🔌 Não foi possível contatar o servidor. Verifique: 1) Se a função reporter-ai está deployada 2) Se LOVABLE_API_KEY está configurada nos Secrets do Cloud 3) Se há créditos disponíveis no Lovable AI');
          }

          if (functionError.message?.includes('402') || functionError.message?.includes('CREDITS_INSUFFICIENT')) {
            throw new Error('❌ Créditos insuficientes no Lovable AI. Adicione créditos em Settings > Workspace > Usage.');
          } else if (functionError.message?.includes('429')) {
            throw new Error('⏱️ Limite de requisições atingido. Aguarde alguns minutos e tente novamente.');
          } else if (functionError.message?.includes('408') || functionError.message?.includes('Timeout')) {
            throw new Error('⏱️ Timeout: o processamento do item está demorando. Tente novamente.');
          } else if (functionError.message?.includes('LOVABLE_API_KEY')) {
            throw new Error('🔑 LOVABLE_API_KEY não está configurada. Acesse Cloud > Secrets e configure a chave.');
          } else {
            throw new Error(`Erro: ${functionError.message || 'Desconhecido'}. Verifique os logs do console para mais detalhes.`);
          }
        }

        if (!data || !data.success) {
          const reason = data?.error || 'Erro ao gerar JSON do item';
          return { ok: false as const, reason };
        }

        const noticias = data.json?.noticias || [];
        return { ok: true as const, noticias };
      };

      const runners: Promise<void>[] = [];
      for (let i = 0; i < CONCURRENCY; i++) {
        runners.push((async () => {
          while (queue.length > 0) {
            const item = queue.shift()!;
            try {
              const res = await processItem(item);
              if (res.ok) {
                noticiasAgregadas.push(...res.noticias);
              } else {
                falhas.push({ url: item.newsUrl, reason: res.reason });
              }
            } catch (e) {
              const msg = e instanceof Error ? e.message : 'Erro desconhecido';
              falhas.push({ url: item.newsUrl, reason: msg });
              // Se for erro de transporte/crítico, continue mas informe no final
            }
          }
        })());
      }

      await Promise.all(runners);

      if (noticiasAgregadas.length === 0) {
        throw new Error('Nenhuma notícia foi processada com sucesso.');
      }

      const jsonFinal = { noticias: noticiasAgregadas };
      const jsonFormatted = JSON.stringify(jsonFinal, null, 2);
      setGeneratedJson(jsonFormatted);

      if (falhas.length > 0) {
        console.warn('[JsonGenerator] Itens que falharam:', falhas);
        toast.warning(`⚠️ ${falhas.length} ${falhas.length === 1 ? 'item falhou' : 'itens falharam'}. JSON gerado com os itens válidos.`, {
          duration: 5000
        });
      } else {
        toast.success(`✅ ${noticiasAgregadas.length} ${noticiasAgregadas.length === 1 ? 'notícia processada' : 'notícias processadas'}. Pronto para importação em massa!`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      if (errorMessage === 'ITEM_TIMEOUT') {
        toast.error('⏱️ Timeout em um item. Tente novamente ou reduza a quantidade.', { duration: 6000 });
      } else {
        toast.error(errorMessage, { duration: 5000 });
      }
      console.error('[JsonGenerator] Erro final:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedJson);
    setCopied(true);
    toast.success("JSON copiado! Cole na Importação em Massa.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setParsedItems([]);
    setGeneratedJson("");
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] p-6">
      <Card className="max-w-5xl mx-auto p-8 bg-[#1E1E1E] border-[#5B3BE8]/20">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <FileJson className="w-8 h-8 text-[#5B3BE8]" />
              Gerador de JSON - Repórter Pró
            </h1>
            <p className="text-gray-400">
              Cole de 1 a 10 links de notícia (um por linha). Opcionalmente, adicione o link da imagem separado por | ou ;
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="links" className="text-white mb-2 block">
                🔗 Links das Notícias (1 por linha)
              </Label>
              <Textarea
                id="links"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (parsedItems.length > 0) {
                    setInputDirty(true);
                  }
                }}
                placeholder="https://exemplo.com.br/noticia-1&#10;https://exemplo.com.br/noticia-2 | https://exemplo.com.br/imagem.jpg&#10;https://exemplo.com.br/noticia-3"
                className="min-h-[200px] bg-[#2B2B2B] border-[#5B3BE8]/30 text-white font-mono text-sm"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={parseInput}
                disabled={loading || !input.trim()}
                className="bg-[#5B3BE8] hover:bg-[#5B3BE8]/80 text-white"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Analisar Links
              </Button>
              {parsedItems.length > 0 && (
                <Button
                  onClick={handleGenerate}
                  disabled={loading || inputDirty}
                  className="bg-[#5B3BE8] hover:bg-[#5B3BE8]/80 text-white"
                  title={inputDirty ? "O texto foi modificado. Clique em 'Analisar Links' novamente." : ""}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileJson className="w-4 h-4 mr-2" />
                      ⚡ Gerar JSON
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={handleClear}
                variant="outline"
                className="border-[#5B3BE8]/30 text-gray-400 hover:text-white hover:bg-[#2B2B2B]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>

          {parsedItems.length > 0 && (
            <div className="space-y-2">
              <Label className="text-white">
                📋 Itens Detectados ({parsedItems.length})
              </Label>
              <div className="space-y-2">
                {parsedItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-[#2B2B2B] rounded-lg border border-[#5B3BE8]/20"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-white truncate">{item.newsUrl}</p>
                      {item.imageUrl && (
                        <p className="text-xs text-gray-400 truncate">🖼️ {item.imageUrl}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {generatedJson && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white">📦 JSON Gerado</Label>
                <Button
                  onClick={handleCopy}
                  size="sm"
                  className="bg-[#5B3BE8] hover:bg-[#5B3BE8]/80 text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar JSON
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                value={generatedJson}
                readOnly
                className="min-h-[400px] bg-[#2B2B2B] border-[#5B3BE8]/30 text-[#FFD24C] font-mono text-sm"
              />
            </div>
          )}

          <Alert className="bg-[#2B2B2B] border-[#5B3BE8]/30">
            <AlertCircle className="h-4 w-4 text-[#5B3BE8]" />
            <AlertDescription className="text-gray-300 ml-2">
              <strong className="text-white">Como usar:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Cole os links das notícias (1 por linha)</li>
                <li>Opcional: adicione | ou ; seguido do link da imagem</li>
                <li>Clique em "Analisar Links" para validar</li>
                <li>Clique em "⚡ Gerar JSON" e aguarde (10-30s por item)</li>
                <li>Copie o JSON gerado e cole em "Importação em Massa"</li>
              </ol>
              <p className="mt-3 text-sm text-gray-400">
                ⏱️ Tempo médio: 10-20 segundos por notícia. O JSON gerado está no formato padrão Repórter Pró com imagem (hero/og/card/alt/credito), 12 tags, SEO otimizado e HTML semântico.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </Card>
    </div>
  );
};

export default JsonGenerator;
