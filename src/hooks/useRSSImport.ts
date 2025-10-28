import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRSSImport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedId: string) => {
      const { data, error } = await supabase.functions.invoke('import-rss', {
        body: { feedId, mode: 'manual' }
      });

      if (error) {
        throw new Error(`Erro na importação: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['import-logs'] });
      queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
    },
  });
};