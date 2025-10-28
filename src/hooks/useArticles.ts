import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  published_at: string | null;
  created_at: string;
  read_time: number | null;
  featured: boolean | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords?: string[] | null;
  tags?: string[] | null;
  views_count?: number | null;
  additional_images?: ImageData[] | null;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
  } | null;
  author: {
    id: string;
    name: string;
    slug: string;
    bio: string | null;
    avatar_url: string | null;
  } | null;
}

export interface ImageData {
  id?: string;           // Opcional - gerado automaticamente
  url: string;           // Obrigatório
  caption?: string;      // Opcional
  credit?: string;       // Opcional
  position?: number;     // Opcional - usa índice do array se não fornecido
}

export const useArticles = (options?: {
  featured?: boolean;
  category?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['articles', options],
    queryFn: async (): Promise<Article[]> => {
      let query = supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          published_at,
          created_at,
          read_time,
          featured,
          meta_title,
          meta_description,
          views_count,
          additional_images,
          category:categories(id, name, slug, color, icon),
          author:authors(id, name, slug, bio, avatar_url)
        `)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

      if (options?.featured) {
        query = query.eq('featured', true);
      }

      if (options?.category) {
        query = query.eq('categories.slug', options.category);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Failed to fetch articles: ${error.message}`);
      }

      return (data || []).map(article => ({
        ...article,
        additional_images: article.additional_images ? 
          (Array.isArray(article.additional_images) ? article.additional_images as unknown as ImageData[] : []) 
          : []
      }));
    },
  });
};

export const useArticle = (slug: string) => {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: async (): Promise<Article | null> => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          published_at,
          created_at,
          read_time,
          featured,
          meta_title,
          meta_description,
          meta_keywords,
          tags,
          additional_images,
          category:categories(id, name, slug, color, icon),
          author:authors(id, name, slug, bio, avatar_url)
        `)
        .eq('slug', slug)
        .not('published_at', 'is', null)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch article: ${error.message}`);
      }

      if (!data) return null;

      return {
        ...data,
        additional_images: data.additional_images ? 
          (Array.isArray(data.additional_images) ? data.additional_images as unknown as ImageData[] : []) 
          : []
      };
    },
    enabled: !!slug,
  });
};

export const useArticleById = (id: string) => {
  return useQuery({
    queryKey: ['article', 'id', id],
    queryFn: async (): Promise<Article | null> => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image,
          published_at,
          created_at,
          read_time,
          featured,
          meta_title,
          meta_description,
          meta_keywords,
          tags,
          additional_images,
          category:categories(id, name, slug, color, icon),
          author:authors(id, name, slug, bio, avatar_url)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to fetch article: ${error.message}`);
      }

      if (!data) return null;

      return {
        ...data,
        additional_images: data.additional_images ? 
          (Array.isArray(data.additional_images) ? data.additional_images as unknown as ImageData[] : []) 
          : []
      };
    },
    enabled: !!id,
  });
};