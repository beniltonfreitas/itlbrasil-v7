import React from 'react';
import { Link } from 'react-router-dom';
import { useArticles } from '@/hooks/useArticles';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const HeroSection05: React.FC = () => {
  const { data: articles, isLoading } = useArticles({ limit: 3 });

  if (isLoading || !articles?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted h-64 rounded-lg mb-4"></div>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const [mainArticle, ...secondaryArticles] = articles;

  return (
    <section className="bg-background py-8 border-b">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Article */}
          <Link 
            to={`/artigo/${mainArticle.slug}`}
            className="lg:col-span-2 group"
          >
            <div className="relative overflow-hidden rounded-lg shadow-lg mb-4 aspect-video">
              <img
                src={mainArticle.featured_image || '/placeholder.svg'}
                alt={mainArticle.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <Badge className="mb-3 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {typeof mainArticle.category === 'string' ? mainArticle.category : mainArticle.category?.name || 'Notícias'}
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold mb-2 leading-tight group-hover:text-primary transition-colors">
                  {mainArticle.title}
                </h2>
                <p className="text-sm opacity-90 line-clamp-2">
                  {mainArticle.excerpt}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{typeof mainArticle.author === 'string' ? mainArticle.author : mainArticle.author?.name || 'Redação ITL Brasil'}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(mainArticle.published_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </span>
            </div>
          </Link>

          {/* Secondary Articles */}
          <div className="flex flex-col gap-6">
            {secondaryArticles.map((article) => (
              <Link
                key={article.id}
                to={`/artigo/${article.slug}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-lg shadow-md mb-3 aspect-video">
                  <img
                    src={article.featured_image || '/placeholder.svg'}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <Badge className="mb-2 bg-muted text-foreground hover:bg-muted/80">
                  {typeof article.category === 'string' ? article.category : article.category?.name || 'Notícias'}
                </Badge>
                <h3 className="text-lg font-bold mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(article.published_at), "dd MMM", { locale: ptBR })}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
