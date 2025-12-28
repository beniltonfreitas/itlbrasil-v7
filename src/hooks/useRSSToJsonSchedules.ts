import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface RSSJsonSchedule {
  id: string;
  name: string;
  feed_ids: string[];
  quantity_per_feed: number;
  interval_minutes: number;
  output_action: 'generate_only' | 'generate_and_import';
  is_active: boolean;
  last_run: string | null;
  next_run: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RSSJsonScheduleLog {
  id: string;
  schedule_id: string;
  status: string;
  articles_processed: number;
  articles_failed: number;
  json_output: string | null;
  error_message: string | null;
  created_at: string;
}

export const useRSSJsonSchedules = () => {
  return useQuery({
    queryKey: ['rss-json-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rss_json_schedules' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as RSSJsonSchedule[];
    }
  });
};

export const useRSSJsonScheduleLogs = (scheduleId?: string) => {
  return useQuery({
    queryKey: ['rss-json-schedule-logs', scheduleId],
    queryFn: async () => {
      let query = supabase
        .from('rss_json_schedule_logs' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (scheduleId) {
        query = query.eq('schedule_id', scheduleId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as RSSJsonScheduleLog[];
    },
    enabled: !!scheduleId || scheduleId === undefined
  });
};

export const useCreateRSSJsonSchedule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (schedule: Omit<RSSJsonSchedule, 'id' | 'created_at' | 'updated_at' | 'last_run' | 'next_run'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const nextRun = new Date(Date.now() + schedule.interval_minutes * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('rss_json_schedules' as any)
        .insert({
          ...schedule,
          created_by: user?.id,
          next_run: nextRun
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as RSSJsonSchedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-json-schedules'] });
      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar agendamento",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useUpdateRSSJsonSchedule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RSSJsonSchedule> & { id: string }) => {
      const { data, error } = await supabase
        .from('rss_json_schedules' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as RSSJsonSchedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-json-schedules'] });
      toast({
        title: "Agendamento atualizado",
        description: "As alterações foram salvas"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useDeleteRSSJsonSchedule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rss_json_schedules' as any)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-json-schedules'] });
      toast({
        title: "Agendamento removido",
        description: "O agendamento foi excluído"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useToggleScheduleActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('rss_json_schedules' as any)
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as unknown as RSSJsonSchedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-json-schedules'] });
    }
  });
};
