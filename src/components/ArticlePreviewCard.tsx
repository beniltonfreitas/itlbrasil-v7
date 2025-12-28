import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalLink, Image as ImageIcon, AlertTriangle, Copy } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DuplicateInfo {
  isDuplicate: boolean;
  matchType: 'title' | 'url' | 'slug' | null;
  existingArticle?: {
    id: string;
    title: string;
    slug: string;
    published_at: string | null;
  };
  similarity?: number;
}

interface RSSArticle {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  image?: string;
  feedId: string;
  feedName: string;
  selected: boolean;
  duplicateInfo?: DuplicateInfo;
}

interface ArticlePreviewCardProps {
  article: RSSArticle;
  onToggle: () => void;
}

const ArticlePreviewCard = ({ article, onToggle }: ArticlePreviewCardProps) => {
  // Truncate description to ~150 chars
  const truncatedDescription = article.description
    ? article.description.length > 150
      ? article.description.substring(0, 150) + "..."
      : article.description
    : "";

  const isDuplicate = article.duplicateInfo?.isDuplicate;
  const matchType = article.duplicateInfo?.matchType;
  const existingArticle = article.duplicateInfo?.existingArticle;

  const getDuplicateLabel = () => {
    switch (matchType) {
      case 'url': return 'URL idêntica';
      case 'slug': return 'Slug idêntico';
      case 'title': return `Título ${article.duplicateInfo?.similarity}% similar`;
      default: return 'Duplicado';
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer ${
        isDuplicate
          ? "border-amber-500/50 bg-amber-500/5 opacity-75"
          : article.selected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border hover:border-primary/50 hover:shadow-sm bg-card"
      }`}
      onClick={onToggle}
    >
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 relative">
          {article.image ? (
            <div className="relative w-24 h-20 rounded-lg overflow-hidden bg-muted">
              <img
                src={article.image}
                alt=""
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement?.classList.add("flex", "items-center", "justify-center");
                  const placeholder = document.createElement("div");
                  placeholder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground/50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
                  e.currentTarget.parentElement?.appendChild(placeholder);
                }}
              />
              {isDuplicate && (
                <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                  <Copy className="h-5 w-5 text-amber-600" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-24 h-20 rounded-lg bg-muted flex items-center justify-center">
              {isDuplicate ? (
                <Copy className="h-8 w-8 text-amber-500/60" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Title */}
          <div className="flex items-start gap-2 mb-2">
            <h3 className={`font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors ${
              isDuplicate ? 'text-muted-foreground' : ''
            }`}>
              {article.title}
            </h3>
            {isDuplicate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="flex-shrink-0 bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Duplicado
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">{getDuplicateLabel()}</p>
                      {existingArticle && (
                        <>
                          <p className="text-xs text-muted-foreground">
                            "{existingArticle.title.substring(0, 60)}..."
                          </p>
                          {existingArticle.published_at && (
                            <p className="text-xs text-muted-foreground">
                              Publicado em {format(new Date(existingArticle.published_at), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Description */}
          {truncatedDescription && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">
              {truncatedDescription}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2 mt-auto">
            <Badge variant="secondary" className="text-xs font-medium">
              {article.feedName}
            </Badge>
            {article.pubDate && (
              <span className="text-xs text-muted-foreground">
                •{" "}
                {formatDistanceToNow(new Date(article.pubDate), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-2">
          <Checkbox
            checked={article.selected}
            onCheckedChange={onToggle}
            onClick={(e) => e.stopPropagation()}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Abrir original"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Selection indicator bar */}
      {article.selected && !isDuplicate && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      )}
      {isDuplicate && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
      )}
    </div>
  );
};

export default ArticlePreviewCard;
