import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NoticiasAISchedule {
  id: string;
  name: string;
  source_urls: string[];
  source_id: string | null;
  schedule_type: string;
  interval_minutes: number;
  cron_expression: string | null;
  max_articles_per_run: number;
  auto_publish: boolean;
  is_active: boolean;
  last_run: string | null;
  next_run: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoticiasAIScheduleLog {
  id: string;
  schedule_id: string;
  status: string;
  articles_imported: number;
  articles_failed: number;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
}

export interface CreateScheduleData {
  name: string;
  source_urls: string[];
  source_id?: string;
  schedule_type?: string;
  interval_minutes?: number;
  max_articles_per_run?: number;
  auto_publish?: boolean;
}

export interface UpdateScheduleData {
  name?: string;
  source_urls?: string[];
  source_id?: string;
  interval_minutes?: number;
  max_articles_per_run?: number;
  auto_publish?: boolean;
  is_active?: boolean;
}

export const useNoticiasAISchedules = () => {
  return useQuery({
    queryKey: ['noticias-ai-schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noticias_ai_schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NoticiasAISchedule[];
    },
  });
};

export const useNoticiasAIScheduleLogs = (scheduleId?: string, limit = 20) => {
  return useQuery({
    queryKey: ['noticias-ai-schedule-logs', scheduleId, limit],
    queryFn: async () => {
      let query = supabase
        .from('noticias_ai_schedule_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (scheduleId) {
        query = query.eq('schedule_id', scheduleId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as NoticiasAIScheduleLog[];
    },
    enabled: true,
  });
};

export const useCreateNoticiasAISchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleData: CreateScheduleData) => {
      const { data: session } = await supabase.auth.getSession();
      
      // Calculate next_run based on interval
      const nextRun = new Date();
      nextRun.setMinutes(nextRun.getMinutes() + (scheduleData.interval_minutes || 60));
      
      const { data, error } = await supabase
        .from('noticias_ai_schedules')
        .insert({
          ...scheduleData,
          next_run: nextRun.toISOString(),
          created_by: session?.session?.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias-ai-schedules'] });
      toast.success('Agendamento criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar agendamento:', error);
      toast.error('Erro ao criar agendamento');
    },
  });
};

export const useUpdateNoticiasAISchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateScheduleData & { id: string }) => {
      const { data, error } = await supabase
        .from('noticias_ai_schedules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias-ai-schedules'] });
      toast.success('Agendamento atualizado!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar agendamento:', error);
      toast.error('Erro ao atualizar agendamento');
    },
  });
};

export const useDeleteNoticiasAISchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('noticias_ai_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias-ai-schedules'] });
      toast.success('Agendamento removido!');
    },
    onError: (error) => {
      console.error('Erro ao remover agendamento:', error);
      toast.error('Erro ao remover agendamento');
    },
  });
};

export const useRunScheduleNow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      const { data, error } = await supabase.functions.invoke('noticias-ai-scheduler', {
        body: { scheduleId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias-ai-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['noticias-ai-schedule-logs'] });
      queryClient.invalidateQueries({ queryKey: ['noticias-ai-imports'] });
      toast.success('Agendamento executado!');
    },
    onError: (error) => {
      console.error('Erro ao executar agendamento:', error);
      toast.error('Erro ao executar agendamento');
    },
  });
};
