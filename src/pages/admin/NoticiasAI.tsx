import { useState, useRef } from "react";
import { Newspaper, Send, Trash2, Copy, Check, Loader2, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { uploadImageToStorage } from "@/lib/imageUpload";
import { useCreateArticle } from "@/hooks/useArticleMutations";
import { useCategories } from "@/hooks/useCategories";

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

  const createArticle = useCreateArticle();
  const { data: categories } = useCategories();

  const detectInputType = (text: string): "EXCLUSIVA" | "CADASTRO_MANUAL" | "JSON" | "LINK" | "TEXT" => {
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

    try {
      for (const noticia of jsonData.noticias) {
        try {
          const categoryId = findCategoryId(noticia.categoria);
          
          await createArticle.mutateAsync({
            title: noticia.titulo,
            slug: noticia.slug,
            excerpt: noticia.resumo,
            content: noticia.conteudo,
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
          
          successCount++;
        } catch (err) {
          console.error("Erro ao importar notícia:", noticia.titulo, err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} notícia(s) importada(s) com sucesso!`);
        handleClear();
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

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Digite ou cole o conteúdo da notícia");
      return;
    }

    setIsLoading(true);
    const inputType = detectInputType(input);

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
        } else {
          setActiveTab("cadastro");
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

    return (
      <div className="space-y-4">
        <div className="flex justify-end gap-2">
          {hasNoticias && (
            <Button
              size="sm"
              onClick={handleImportNews}
              disabled={isImporting}
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
                </>
              )}
            </Button>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Newspaper className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Notícias AI</h1>
          <p className="text-muted-foreground">
            Chat inteligente para processamento editorial de notícias
          </p>
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
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setInput("EXCLUSIVA\n\n")}>
              EXCLUSIVA
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setInput("CADASTRO MANUAL\n\n")}>
              CADASTRO MANUAL
            </Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setInput("JSON\n\n")}>
              JSON
            </Badge>
          </div>

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
              className="border-primary text-primary hover:bg-primary/10"
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
            placeholder="Digite EXCLUSIVA, CADASTRO MANUAL, JSON ou cole a notícia completa..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[200px] text-sm"
          />

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !input.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cadastro">Cadastro Manual</TabsTrigger>
              <TabsTrigger value="json">JSON (Repórter Pró)</TabsTrigger>
            </TabsList>
            <TabsContent value="cadastro" className="mt-4">
              {renderCadastroManual()}
            </TabsContent>
            <TabsContent value="json" className="mt-4">
              {renderJSON()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📌 Como Usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-red-600">🔴 EXCLUSIVA</h4>
            <p className="text-muted-foreground">
              Comece com "EXCLUSIVA" para manter o texto original sem alterações. Gera Cadastro Manual + JSON.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-orange-600">🟠 CADASTRO MANUAL</h4>
            <p className="text-muted-foreground">
              Comece com "CADASTRO MANUAL" para gerar apenas o formato do painel administrativo.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-green-600">🟢 JSON / LINK</h4>
            <p className="text-muted-foreground">
              Comece com "JSON" ou cole um link de matéria para gerar o formato Repórter Pró.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoticiasAI;
