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
      <section className="py-4 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 overflow-hidden justify-center">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-20 h-20 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <section className="py-4 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
            dragFree: true,
          }}
          plugins={[autoplayPlugin.current]}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {stories.map((story) => (
              <CarouselItem
                key={story.id}
                className="pl-2 basis-auto"
              >
                <Link
                  to={`/web-stories/${story.slug}`}
                  className="flex flex-col items-center gap-2 group"
                >
                  {/* Circular Image with Gradient Border */}
                  <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                    <div className="w-[72px] h-[72px] md:w-[80px] md:h-[80px] rounded-full overflow-hidden bg-white p-[2px]">
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
                            <span className="text-white text-xl font-bold">
                              {story.title.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title below */}
                  <span className="text-xs text-gray-700 text-center line-clamp-1 max-w-[80px] group-hover:text-blue-600 transition-colors">
                    {story.title.split(' ').slice(0, 2).join(' ')}
                  </span>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};
