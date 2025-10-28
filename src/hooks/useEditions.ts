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

export const useEditions = (filters?: { status?: string; search?: string }) => {
  return useQuery({
    queryKey: ['editions', filters],
    queryFn: async () => {
      let query = supabase
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

      if (error) throw error;
      return data as Edition[];
    },
  });
};

export const useEdition = (id?: string) => {
  return useQuery({
    queryKey: ['edition', id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;

      const { data: edition, error: editionError } = await supabase
        .from('editions')
        .select('*')
        .eq('id', id)
        .single();

      if (editionError) throw editionError;

      const { data: items, error: itemsError } = await supabase
        .from('edition_items')
        .select('*')
        .eq('edition_id', id)
        .order('ordem', { ascending: true });

      if (itemsError) throw itemsError;

      return {
        ...edition,
        items: items as EditionItem[],
      };
    },
  });
};

export const useEditionBySlug = (slug?: string) => {
  return useQuery({
    queryKey: ['edition-slug', slug],
    enabled: !!slug,
    queryFn: async () => {
      if (!slug) return null;

      const { data: edition, error: editionError } = await supabase
        .from('editions')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'publicado')
        .single();

      if (editionError) throw editionError;

      const { data: items, error: itemsError } = await supabase
        .from('edition_items')
        .select('*')
        .eq('edition_id', edition.id)
        .order('ordem', { ascending: true });

      if (itemsError) throw itemsError;

      return {
        ...edition,
        items: items as EditionItem[],
      };
    },
  });
};
