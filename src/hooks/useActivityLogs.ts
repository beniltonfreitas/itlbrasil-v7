import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActivityLogFilters {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  activityType?: string;
  ipAddress?: string;
}

// Note: This hook requires the 'user_activity_logs' table to exist.
// If the table doesn't exist, queries will return empty results.

export const useActivityLogs = (filters: ActivityLogFilters = {}, page = 0, pageSize = 50) => {
  return useQuery({
    queryKey: ['activity-logs', filters, page, pageSize],
    queryFn: async () => {
      try {
        let query = (supabase as any)
          .from('user_activity_logs')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (filters.startDate) {
          query = query.gte('created_at', filters.startDate.toISOString());
        }
        if (filters.endDate) {
          query = query.lte('created_at', filters.endDate.toISOString());
        }
        if (filters.userId) {
          query = query.eq('user_id', filters.userId);
        }
        if (filters.activityType) {
          query = query.eq('activity_type', filters.activityType);
        }
        if (filters.ipAddress) {
          query = query.eq('ip_address', filters.ipAddress);
        }

        const { data, error, count } = await query;

        if (error) {
          console.warn('Activity logs table may not exist:', error.message);
          return { logs: [], total: 0 };
        }

        return {
          logs: data || [],
          total: count || 0
        };
      } catch (err) {
        console.warn('Error fetching activity logs:', err);
        return { logs: [], total: 0 };
      }
    }
  });
};

export const useDeleteActivityLogs = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (logIds: string[]) => {
      const { error } = await (supabase as any)
        .from('user_activity_logs')
        .delete()
        .in('id', logIds);

      if (error) throw error;
    },
    onSuccess: (_, logIds) => {
      toast({
        title: 'Logs excluídos',
        description: `${logIds.length} registro(s) excluído(s) com sucesso.`
      });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir logs',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
};

export const useActivityStats = () => {
  return useQuery({
    queryKey: ['activity-stats'],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('user_activity_logs')
          .select('activity_type, created_at')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (error) {
          console.warn('Activity logs table may not exist:', error.message);
          return { byType: {}, byDay: {}, total: 0 };
        }

        const byType: Record<string, number> = {};
        const byDay: Record<string, number> = {};

        (data || []).forEach((log: any) => {
          byType[log.activity_type] = (byType[log.activity_type] || 0) + 1;
          const day = new Date(log.created_at).toLocaleDateString('pt-BR');
          byDay[day] = (byDay[day] || 0) + 1;
        });

        return { byType, byDay, total: (data || []).length };
      } catch (err) {
        console.warn('Error fetching activity stats:', err);
        return { byType: {}, byDay: {}, total: 0 };
      }
    }
  });
};
