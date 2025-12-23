import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Smartphone, ChevronRight } from 'lucide-react';
import { usePublicWebStories } from '@/hooks/usePublicWebStories';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const WebStoriesCarousel: React.FC = () => {
  const { data: stories, isLoading } = usePublicWebStories(8);

  if (isLoading) {
    return (
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-40 h-64 rounded-xl flex-shrink-0" />
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
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Web Stories
              </h2>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Histórias rápidas para você
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/web-stories" className="flex items-center gap-1">
              Ver Todos
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{
            align: 'start',
            loop: stories.length > 4,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {stories.map((story) => (
              <CarouselItem
                key={story.id}
                className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <Link
                  to={`/web-stories/${story.slug}`}
                  className="block group"
                >
                  <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-muted shadow-md transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-lg">
                    {/* Cover Image */}
                    {story.cover_image ? (
                      <img
                        src={story.cover_image}
                        alt={story.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Smartphone className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Story Ring Effect */}
                    <div className="absolute inset-0 ring-2 ring-primary/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">
                        {story.title}
                      </h3>
                      {story.views_count !== null && story.views_count > 0 && (
                        <div className="flex items-center gap-1 text-white/70 text-xs">
                          <Eye className="h-3 w-3" />
                          <span>{story.views_count}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>
      </div>
    </section>
  );
};
