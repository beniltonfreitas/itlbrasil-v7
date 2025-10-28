import { Link } from "react-router-dom";
import { Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/hooks/useArticles";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NewsCardProps {
  article: Article;
  featured?: boolean;
}

const NewsCard = ({ article, featured = false }: NewsCardProps) => {
  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 ${
      featured ? "md:col-span-2 lg:col-span-3" : ""
    }`}>
      <Link to={`/artigo/${article.slug}`}>
        <div className={`relative overflow-hidden ${
          featured ? "h-96" : "h-48"
        }`}>
          <img
            src={article.featured_image || "/placeholder.svg"}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 left-4">
            <Badge 
              className="text-white" 
              style={{ backgroundColor: article.category?.color || '#3B82F6' }}
            >
              {article.category?.name || 'Sem categoria'}
            </Badge>
          </div>
          {featured && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-breaking text-breaking-foreground">
                DESTAQUE
              </Badge>
            </div>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <h3 className={`font-bold leading-tight group-hover:text-primary transition-colors ${
            featured ? "text-2xl" : "text-lg"
          }`}>
            {article.title}
          </h3>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <p className={`text-muted-foreground leading-relaxed ${
            featured ? "text-base" : "text-sm"
          }`}>
            {article.excerpt}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{article.author?.name || 'Autor desconhecido'}</span>
              </div>
              {article.read_time && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{article.read_time} min</span>
                </div>
              )}
            </div>
            <span>
              {article.published_at && format(new Date(article.published_at), "d 'de' MMM", { locale: ptBR })}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default NewsCard;