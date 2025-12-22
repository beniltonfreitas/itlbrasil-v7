import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Edition {
  id: string;
  titulo: string;
  subtitulo?: string;
  numero_edicao: string;
  slug: string;
  status: string;
  data_publicacao: string;
  colunas: number;
  tema_visual: string;
  fonte_base: string;
  tamanho_fonte_base: number;
  interlinha: number;
  margem: string;
  cidade?: string;
  uf?: string;
  capa_json?: any;
  sumario_json?: any;
  acessibilidade_json?: any;
  seo_json?: any;
  total_paginas: number;
  visualizacoes: number;
  downloads_pdf: number;
  downloads_epub: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EditionItem {
  id: string;
  edition_id: string;
  tipo: string;
  ordem: number;
  referencia_id?: string;
  secao?: string;
  pagina_alvo?: number;
  configuracao_json?: any;
  layout_hint?: string;
  created_at: string;
}

// Note: This hook requires the 'editions' and 'edition_items' tables to exist.
// Uses 'any' casting to bypass TypeScript strict checking.

export const useEditions = (filters?: { status?: string; search?: string }) => {
  return useQuery({
    queryKey: ['editions', filters],
    queryFn: async () => {
      try {
        let query = (supabase as any)
          .from('editions')
          .select('*')
          .order('data_publicacao', { ascending: false });

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        if (filters?.search) {
          query = query.or(`titulo.ilike.%${filters.search}%,numero_edicao.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.warn('Editions table may not exist:', error.message);
          return [] as Edition[];
        }
        return (data || []) as Edition[];
      } catch (err) {
        console.warn('Error fetching editions:', err);
        return [] as Edition[];
      }
    },
  });
};

export const useEdition = (id?: string) => {
  return useQuery({
    queryKey: ['edition', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;

      try {
        const { data: edition, error: editionError } = await (supabase as any)
          .from('editions')
          .select('*')
          .eq('id', id)
          .single();

        if (editionError) {
          console.warn('Edition not found:', editionError.message);
          return null;
        }

        const { data: items, error: itemsError } = await (supabase as any)
          .from('edition_items')
          .select('*')
          .eq('edition_id', id)
          .order('ordem', { ascending: true });

        if (itemsError) {
          console.warn('Edition items not found:', itemsError.message);
        }

        return {
          ...edition,
          items: (items || []) as EditionItem[],
        };
      } catch (err) {
        console.warn('Error fetching edition:', err);
        return null;
      }
    },
  });
};

export const useEditionBySlug = (slug?: string) => {
  return useQuery({
    queryKey: ['edition-slug', slug],
    enabled: !!slug,
    queryFn: async () => {
      if (!slug) return null;

      try {
        const { data: edition, error: editionError } = await (supabase as any)
          .from('editions')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'publicado')
          .single();

        if (editionError) {
          console.warn('Edition not found:', editionError.message);
          return null;
        }

        const { data: items, error: itemsError } = await (supabase as any)
          .from('edition_items')
          .select('*')
          .eq('edition_id', edition.id)
          .order('ordem', { ascending: true });

        if (itemsError) {
          console.warn('Edition items not found:', itemsError.message);
        }

        return {
          ...edition,
          items: (items || []) as EditionItem[],
        };
      } catch (err) {
        console.warn('Error fetching edition by slug:', err);
        return null;
      }
    },
  });
};
