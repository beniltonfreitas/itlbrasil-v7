import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NoticiasAIImport {
  id: string;
  article_id: string | null;
  article_title: string;
  article_slug: string;
  source_url: string | null;
  source_name: string | null;
  import_type: string;
  format_corrected: boolean;
  status: string;
  error_message: string | null;
  imported_by: string | null;
  created_at: string;
}

export interface CreateNoticiasAIImportData {
  article_id: string;
  article_title: string;
  article_slug: string;
  source_url?: string;
  source_name?: string;
  import_type: 'single' | 'batch' | 'json';
  format_corrected: boolean;
  status?: 'success' | 'error';
  error_message?: string;
}

export const useNoticiasAIImports = (limit = 50) => {
  return useQuery({
    queryKey: ['noticias-ai-imports', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noticias_ai_imports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as NoticiasAIImport[];
    },
  });
};

export const useCreateNoticiasAIImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (importData: CreateNoticiasAIImportData) => {
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from('noticias_ai_imports')
        .insert({
          ...importData,
          imported_by: session?.session?.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias-ai-imports'] });
    },
    onError: (error) => {
      console.error('Erro ao registrar importação:', error);
    },
  });
};

// Detect source from URL
export const detectNewsSource = (url: string): { name: string; badge: string; color: string } => {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('agenciabrasil.ebc.com.br')) {
    return { name: 'Agência Brasil', badge: 'AB', color: 'bg-green-600' };
  }
  if (urlLower.includes('g1.globo.com')) {
    return { name: 'G1', badge: 'G1', color: 'bg-red-600' };
  }
  if (urlLower.includes('folha.uol.com.br')) {
    return { name: 'Folha de S.Paulo', badge: 'FSP', color: 'bg-blue-800' };
  }
  if (urlLower.includes('uol.com.br')) {
    return { name: 'UOL', badge: 'UOL', color: 'bg-orange-500' };
  }
  if (urlLower.includes('estadao.com.br')) {
    return { name: 'Estadão', badge: 'EST', color: 'bg-blue-600' };
  }
  if (urlLower.includes('cnnbrasil.com.br')) {
    return { name: 'CNN Brasil', badge: 'CNN', color: 'bg-red-700' };
  }
  if (urlLower.includes('bbc.com')) {
    return { name: 'BBC', badge: 'BBC', color: 'bg-gray-800' };
  }
  if (urlLower.includes('r7.com')) {
    return { name: 'R7', badge: 'R7', color: 'bg-red-500' };
  }
  if (urlLower.includes('terra.com.br')) {
    return { name: 'Terra', badge: 'TRR', color: 'bg-green-500' };
  }
  if (urlLower.includes('ig.com.br')) {
    return { name: 'iG', badge: 'iG', color: 'bg-purple-600' };
  }
  
  return { name: 'Fonte Externa', badge: 'EXT', color: 'bg-gray-500' };
};
