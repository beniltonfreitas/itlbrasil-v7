import React from 'react';
import { Link } from 'react-router-dom';
import { useArticles } from '@/hooks/useArticles';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const NewsGrid05: React.FC = () => {
  const { data: articles, isLoading } = useArticles({ limit: 12 });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="bg-muted h-48 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!articles?.length) return null;

  return (
    <section className="bg-muted/20 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Mais Notícias</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article.id} to={`/artigo/${article.slug}`}>
              <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                <div className="relative overflow-hidden aspect-video">
                  <img
                    src={article.featured_image || '/placeholder.svg'}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <Badge className="absolute top-3 left-3 bg-primary hover:bg-primary/90 text-primary-foreground">
                    {typeof article.category === 'string' ? article.category : article.category?.name || 'Notícias'}
                  </Badge>
                </div>
                
                <CardContent className="p-5">
                  <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {typeof article.author === 'string' ? article.author : article.author?.name || 'Redação'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(article.published_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
