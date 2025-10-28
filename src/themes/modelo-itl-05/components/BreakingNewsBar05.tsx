import React from 'react';
import { useArticles } from '@/hooks/useArticles';
import { Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BreakingNewsBar05: React.FC = () => {
  const { data: articles, isLoading } = useArticles({ featured: true, limit: 5 });

  if (isLoading || !articles?.length) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2.5 px-4 shadow-md">
      <div className="container mx-auto flex items-center gap-4 overflow-hidden">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Megaphone className="h-5 w-5" />
          <span className="font-bold text-sm tracking-wider uppercase">Última Hora</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="animate-scroll-left whitespace-nowrap flex gap-8">
            {articles.map((article) => (
              <Link 
                key={article.id}
                to={`/artigo/${article.slug}`}
                className="inline-block text-sm hover:underline"
              >
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
