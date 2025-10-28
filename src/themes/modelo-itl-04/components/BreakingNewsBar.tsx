import React from 'react';
import { useArticles } from '@/hooks/useArticles';
import { Megaphone } from 'lucide-react';

export const BreakingNewsBar: React.FC = () => {
  const { data: articles, isLoading } = useArticles({ featured: true, limit: 5 });

  if (isLoading || !articles?.length) return null;

  const breakingNews = articles[0];

  return (
    <div className="bg-blue-600 text-white py-2 px-4">
      <div className="container mx-auto flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Megaphone className="h-4 w-4" />
          <span className="font-bold text-sm tracking-wide">ÚLTIMA HORA</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="animate-scroll-left whitespace-nowrap">
            <span className="text-sm inline-block">{breakingNews.title}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
