import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface JsonHistoryItem {
  id: string;
  user_id: string;
  name?: string;
  news_url?: string;
  image_url?: string;
  generated_json: any;
  articles_count?: number;
  status: 'processing' | 'done' | 'error';
  error_message?: string;
  source_tool: 'reporter-ai' | 'json-generator' | 'jornalista-pro' | 'rss-to-json';
  feed_ids?: string[];
  created_at: string;
}

export const useJsonHistory = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<JsonHistoryItem[]>([]);

  const saveToHistory = async (
    generatedJson: any,
    sourceTool: 'reporter-ai' | 'json-generator' | 'jornalista-pro' | 'rss-to-json',
    options?: {
      name?: string;
      newsUrl?: string;
      imageUrl?: string;
      feedIds?: string[];
      articlesCount?: number;
    },
    status: 'processing' | 'done' | 'error' = 'done',
    errorMessage?: string
  ): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[useJsonHistory] User not authenticated');
        return null;
      }

      const { data, error } = await supabase
        .from('json_generation_history')
        .insert({
          user_id: user.id,
          name: options?.name,
          news_url: options?.newsUrl,
          image_url: options?.imageUrl,
          generated_json: generatedJson,
          articles_count: options?.articlesCount || 0,
          status,
          error_message: errorMessage,
          source_tool: sourceTool,
          feed_ids: options?.feedIds || [],
        })
        .select()
        .single();

      if (error) {
        console.error('[useJsonHistory] Error saving to history:', error);
        return null;
      }

      // Update local state
      setHistory(prev => [data as JsonHistoryItem, ...prev]);
      return data.id;
    } catch (err) {
      console.error('[useJsonHistory] Exception saving to history:', err);
      return null;
    }
  };

  const loadHistory = async (
    sourceTool?: 'reporter-ai' | 'json-generator' | 'jornalista-pro' | 'rss-to-json', 
    limit = 50
  ) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[useJsonHistory] User not authenticated');
        setHistory([]);
        return;
      }

      let query = supabase
        .from('json_generation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (sourceTool) {
        query = query.eq('source_tool', sourceTool);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[useJsonHistory] Error loading history:', error);
        toast.error('Erro ao carregar histórico');
        return;
      }

      setHistory((data as JsonHistoryItem[]) || []);
    } catch (err) {
      console.error('[useJsonHistory] Exception loading history:', err);
      toast.error('Erro ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFromHistory = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('json_generation_history')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[useJsonHistory] Error deleting from history:', error);
        toast.error('Erro ao deletar registro');
        return false;
      }

      // Update local state
      setHistory(prev => prev.filter(item => item.id !== id));
      toast.success('Registro deletado');
      return true;
    } catch (err) {
      console.error('[useJsonHistory] Exception deleting from history:', err);
      toast.error('Erro ao deletar registro');
      return false;
    }
  };

  const updateHistoryStatus = async (
    id: string, 
    status: 'processing' | 'done' | 'error',
    errorMessage?: string
  ): Promise<boolean> => {
    try {
      const updateData: any = { status };
      if (errorMessage) {
        updateData.error_message = errorMessage;
      }

      const { error } = await supabase
        .from('json_generation_history')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('[useJsonHistory] Error updating history:', error);
        return false;
      }

      // Update local state
      setHistory(prev => prev.map(item => 
        item.id === id ? { ...item, status, error_message: errorMessage } : item
      ));
      return true;
    } catch (err) {
      console.error('[useJsonHistory] Exception updating history:', err);
      return false;
    }
  };

  return {
    saveToHistory,
    loadHistory,
    deleteFromHistory,
    updateHistoryStatus,
    history,
    isLoading,
  };
};
