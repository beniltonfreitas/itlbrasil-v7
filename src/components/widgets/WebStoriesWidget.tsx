import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, ChevronRight } from 'lucide-react';
import { usePublicWebStories } from '@/hooks/usePublicWebStories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const WebStoriesWidget: React.FC = () => {
  const { data: stories, isLoading } = usePublicWebStories(5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-12 h-16 rounded-md flex-shrink-0" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="h-5 w-5 text-primary" />
          Web Stories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stories.map((story) => (
          <Link
            key={story.id}
            to={`/web-stories/${story.slug}`}
            className="flex gap-3 group"
          >
            {/* Thumbnail */}
            <div className="w-12 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
              {story.cover_image ? (
                <img
                  src={story.cover_image}
                  alt={story.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {story.title}
              </h4>
            </div>
          </Link>
        ))}

        {/* View All Link */}
        <Link
          to="/web-stories"
          className="flex items-center justify-center gap-1 text-sm text-primary hover:underline pt-2 border-t border-border"
        >
          Ver todos
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
};
