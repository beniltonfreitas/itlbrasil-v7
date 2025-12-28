import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Image as ImageIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer ${
        article.selected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border hover:border-primary/50 hover:shadow-sm bg-card"
      }`}
      onClick={onToggle}
    >
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
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
            </div>
          ) : (
            <div className="w-24 h-20 rounded-lg bg-muted flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>

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
      {article.selected && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      )}
    </div>
  );
};

export default ArticlePreviewCard;
