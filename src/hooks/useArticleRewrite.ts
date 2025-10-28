import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RewriteRequest {
  sourceUrl: string;
  currentContent?: string;
  preserveCharacterCount?: boolean;
}

interface RewriteResponse {
  rewrittenContent: string;
  originalCharCount: number;
  rewrittenCharCount: number;
  percentageChange: number;
}

export const useArticleRewrite = () => {
  return useMutation({
    mutationFn: async (data: RewriteRequest): Promise<RewriteResponse> => {
      const { data: result, error } = await supabase.functions.invoke('rewrite-article', {
        body: data
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!result) {
        throw new Error('Resposta inválida do serviço de reescrita');
      }

      return result as RewriteResponse;
    },
  });
};