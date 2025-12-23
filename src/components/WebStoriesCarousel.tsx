import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicWebStories } from '@/hooks/usePublicWebStories';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import Autoplay from 'embla-carousel-autoplay';
export const WebStoriesCarousel: React.FC = () => {
  const {
    data: stories,
    isLoading
  } = usePublicWebStories(12);
  const autoplayPlugin = React.useRef(Autoplay({
    delay: 4000,
    stopOnInteraction: false,
    stopOnMouseEnter: true
  }));
  if (isLoading) {
    return <div className="flex gap-3 overflow-hidden">
        {[...Array(8)].map((_, i) => <Skeleton key={i} className="w-14 h-14 rounded-full flex-shrink-0" />)}
      </div>;
  }
  if (!stories || stories.length === 0) {
    return null;
  }
  return <Carousel opts={{
    align: 'start',
    loop: true,
    dragFree: true
  }} plugins={[autoplayPlugin.current]} className="w-full">
      <CarouselContent className="-ml-1">
        {stories.map(story => {})}
      </CarouselContent>
    </Carousel>;
};