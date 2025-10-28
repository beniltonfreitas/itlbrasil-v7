import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LiveStreamWidget } from '@/components/widgets/LiveStreamWidget';

import { NewsletterSignup } from '@/components/NewsletterSignup';
import { useArticles } from '@/hooks/useArticles';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

export const SidebarWidgets05: React.FC = () => {
  const { data: latestArticles } = useArticles({ limit: 5 });

  return (
    <aside className="space-y-6">
      {/* Newsletter */}
      <Card className="shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-lg">Receba Nossas Notícias</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <NewsletterSignup />
        </CardContent>
      </Card>

      {/* Live Stream */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
            Ao Vivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LiveStreamWidget />
        </CardContent>
      </Card>


      {/* Latest News List */}
      {latestArticles && latestArticles.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Mais Lidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {latestArticles.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/artigo/${article.slug}`}
                  className="flex gap-3 group"
                >
                  <span className="text-3xl font-bold text-muted-foreground/30 flex-shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {typeof article.category === 'string' ? article.category : article.category?.name || 'Notícias'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </aside>
  );
};
