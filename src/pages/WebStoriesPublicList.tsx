import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Sparkles } from "lucide-react";
import { SEO } from "@/components/SEO";

const WebStoriesPublicList = () => {
  const { data: webstories, isLoading } = useQuery({
    queryKey: ['webstories-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webstories')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Web Stories | ITL Brasil"
        description="Confira as últimas Web Stories do ITL Brasil. Notícias em formato visual e interativo."
        keywords={["web stories", "notícias visuais", "ITL Brasil"]}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Web Stories</h1>
          <p className="text-muted-foreground">
            Notícias em formato visual e interativo
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="aspect-[9/16] rounded-xl" />
            ))}
          </div>
        ) : webstories && webstories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {webstories.map((story) => (
              <Link
                key={story.id}
                to={`/web-stories/${story.slug}`}
                className="group"
              >
                <Card className="overflow-hidden border-0 shadow-lg transition-transform duration-300 group-hover:scale-105">
                  <CardContent className="p-0 relative aspect-[9/16]">
                    {story.cover_image ? (
                      <img
                        src={story.cover_image}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                        <Sparkles className="h-12 w-12 text-primary-foreground" />
                      </div>
                    )}
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h2 className="text-white font-semibold text-sm line-clamp-3 mb-1">
                        {story.title}
                      </h2>
                      <div className="flex items-center gap-2 text-white/70 text-xs">
                        <Eye className="h-3 w-3" />
                        <span>{story.views_count || 0}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(story.created_at), {
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Progress indicator (decorative) */}
                    <div className="absolute top-2 left-2 right-2 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-0.5 flex-1 rounded-full ${i === 1 ? 'bg-white' : 'bg-white/30'}`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhuma Web Story disponível</h2>
            <p className="text-muted-foreground">
              Volte em breve para conferir nossas Web Stories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebStoriesPublicList;
