import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Loader2,
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateArticle } from "@/hooks/useArticleMutations";
import { useCategories } from "@/hooks/useCategories";
import { useAuthors } from "@/hooks/useAuthors";
import { useArticleRewrite } from "@/hooks/useArticleRewrite";
import { z } from "zod";
import { 
  FIXED_CATEGORIES, 
  generateSlug, 
  ensureWhatsAppCTA, 
  normalizeContent,
  validateImageUrl,
  isHttpsImageUrl,
  normalizeImageInput,
  parseTags,
  generateMissingTags,
  ensureUniqueSlug,
  type ArticleImageObject
} from "@/lib/newsUtils";
import { validateBulkImportJSON, type ValidationReport } from "@/lib/bulkImportValidator";

// Image object schema
const imageObjectSchema = z.object({
  hero: z.string().url().refine(u => u.startsWith("https://"), "Hero deve usar HTTPS"),
  og: z.string().url().refine(u => u.startsWith("https://"), "OG deve usar HTTPS"),
  card: z.string().url().refine(u => u.startsWith("https://"), "Card deve usar HTTPS"),
  alt: z.string().min(5).max(140)
});

const NewsItemSchema = z.object({
  categoria: z.string().refine((val) => [
    "Últimas Notícias", "Justiça", "Política", "Economia", "Educação", 
    "Internacional", "Meio Ambiente", "Direitos Humanos", "Cultura", "Esportes", "Saúde", "Geral"
  ].includes(val), "Categoria deve ser uma das categorias válidas"),
  titulo: z.string()
    .min(6, "Título deve ter pelo menos 6 caracteres")
    .max(120, "Título deve ter no máximo 120 caracteres"),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minúsculas, números e hífens")
    .optional(),
  resumo: z.string()
    .max(160, "Resumo deve ter no máximo 160 caracteres")
    .optional(),
  conteudo: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
  fonte: z.string().url("URL da fonte deve ser válida").optional().or(z.literal("")),
  imagem: z.union([
    z.string().url("URL da imagem inválida"),
    imageObjectSchema
  ])
  .transform(input => normalizeImageInput(input))
  .refine(img => !img.hero || isHttpsImageUrl(img.hero), "Imagem hero deve usar HTTPS e formato válido")
  .optional(),
  credito: z.string().optional(),
  tags: z.union([
    z.string().transform((val) => parseTags(val)),
    z.array(z.string().max(40, "Cada tag deve ter no máximo 40 caracteres"))
  ])
  .transform(arr => {
    const parsed = Array.isArray(arr) ? arr : parseTags(arr);
    return parsed.slice(0, 12);
  }),
  seo: z.object({
    meta_titulo: z.string().max(60, "Meta título deve ter no máximo 60 caracteres").optional(),
    meta_descricao: z.string().max(160, "Meta descrição deve ter no máximo 160 caracteres").optional()
  }).optional()
});

const BulkImportSchema = z.object({
  noticias: z.array(NewsItemSchema)
});

interface ImportResult {
  success: boolean;
  title: string;
  error?: string;
  slug?: string;
}

