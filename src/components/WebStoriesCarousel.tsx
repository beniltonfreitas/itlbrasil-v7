import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicWebStories } from '@/hooks/usePublicWebStories';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import Autoplay from 'embla-carousel-autoplay';

export const WebStoriesCarousel: React.FC = () => {
  const { data: stories, isLoading } = usePublicWebStories(12);
  
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="w-14 h-14 rounded-full flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
        dragFree: true,
      }}
      plugins={[autoplayPlugin.current]}
      className="w-full"
    >
      <CarouselContent className="-ml-1">
        {stories.map((story) => (
          <CarouselItem
            key={story.id}
            className="pl-1 basis-auto"
          >
            <Link
              to={`/web-stories/${story.slug}`}
              className="block group"
            >
              {/* Circular Image with Gradient Border */}
              <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-white p-[2px]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                    {story.cover_image ? (
                      <img
                        src={story.cover_image}
                        alt={story.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {story.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
};
