import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Share2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";

interface WebStoryPageData {
  id: string;
  page_number: number;
  content_type: string;
  content_data: {
    text?: string;
    image_url?: string;
    caption?: string;
  } | null;
  background_color: string;
  text_color: string;
}

const WebStoryReader = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);

  // Fetch webstory with pages
  const { data: webstory, isLoading, error } = useQuery({
    queryKey: ['webstory-public', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('webstories')
        .select('*, webstory_pages(*)')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Increment view count
  useEffect(() => {
    if (webstory?.id) {
      supabase
        .from('webstories')
        .update({ views_count: (webstory.views_count || 0) + 1 })
        .eq('id', webstory.id)
        .then();
    }
  }, [webstory?.id]);

  const pages: WebStoryPageData[] = (webstory?.webstory_pages || [])
    .map((p: any) => ({
      id: p.id,
      page_number: p.page_number,
      content_type: p.content_type,
      content_data: p.content_data as { text?: string; image_url?: string; caption?: string } | null,
      background_color: p.background_color,
      text_color: p.text_color,
    }))
    .sort((a: WebStoryPageData, b: WebStoryPageData) => a.page_number - b.page_number);

  const totalPages = pages.length;

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevPage();
      } else if (e.key === 'Escape') {
        navigate('/web-stories');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPrevPage, navigate]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: webstory?.title,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  if (error || !webstory) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-xl font-bold mb-4">Web Story não encontrada</h1>
        <Button asChild variant="secondary">
          <Link to="/web-stories">Ver todas as Web Stories</Link>
        </Button>
      </div>
    );
  }

  if (totalPages === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-xl font-bold mb-4">Esta Web Story está vazia</h1>
        <Button asChild variant="secondary">
          <Link to="/web-stories">Ver outras Web Stories</Link>
        </Button>
      </div>
    );
  }

  const currentPageData = pages[currentPage];

  return (
    <>
      <SEO
        title={`${webstory.title} | Web Stories | ITL Brasil`}
        description={webstory.meta_description || webstory.title}
        image={webstory.cover_image}
      />

      <div className="fixed inset-0 bg-black">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-2 flex gap-1">
          {pages.map((_, index) => (
            <button
              key={index}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: index <= currentPage ? 'white' : 'rgba(255,255,255,0.3)',
              }}
              onClick={() => setCurrentPage(index)}
            />
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 right-0 z-20 px-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => navigate('/web-stories')}
          >
            <X className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Page content */}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            backgroundColor: currentPageData.background_color || '#000',
          }}
        >
        {currentPageData.content_type === 'image' ? (
            <div className="relative w-full h-full">
              {currentPageData.content_data?.image_url && (
                <img
                  src={currentPageData.content_data.image_url}
                  alt={currentPageData.content_data?.caption || ''}
                  className="w-full h-full object-cover"
                />
              )}
              {currentPageData.content_data?.caption && (
                <div className="absolute bottom-16 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p
                    className="text-lg font-medium"
                    style={{ color: currentPageData.text_color || '#fff' }}
                  >
                    {currentPageData.content_data.caption}
                  </p>
                </div>
              )}
              {currentPageData.content_data?.text && (
                <div className="absolute inset-0 flex items-center justify-center p-8 bg-black/40">
                  <h2 className="text-2xl md:text-4xl font-bold text-center text-white">
                    {currentPageData.content_data.text}
                  </h2>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 max-w-lg text-center">
              <p
                className="text-lg md:text-xl leading-relaxed whitespace-pre-line"
                style={{ color: currentPageData.text_color || '#1a1a1a' }}
              >
                {currentPageData.content_data?.text}
              </p>
            </div>
          )}
        </div>

        {/* Navigation areas */}
        <button
          className="absolute left-0 top-16 bottom-16 w-1/3 z-10"
          onClick={goToPrevPage}
          aria-label="Página anterior"
        />
        <button
          className="absolute right-0 top-16 bottom-16 w-2/3 z-10"
          onClick={goToNextPage}
          aria-label="Próxima página"
        />

        {/* Navigation buttons (visible on desktop) */}
        <div className="hidden md:block">
          {currentPage > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={goToPrevPage}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}
          {currentPage < totalPages - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={goToNextPage}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent z-10">
          <p className="text-white text-center text-xs">
            {currentPage + 1} de {totalPages}
          </p>
        </div>
      </div>
    </>
  );
};

export default WebStoryReader;