const BulkNewsImport = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [rewriteWithAI, setRewriteWithAI] = useState(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [validating, setValidating] = useState(false);

  const { toast } = useToast();
  const createArticle = useCreateArticle();
  const rewriteMutation = useArticleRewrite();
  const { data: categories } = useCategories();
  const { data: authors } = useAuthors();

  const handleValidateOnly = () => {
    setValidating(true);
    setValidationReport(null);
    setValidationError(null);
    
    try {
      const result = validateBulkImportJSON(jsonInput);
      setValidationReport(result.report);
      
      if (result.success && result.report.valid) {
        toast({
          title: "✅ JSON válido!",
          description: `${result.report.totalNews} notícia(s) pronta(s) para importar.`,
        });
      } else {
        toast({
          title: "❌ JSON inválido",
          description: "Verifique os erros abaixo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setValidationError("Erro ao validar JSON");
      toast({
        title: "Erro",
        description: "Erro ao validar JSON",
        variant: "destructive"
      });
    } finally {
      setValidating(false);
    }
  };

  const validateJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const validated = BulkImportSchema.parse(parsed);
      setValidationError(null);
      return validated;
    } catch (error) {
        if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(e => {
          if (e.path.includes('imagem') && e.message.includes('object')) {
            return `${e.path.join('.')}: O campo imagem deve ser URL (string). Remova objetos {url, credito} e use imagem: 'https://...' + credito: 'Autor/Agência'`;
          }
          return `${e.path.join('.')}: ${e.message}`;
        });
        setValidationError(`Erro de validação: ${errorMessages.join(' | ')}`);
      } else {
        setValidationError("JSON inválido. Verifique a estrutura.");
      }
      return null;
    }
  };

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    try {
      return JSON.stringify(err);
    } catch {
      return 'Erro desconhecido';
    }
  };

  const getCategoryId = (categoryName: string) => {
    const category = categories?.find(
      c => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (!category) {
      console.warn(`Categoria "${categoryName}" não encontrada. Categorias disponíveis:`, categories?.map(c => c.name));
    }
    return category?.id;
  };

  const getDefaultAuthorId = () => {
    const defaultAuthor = authors?.find(
      a => a.name.toLowerCase().includes('agência brasil') || 
           a.name.toLowerCase().includes('itl')
    );
    return defaultAuthor?.id || authors?.[0]?.id;
  };

  const handleImport = async () => {
    const validated = validateJSON();
    if (!validated) return;

    setImporting(true);
    setProgress(0);
    setResults([]);

    const authorId = getDefaultAuthorId();
    if (!authorId) {
      toast({
        title: "Erro",
        description: "Nenhum autor encontrado. Crie um autor antes de importar.",
        variant: "destructive"
      });
      setImporting(false);
      return;
    }

    console.log('📦 Iniciando importação com autor:', authorId);
    console.log('📊 Total de notícias:', validated.noticias.length);

    const totalNews = validated.noticias.length;
    const importResults: ImportResult[] = [];

    for (let i = 0; i < validated.noticias.length; i++) {
      const noticia = validated.noticias[i];
      
      try {
        console.log(`\n📰 [${i + 1}/${totalNews}] Processando:`, noticia.titulo);
        
        const categoryId = getCategoryId(noticia.categoria);
        if (!categoryId) {
          throw new Error(`Categoria "${noticia.categoria}" não encontrada no sistema`);
        }
        console.log('✓ Categoria encontrada:', noticia.categoria, '→', categoryId);
        
        // Auto-generate slug if missing
        const finalSlug = await ensureUniqueSlug(noticia.slug || generateSlug(noticia.titulo));
        console.log('✓ Slug gerado:', finalSlug);
        
        // Handle AI rewriting if enabled and source available
        let finalContent = noticia.conteudo;
        if (rewriteWithAI && noticia.fonte) {
          try {
            console.log('🤖 Reescrevendo com IA...');
            const rewriteResult = await rewriteMutation.mutateAsync({
              sourceUrl: noticia.fonte,
              currentContent: noticia.conteudo,
              preserveCharacterCount: true,
            });
            finalContent = rewriteResult.rewrittenContent;
            console.log('✓ Conteúdo reescrito');
          } catch (rewriteError) {
            console.warn('⚠ Falha ao reescrever, usando conteúdo original:', rewriteError);
          }
        }
        
        // Normalize content (add CTA, structure sections)
        finalContent = normalizeContent(finalContent);
        
        // Process tags - ensure exactly 12
        let finalTags = noticia.tags || [];
        if (finalTags.length < 12) {
          console.log(`📋 Completando tags (${finalTags.length} → 12)...`);
          finalTags = generateMissingTags(finalTags, noticia.titulo, finalContent);
          console.log('✓ Tags completadas:', finalTags);
        } else if (finalTags.length > 12) {
          console.log(`📋 Limitando tags (${finalTags.length} → 12)...`);
          finalTags = finalTags.slice(0, 12);
        }
        
        const articleData = {
          title: noticia.titulo,
          slug: finalSlug,
          content: finalContent,
          excerpt: noticia.resumo || undefined,
          category_id: categoryId,
          author_id: authorId,
          imagem: noticia.imagem,
          featured_image: noticia.imagem?.hero || undefined, // Backward compatibility
          image_credit: noticia.credito || undefined,
          source_url: noticia.fonte || undefined,
          meta_title: noticia.seo?.meta_titulo || noticia.titulo.substring(0, 60),
          meta_description: noticia.seo?.meta_descricao || noticia.resumo?.substring(0, 160) || undefined,
          featured: false,
          status: "published" as const,
          published_at: new Date().toISOString(),
          tags: finalTags,
          additional_images: []
        };

        console.log('📝 Criando artigo...', {
          title: articleData.title,
          slug: articleData.slug,
          category_id: articleData.category_id,
          author_id: articleData.author_id
        });

        await createArticle.mutateAsync(articleData);
        console.log('✅ Artigo criado com sucesso!');

        importResults.push({
          success: true,
          title: noticia.titulo,
          slug: finalSlug
        });
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error(`❌ Erro ao importar "${noticia.titulo}":`, errorMessage);
        console.error('Detalhes do erro:', error);
        
        importResults.push({
          success: false,
          title: noticia.titulo,
          error: errorMessage
        });
      }

      setProgress(((i + 1) / totalNews) * 100);
    }

    setResults(importResults);
    setImporting(false);

    const successCount = importResults.filter(r => r.success).length;
    const errorCount = importResults.filter(r => !r.success).length;
    const firstError = importResults.find(r => !r.success)?.error;

    console.log(`\n📊 Importação finalizada: ${successCount} sucesso, ${errorCount} erros`);

    toast({
      title: "Importação concluída",
      description: `${successCount} notícias importadas com sucesso. ${errorCount} erros.${firstError ? ` Primeiro erro: ${firstError}` : ''}`,
      variant: errorCount > 0 ? "destructive" : "default"
    });
  };

  const successResults = results.filter(r => r.success);
  const errorResults = results.filter(r => !r.success);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Importação em Massa de Notícias</h1>
        <p className="text-muted-foreground">
          Cole o JSON com as notícias para importar em massa
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Dados JSON</CardTitle>
          <CardDescription>
            Cole aqui o JSON contendo as notícias a serem importadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{"noticias": [...]}'
            className="font-mono text-sm min-h-[300px]"
            disabled={importing}
          />

          {validationError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="rewrite-ai" 
                checked={rewriteWithAI}
                onChange={(e) => setRewriteWithAI(e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="rewrite-ai" className="text-sm">
                Reescrever mantendo o tamanho da fonte (quando `fonte` presente)
              </label>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={validateJSON}
                variant="outline"
                disabled={!jsonInput || importing}
              >
                <FileText className="h-4 w-4 mr-2" />
                Validar JSON
              </Button>
              
              <Button 
                onClick={handleImport}
                disabled={!jsonInput || importing}
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Notícias
                  </>
                )}
              </Button>
            </div>
          </div>

          {importing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Importando...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado da Importação</CardTitle>
            <CardDescription>
              {successResults.length} importadas | {errorResults.length} com erro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {successResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Importadas com Sucesso ({successResults.length})
                </h3>
                <div className="space-y-1">
                  {successResults.map((result, idx) => (
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

            {errorResults.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-red-600 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Erros na Importação ({errorResults.length})
                </h3>
                <div className="space-y-1">
                  {errorResults.map((result, idx) => (
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

      {/* Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>📖 Guia de Importação JSON</CardTitle>
          <CardDescription>
            Documentação completa do formato, validações e exemplos práticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exemplo Principal */}
          <div>
            <h3 className="font-semibold mb-2">✨ Exemplo Completo</h3>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
{`{
  "noticias": [
    {
      "categoria": "Política",
      "titulo": "Congresso aprova nova lei de educação digital",
      "slug": "congresso-aprova-lei-educacao-digital",
      "resumo": "Projeto estabelece diretrizes para ensino de tecnologia nas escolas públicas de todo o país.",
      "conteudo": "<p>O Congresso Nacional aprovou nesta terça-feira...</p><p>A medida entrará em vigor...</p>",
      "fonte": "https://agenciabrasil.ebc.com.br/educacao/noticia/2025-10/congresso-aprova-lei",
      "imagem": {
        "hero": "https://cdn.exemplo.com/congresso-votacao-1200x675.jpg",
        "og": "https://cdn.exemplo.com/congresso-votacao-1200x630.jpg",
        "card": "https://cdn.exemplo.com/congresso-votacao-800x450.jpg",
        "alt": "Plenário do Congresso durante votação da lei de educação digital"
      },
      "credito": "Agência Brasil/EBC",
      "tags": ["política", "educação", "congresso nacional", "tecnologia", "ensino público", "legislação", "brasil", "deputados", "senado", "educação digital", "escolas", "aprovação"],
      "seo": {
        "meta_titulo": "Congresso aprova lei de educação digital nas escolas",
        "meta_descricao": "Nova legislação estabelece diretrizes para ensino de tecnologia nas escolas públicas brasileiras."
      }
    }
  ]
}`}
            </pre>
          </div>

          {/* Formatos de Imagem */}
          <div>
            <h3 className="font-semibold mb-2">🖼️ Formatos de Imagem Aceitos</h3>
            <div className="space-y-3 text-sm">
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded">
                <p className="font-semibold text-green-700 dark:text-green-300 mb-1">✅ RECOMENDADO - Objeto com 3 tamanhos:</p>
                <pre className="text-xs bg-background/50 p-2 rounded mt-1">
{`"imagem": {
  "hero": "https://cdn.site.com/imagem-1200x675.jpg",
  "og": "https://cdn.site.com/imagem-1200x630.jpg",
  "card": "https://cdn.site.com/imagem-800x450.jpg",
  "alt": "Descrição acessível da imagem"
}`}
                </pre>
                <p className="text-xs mt-2">
                  <strong>Dimensões recomendadas:</strong><br />
                  • Hero: 1200x675px (16:9) - Imagem principal do artigo<br />
                  • OG: 1200x630px (1.91:1) - Compartilhamento social<br />
                  • Card: 800x450px (16:9) - Cards e miniaturas
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
                <p className="font-semibold text-blue-700 dark:text-blue-300 mb-1">💡 COMPATIBILIDADE - String única:</p>
                <pre className="text-xs bg-background/50 p-2 rounded mt-1">
{`"imagem": "https://cdn.site.com/imagem.jpg"`}
                </pre>
                <p className="text-xs mt-2">
                  A mesma imagem será usada para hero/og/card automaticamente.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded">
                <p className="font-semibold text-yellow-700 dark:text-yellow-300 mb-1">⚠️ Requisitos obrigatórios:</p>
                <ul className="text-xs mt-1 space-y-1 list-disc list-inside">
                  <li>HTTPS obrigatório (http:// não aceito)</li>
                  <li>Formatos válidos: .jpg, .jpeg, .png, .webp, .gif, .avif</li>
                  <li>Alt text: 5-140 caracteres (obrigatório no objeto)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="font-semibold mb-2">🏷️ Sistema de Tags</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Exatamente 12 tags são obrigatórias</strong> (cada uma com máx. 40 caracteres)</p>
              
              <div className="bg-muted p-3 rounded space-y-2">
                <p className="font-semibold">Formato 1 - Array (recomendado):</p>
                <pre className="text-xs bg-background p-2 rounded">
{`"tags": ["política", "brasil", "economia", "governo", "congresso", 
         "legislação", "reforma", "senado", "câmara", "federal", 
         "deputados", "ministério"]`}
                </pre>

                <p className="font-semibold mt-2">Formato 2 - String separada por vírgula:</p>
                <pre className="text-xs bg-background p-2 rounded">
{`"tags": "política, brasil, economia, governo, congresso, legislação, reforma, senado, câmara, federal, deputados, ministério"`}
                </pre>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
                <p className="text-xs">
                  <strong>✨ Auto-completar:</strong> Se você fornecer menos de 12 tags, o sistema 
                  irá gerar automaticamente tags relevantes com base no título e conteúdo da notícia.
                </p>
              </div>
            </div>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="font-semibold mb-2">📂 Categorias Válidas</h3>
            <div className="bg-muted p-3 rounded">
              <p className="text-sm mb-2">O campo "categoria" deve ser exatamente uma das opções abaixo:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                <Badge variant="outline">Últimas Notícias</Badge>
                <Badge variant="outline">Justiça</Badge>
                <Badge variant="outline">Política</Badge>
                <Badge variant="outline">Economia</Badge>
                <Badge variant="outline">Educação</Badge>
                <Badge variant="outline">Internacional</Badge>
                <Badge variant="outline">Meio Ambiente</Badge>
                <Badge variant="outline">Direitos Humanos</Badge>
                <Badge variant="outline">Cultura</Badge>
                <Badge variant="outline">Esportes</Badge>
                <Badge variant="outline">Saúde</Badge>
                <Badge variant="outline">Geral</Badge>
              </div>
            </div>
          </div>

          {/* Validações */}
          <div>
            <h3 className="font-semibold mb-2">✅ Validações e Limites</h3>
            <div className="bg-muted p-3 rounded text-xs space-y-1">
              <p><strong>titulo:</strong> 6-120 caracteres (obrigatório)</p>
              <p><strong>slug:</strong> opcional, formato: apenas letras minúsculas, números e hífens</p>
              <p><strong>resumo:</strong> máx. 160 caracteres (opcional)</p>
              <p><strong>conteudo:</strong> mín. 10 caracteres, aceita HTML (obrigatório)</p>
              <p><strong>fonte:</strong> URL válida (opcional)</p>
              <p><strong>credito:</strong> texto livre (opcional)</p>
              <p><strong>meta_titulo:</strong> máx. 60 caracteres (opcional)</p>
              <p><strong>meta_descricao:</strong> máx. 160 caracteres (opcional)</p>
            </div>
          </div>

          {/* Troubleshooting */}
          <div>
            <h3 className="font-semibold mb-2">🔧 Solução de Problemas Comuns</h3>
            <div className="space-y-2 text-xs">
              <div className="border-l-4 border-red-500 pl-3 py-1">
                <p className="font-semibold">Erro: "Hero deve usar HTTPS"</p>
                <p className="text-muted-foreground">Todas as URLs de imagem devem começar com https://, não http://</p>
              </div>
              
              <div className="border-l-4 border-red-500 pl-3 py-1">
                <p className="font-semibold">Erro: "Categoria não encontrada"</p>
                <p className="text-muted-foreground">Verifique se a categoria está escrita exatamente como na lista acima (com acentos e maiúsculas)</p>
              </div>
              
              <div className="border-l-4 border-red-500 pl-3 py-1">
                <p className="font-semibold">Erro: "Tags devem ter exatamente 12 itens"</p>
                <p className="text-muted-foreground">Forneça pelo menos 1 tag. Se fornecer menos de 12, o sistema auto-completa</p>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-3 py-1">
                <p className="font-semibold">Dica: Testando antes de importar</p>
                <p className="text-muted-foreground">Use o botão "Validar JSON" para verificar erros antes de importar</p>
              </div>
            </div>
          </div>

          {/* Exemplo Múltiplas Notícias */}
          <div>
            <h3 className="font-semibold mb-2">📰 Importando Múltiplas Notícias</h3>
            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
{`{
  "noticias": [
    {
      "categoria": "Economia",
      "titulo": "Primeira notícia sobre economia",
      "conteudo": "<p>Conteúdo da primeira notícia...</p>",
      "imagem": "https://cdn.site.com/economia-1.jpg",
      "tags": "economia, brasil, mercado, dólar, inflação, juros, banco central, investimentos, pib, crescimento, exportação, importação"
    },
    {
      "categoria": "Esportes",
      "titulo": "Segunda notícia sobre esportes",
      "conteudo": "<p>Conteúdo da segunda notícia...</p>",
      "imagem": {
        "hero": "https://cdn.site.com/esportes-hero.jpg",
        "og": "https://cdn.site.com/esportes-og.jpg",
        "card": "https://cdn.site.com/esportes-card.jpg",
        "alt": "Atleta brasileiro em competição"
      },
      "tags": ["futebol", "brasil", "copa", "seleção", "jogador", "técnico", "campeonato", "vitória", "gol", "time", "estádio", "torcida"]
    }
  ]
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkNewsImport;
