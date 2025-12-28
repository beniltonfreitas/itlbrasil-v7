import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle2, Download, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import SafeHTML from "@/components/SafeHTML";
import { FormatValidationResult, validateFirstParagraphBold } from "@/lib/textUtils";

interface ArticleData {
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
}

interface ArticlePreviewDialogProps {
  articles: ArticleData[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: () => void;
  onNavigate: (index: number) => void;
  isImporting?: boolean;
}

const ArticlePreviewDialog = ({
  articles,
  currentIndex,
  isOpen,
  onClose,
  onConfirmImport,
  onNavigate,
  isImporting = false,
}: ArticlePreviewDialogProps) => {
  const article = articles[currentIndex];
  
  if (!article) return null;

  const validation: FormatValidationResult = validateFirstParagraphBold(article.conteudo);
  const hasMultiple = articles.length > 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold pr-8">
              Visualização do Artigo
              {hasMultiple && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({currentIndex + 1} de {articles.length})
                </span>
              )}
            </DialogTitle>
            
            {/* Validation indicator */}
            <div className="flex items-center gap-2">
              {validation.valid ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Formato OK
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Aviso de formatação
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Category and source */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge>{article.categoria}</Badge>
              {article.fonte && (
                <a 
                  href={article.fonte} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Fonte
                </a>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold leading-tight">{article.titulo}</h1>

            {/* Excerpt */}
            {article.resumo && (
              <p className="text-muted-foreground italic border-l-4 border-primary/30 pl-4">
                {article.resumo}
              </p>
            )}

            {/* Hero image */}
            {article.imagem?.hero && (
              <figure className="space-y-2">
                <img 
                  src={article.imagem.hero} 
                  alt={article.imagem.alt || article.titulo}
                  className="w-full max-h-[300px] object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {article.imagem.credito && (
                  <figcaption className="text-xs text-muted-foreground text-center">
                    {article.imagem.credito}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Validation warning */}
            {!validation.valid && validation.message && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Aviso de Formatação</p>
                  <p className="text-xs mt-1">{validation.message}</p>
                  <p className="text-xs mt-1 opacity-75">
                    Você pode importar mesmo assim, mas o artigo não seguirá o padrão Agência Brasil.
                  </p>
                </div>
              </div>
            )}

            {/* Content preview */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <SafeHTML html={article.conteudo} />
            </div>

            <Separator />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Tags ({article.tags.length})</h4>
                <div className="flex flex-wrap gap-1">
                  {article.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Info */}
            {article.seo && (
              <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                <h4 className="text-sm font-semibold">SEO</h4>
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="text-muted-foreground">Meta Título:</span>{" "}
                    <span className={article.seo.meta_titulo?.length > 60 ? "text-amber-600" : ""}>
                      {article.seo.meta_titulo || "N/A"} 
                      ({article.seo.meta_titulo?.length || 0}/60)
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Meta Descrição:</span>{" "}
                    <span className={article.seo.meta_descricao?.length > 160 ? "text-amber-600" : ""}>
                      {article.seo.meta_descricao || "N/A"}
                      ({article.seo.meta_descricao?.length || 0}/160)
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-row justify-between items-center gap-2 pt-4 border-t">
          {/* Navigation for multiple articles */}
          <div className="flex items-center gap-2">
            {hasMultiple && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate(currentIndex - 1)}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {articles.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate(currentIndex + 1)}
                  disabled={currentIndex === articles.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={onConfirmImport} disabled={isImporting}>
              {isImporting ? (
                "Importando..."
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  {hasMultiple ? `Importar ${articles.length} Notícias` : "Importar Notícia"}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArticlePreviewDialog;
