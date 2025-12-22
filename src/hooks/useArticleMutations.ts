import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImageData } from "./useArticles";
import { normalizeContent, ensureWhatsAppCTA, generateSlug } from "@/lib/newsUtils";
import { removeWhatsAppCTA } from "@/lib/textUtils";
import { useSecureAuth } from "@/contexts/SecureAuthContext";
import { publishToWhatsApp } from "@/lib/whatsappPublisher";
import { DEFAULT_AUTHOR_ID } from "@/constants/authors";

export interface CreateArticleData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category_id?: string;
  author_id?: string;
  featured_image?: string;
  featured_image_alt?: string;
  featured_image_credit?: string;
  image_credit?: string; // @deprecated - usar featured_image_credit
  source_url?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  featured?: boolean;
  status: "draft" | "published";
  published_at?: string | null;
  tags?: string[];
  additional_images?: ImageData[];
}

export interface UpdateArticleData extends CreateArticleData {
  id: string;
}

export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  const { user } = useSecureAuth();

  return useMutation({
    mutationFn: async (data: CreateArticleData) => {
      const defaultPublished = import.meta.env.VITE_DEFAULT_STATUS_PUBLISHED === 'true';
      
      // Normalize content and remove duplicate WhatsApp CTAs
      let normalizedContent = normalizeContent(data.content);
      normalizedContent = removeWhatsAppCTA(normalizedContent);
      
      // Auto-generate slug if not provided or if it's invalid
      let finalSlug = data.slug;
      if (!finalSlug || finalSlug.length < 6) {
        finalSlug = generateSlug(data.title);
      }

      // Ensure slug uniqueness by appending a suffix if needed
      let uniqueSlug = finalSlug;
      for (let i = 2; i <= 20; i++) {
        const { data: existing, error: existErr } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', uniqueSlug)
          .maybeSingle();
        if (existErr) break; // don't block creation on select error
        if (!existing) break; // unique
        uniqueSlug = `${finalSlug}-${i}`;
      }
      finalSlug = uniqueSlug;
      
      // Calculate read time (simple estimation: 200 words per minute)
      const wordCount = normalizedContent.trim().split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      const finalStatus = defaultPublished ? "published" : (data.status || "published");

      // Função para garantir sessão válida antes de operações críticas
      const ensureValidSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        // Verificar se vai expirar nos próximos 5 minutos
        const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (expiresAt - now < fiveMinutes) {
          console.log('⏱️ Token expirando em breve, fazendo refresh...');
          const { data: refreshed, error } = await supabase.auth.refreshSession();
          
          if (error || !refreshed.session) {
            throw new Error('Não foi possível renovar a sessão. Faça login novamente.');
          }
          
          return refreshed.session.user.id;
        }
        
        return session.user.id;
      };

      const userId = await ensureValidSession();

      if (!userId) {
        throw new Error('Usuário não autenticado. Faça login para criar notícias.');
      }

      // RLS policies will handle permission verification automatically
      // No need to manually check user_roles here

      // Padronizar campos de imagem
      const featuredImageAlt = data.featured_image_alt || data.title;
      const featuredImageCredit = data.featured_image_credit || data.image_credit || null;
      
      // Criar featured_image_json
      const featuredImageJson = data.featured_image ? {
        url: data.featured_image,
        alt: featuredImageAlt,
        credito: featuredImageCredit
      } : null;

      console.log('📸 Criando artigo com imagem:', featuredImageJson);

      const articleData = {
        title: data.title,
        slug: finalSlug,
        excerpt: data.excerpt || null,
        content: normalizedContent,
        category_id: data.category_id || null,
        author_id: data.author_id || DEFAULT_AUTHOR_ID, // Prioriza Redação ITL Brasil
        featured_image: data.featured_image || null,
        featured_image_alt: featuredImageAlt,
        featured_image_credit: featuredImageCredit,
        featured_image_json: featuredImageJson as any,
        source_url: data.source_url || null,
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
        meta_keywords: data.meta_keywords?.join(',') || null,
        featured: data.featured || false,
        status: finalStatus,
        published_at: finalStatus === "published" ? new Date().toISOString() : null,
        read_time: readTime,
        additional_images: (data.additional_images || []) as any,
      };

      const { data: article, error } = await supabase
        .from('articles')
        .insert(articleData)
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase:', error);
        
        // Detectar erro de sessão expirada
        if (error.message.includes('JWT') || 
            error.message.includes('expired') ||
            error.message.includes('invalid claim')) {
          throw new Error('🔒 Sua sessão expirou. Por favor, faça login novamente.');
        }
        
        // Detectar erro de RLS (permissões)
        if (error.message.includes('row-level security') || 
            error.message.includes('policy') ||
            error.code === 'PGRST301' ||
            error.code === '42501') {
          throw new Error('❌ Você não tem permissão para criar artigos. Verifique se está autenticado corretamente ou contate um administrador.');
        }
        
        throw new Error(`Erro ao criar artigo: ${error.message}`);
      }

      // Note: image_credit stored in data but not persisted to DB
      if (data.image_credit) {
        console.log('📝 Crédito da imagem recebido:', data.image_credit);
      }

      // Se foi publicado, enviar para WhatsApp
      if (finalStatus === "published") {
        const author = user?.user_metadata?.name || user?.email || 'Redação';
        
        await publishToWhatsApp({
          type: 'article',
          title: article.title,
          summary: article.excerpt || article.meta_description || '',
          slug: article.slug,
          image: article.featured_image || '',
          tags: data.tags || [],
          author,
          published_at: article.published_at || new Date().toISOString(),
        });
      }

      return article;
    },
    onSuccess: () => {
      // Invalidate articles queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  const { user } = useSecureAuth();

  return useMutation({
    mutationFn: async (data: UpdateArticleData) => {
      const { id, ...updateData } = data;

      // Verificar se mudou de draft para published
      const { data: existingArticle } = await supabase
        .from('articles')
        .select('status')
        .eq('id', id)
        .single();

      const isNewlyPublished = existingArticle?.status !== 'published' && updateData.status === 'published';

      // Normalize content and remove duplicate WhatsApp CTAs
      let normalizedContent = normalizeContent(updateData.content);
      normalizedContent = removeWhatsAppCTA(normalizedContent);
      
      // Calculate read time (simple estimation: 200 words per minute)
      const wordCount = normalizedContent.trim().split(/\s+/).length;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      // Padronizar campos de imagem
      const featuredImageAlt = updateData.featured_image_alt || updateData.title;
      const featuredImageCredit = updateData.featured_image_credit || updateData.image_credit || null;
      
      // Criar featured_image_json
      const featuredImageJson = updateData.featured_image ? {
        url: updateData.featured_image,
        alt: featuredImageAlt,
        credito: featuredImageCredit
      } : null;

      console.log('📸 Atualizando artigo com imagem:', featuredImageJson);

      const articleData = {
        title: updateData.title,
        slug: updateData.slug,
        excerpt: updateData.excerpt || null,
        content: normalizedContent,
        category_id: updateData.category_id || null,
        author_id: updateData.author_id || DEFAULT_AUTHOR_ID, // Garante Redação ITL Brasil
        featured_image: updateData.featured_image || null,
        featured_image_alt: featuredImageAlt,
        featured_image_credit: featuredImageCredit,
        featured_image_json: featuredImageJson as any,
        source_url: updateData.source_url || null,
        meta_title: updateData.meta_title || null,
        meta_description: updateData.meta_description || null,
        meta_keywords: updateData.meta_keywords?.join(',') || null,
        featured: updateData.featured || false,
        status: updateData.status,
        published_at: isNewlyPublished ? new Date().toISOString() : updateData.published_at,
        read_time: readTime,
        additional_images: (updateData.additional_images || []) as any,
        updated_at: new Date().toISOString(),
      };

      const { data: article, error } = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update article: ${error.message}`);
      }

      // Note: image_credit stored in data but not persisted to DB
      if (updateData.image_credit) {
        console.log('📝 Crédito da imagem recebido:', updateData.image_credit);
      }

      // Se foi recém-publicado, enviar para WhatsApp
      if (isNewlyPublished) {
        const author = user?.user_metadata?.name || user?.email || 'Redação';
        
        await publishToWhatsApp({
          type: 'article',
          title: article.title,
          summary: article.excerpt || article.meta_description || '',
          slug: article.slug,
          image: article.featured_image || '',
          tags: updateData.tags || [],
          author,
          published_at: article.published_at || new Date().toISOString(),
        });
      }

      return article;
    },
    onSuccess: (data) => {
      // Invalidate articles queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      // Also invalidate the specific article query
      queryClient.invalidateQueries({ queryKey: ['article', data.slug] });
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete article: ${error.message}`);
      }

      return id;
    },
    onSuccess: () => {
      // Invalidate articles queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};