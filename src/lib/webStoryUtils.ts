import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_AUTHOR_ID } from "@/constants/authors";

export interface WebStoryPageData {
  type: 'image' | 'text';
  data: {
    image_url?: string;
    text?: string;
    caption?: string;
  };
}

/**
 * Cria um WebStory automaticamente a partir de um artigo
 * @param articleId - ID do artigo
 * @returns O WebStory criado ou null se falhar silenciosamente
 */
export async function createWebStoryFromArticle(articleId: string): Promise<boolean> {
  try {
    // Buscar dados do artigo
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        content,
        excerpt,
        featured_image,
        meta_description,
        meta_keywords,
        author_id
      `)
      .eq('id', articleId)
      .single();

    if (articleError || !article) {
      console.warn('⚠️ WebStory: Erro ao buscar artigo para criar WebStory:', articleError?.message);
      return false;
    }

    // Verificar se já existe um WebStory para este artigo
    const { data: existingStory } = await supabase
      .from('webstories')
      .select('id')
      .eq('source_article_id', articleId)
      .maybeSingle();

    if (existingStory) {
      console.log('📖 WebStory já existe para este artigo:', existingStory.id);
      return true; // Já existe, não precisa criar
    }

    // Gerar slug único
    const baseSlug = article.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 80);

    const slug = `${baseSlug}-ws-${Date.now().toString(36)}`;

    // Criar o WebStory
    const { data: webstory, error: webstoryError } = await supabase
      .from('webstories')
      .insert({
        title: article.title,
        slug,
        cover_image: article.featured_image,
        status: 'publicado', // Publicar automaticamente junto com o artigo
        author_id: article.author_id || DEFAULT_AUTHOR_ID,
        meta_description: article.meta_description || article.excerpt,
        meta_keywords: Array.isArray(article.meta_keywords) ? article.meta_keywords : null,
        source_article_id: article.id,
      })
      .select()
      .single();

    if (webstoryError) {
      console.warn('⚠️ WebStory: Erro ao criar WebStory:', webstoryError.message);
      return false;
    }

    // Dividir conteúdo em páginas
    const pages = splitContentIntoPages(
      article.content,
      article.title,
      article.featured_image
    );

    // Criar páginas
    for (let i = 0; i < pages.length; i++) {
      const block = pages[i];
      await supabase
        .from('webstory_pages')
        .insert({
          webstory_id: webstory.id,
          page_number: i + 1,
          content_type: block.type,
          content_data: block.data,
          background_color: i === 0 ? '#1a1a1a' : '#ffffff',
          text_color: i === 0 ? '#ffffff' : '#1a1a1a',
          font_family: 'Inter',
        });
    }

    console.log('✅ WebStory criado automaticamente:', webstory.id);
    return true;
  } catch (error) {
    console.warn('⚠️ WebStory: Erro inesperado ao criar WebStory:', error);
    return false;
  }
}

/**
 * Divide o conteúdo do artigo em páginas para o WebStory
 */
function splitContentIntoPages(
  content: string,
  title: string,
  coverImage?: string | null
): WebStoryPageData[] {
  const pages: WebStoryPageData[] = [];

  // Página 1: Capa
  pages.push({
    type: 'image',
    data: {
      image_url: coverImage || '',
      text: title,
      caption: title,
    },
  });

  // Dividir conteúdo por parágrafos
  const paragraphs = content
    .replace(/<[^>]*>/g, '') // Remover tags HTML
    .split(/\n\s*\n/) // Dividir por quebras de linha duplas
    .filter((p) => p.trim().length > 0)
    .map((p) => p.trim());

  // Agrupar parágrafos em páginas (max 2 parágrafos por página)
  const maxParagraphsPerPage = 2;
  for (let i = 0; i < paragraphs.length; i += maxParagraphsPerPage) {
    const pageContent = paragraphs
      .slice(i, i + maxParagraphsPerPage)
      .join('\n\n');

    if (pageContent.length > 0) {
      pages.push({
        type: 'text',
        data: {
          text: pageContent,
        },
      });
    }

    // Limitar a 8 páginas no total (incluindo capa)
    if (pages.length >= 8) break;
  }

  // Página final: Call to action
  if (pages.length > 1) {
    pages.push({
      type: 'text',
      data: {
        text: `Continue lendo o artigo completo em nosso site.\n\n"${title}"`,
      },
    });
  }

  return pages;
}
