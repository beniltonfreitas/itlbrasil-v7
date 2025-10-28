import React from 'react';
import { useArticles } from '@/hooks/useArticles';

export const HeroSection04: React.FC = () => {
  const { data: articles } = useArticles({ featured: true, limit: 1 });
  
  const heroArticle = articles?.[0];
  const heroImage = heroArticle?.featured_image || '/banners/banner-1.png';

  return (
    <div className="w-full h-[300px] md:h-[400px] relative overflow-hidden">
      <img 
        src={heroImage}
        alt="Hero"
        className="w-full h-full object-cover"
      />
    </div>
  );
};
