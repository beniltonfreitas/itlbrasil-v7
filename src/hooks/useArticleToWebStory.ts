import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useArticleToWebStory = () => {
  const queryClient = useQueryClient();
  const DEFAULT_AUTHOR_ID = '04ff5b92-dde9-427b-9371-e3b2813bcab5'; // Redação ITL Brasil

  return useMutation({
    mutationFn: async (articleId: string) => {
      // First, get the article data
      const { data: article, error: articleError } = await supabase
        .from('articles')
        .select(`
          *,
          author:authors(id, name, avatar_url),
          category:categories(id, name)
        `)
        .eq('id', articleId)
        .single();

      if (articleError) {
        throw new Error(`Erro ao buscar artigo: ${articleError.message}`);
      }

      // Generate slug from title
      const slug = article.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();

      // Create the WebStory
      const { data: webstory, error: webstoryError } = await supabase
        .from('webstories')
        .insert({
          title: article.title,
          slug: `${slug}-webstory`,
          cover_image: article.featured_image,
          status: 'draft',
          author_id: article.author_id || DEFAULT_AUTHOR_ID,
          meta_description: article.meta_description,
          meta_keywords: Array.isArray(article.meta_keywords) ? article.meta_keywords : null,
          source_article_id: article.id,
        })
        .select()
        .single();

      if (webstoryError) {
        throw new Error(`Erro ao criar WebStory: ${webstoryError.message}`);
      }

      // Split content into pages (simple implementation)
      const contentBlocks = splitContentIntoPages(article.content, article.title, article.featured_image);
      
      // Create pages
      const pages = await Promise.all(
        contentBlocks.map(async (block, index) => {
          const { data: page, error: pageError } = await supabase
            .from('webstory_pages')
            .insert({
              webstory_id: webstory.id,
              page_number: index + 1,
              content_type: block.type,
              content_data: block.data,
              background_color: index === 0 ? '#1a1a1a' : '#ffffff',
              text_color: index === 0 ? '#ffffff' : '#1a1a1a',
              font_family: 'Inter',
            })
            .select()
            .single();

          if (pageError) {
            throw new Error(`Erro ao criar página ${index + 1}: ${pageError.message}`);
          }

          return page;
        })
      );

      return { webstory, pages };
    },
    onSuccess: (data) => {
      toast.success(`WebStory "${data.webstory.title}" criada com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['webstories'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Helper function to split content into WebStory pages
function splitContentIntoPages(content: string, title: string, coverImage?: string) {
  const pages = [];
  
  // Page 1: Cover page
  pages.push({
    type: 'image' as const,
    data: {
      image_url: coverImage || '',
      text: title,
      caption: title,
    },
  });

  // Split content by paragraphs
  const paragraphs = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .split(/\n\s*\n/) // Split by double line breaks
    .filter(p => p.trim().length > 0)
    .map(p => p.trim());

  // Group paragraphs into pages (max 2-3 paragraphs per page)
  const maxParagraphsPerPage = 2;
  for (let i = 0; i < paragraphs.length; i += maxParagraphsPerPage) {
    const pageContent = paragraphs
      .slice(i, i + maxParagraphsPerPage)
      .join('\n\n');
    
    if (pageContent.length > 0) {
      pages.push({
        type: 'text' as const,
        data: {
          text: pageContent,
        },
      });
    }

    // Limit to max 8 pages total (including cover)
    if (pages.length >= 8) break;
  }

  // Final page: Call to action
  if (pages.length > 1) {
    pages.push({
      type: 'text' as const,
      data: {
        text: `Continue lendo o artigo completo em nosso site.\n\n"${title}"`,
      },
    });
  }

  return pages;
}