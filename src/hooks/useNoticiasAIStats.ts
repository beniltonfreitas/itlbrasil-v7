import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, subWeeks, subMonths, startOfDay, format } from "date-fns";

export interface NoticiasAIStats {
  total: number;
  successCount: number;
  errorCount: number;
  correctedCount: number;
  successRate: number;
  correctionRate: number;
  dailyAverage: number;
  bySource: Array<{ name: string; count: number; badge: string; color: string }>;
  byDay: Array<{ date: string; count: number; success: number; error: number }>;
  byType: Array<{ type: string; count: number }>;
}

type Period = 'day' | 'week' | 'month';

const getStartDate = (period: Period): Date => {
  const now = new Date();
  switch (period) {
    case 'day':
      return startOfDay(now);
    case 'week':
      return subWeeks(now, 1);
    case 'month':
      return subMonths(now, 1);
    default:
      return subWeeks(now, 1);
  }
};

export const useNoticiasAIStats = (period: Period = 'week') => {
  return useQuery({
    queryKey: ['noticias-ai-stats', period],
    queryFn: async (): Promise<NoticiasAIStats> => {
      const startDate = getStartDate(period);
      
      const { data, error } = await supabase
        .from('noticias_ai_imports')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const imports = data || [];
      const total = imports.length;
      const successCount = imports.filter(i => i.status === 'success').length;
      const errorCount = imports.filter(i => i.status === 'error').length;
      const correctedCount = imports.filter(i => i.format_corrected).length;
      
      // Calculate rates
      const successRate = total > 0 ? (successCount / total) * 100 : 0;
      const correctionRate = successCount > 0 ? (correctedCount / successCount) * 100 : 0;
      
      // Calculate daily average
      const daysDiff = Math.max(1, Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const dailyAverage = total / daysDiff;

      // Group by source
      const sourceMap = new Map<string, { count: number; badge: string; color: string }>();
      imports.forEach(imp => {
        const sourceName = imp.source_name || 'Desconhecida';
        const existing = sourceMap.get(sourceName) || { count: 0, badge: 'EXT', color: '#6B7280' };
        sourceMap.set(sourceName, { 
          count: existing.count + 1, 
          badge: existing.badge,
          color: existing.color
        });
      });
      const bySource = Array.from(sourceMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.count - a.count);

      // Group by day
      const dayMap = new Map<string, { count: number; success: number; error: number }>();
      imports.forEach(imp => {
        const day = format(new Date(imp.created_at), 'yyyy-MM-dd');
        const existing = dayMap.get(day) || { count: 0, success: 0, error: 0 };
        dayMap.set(day, {
          count: existing.count + 1,
          success: existing.success + (imp.status === 'success' ? 1 : 0),
          error: existing.error + (imp.status === 'error' ? 1 : 0),
        });
      });
      const byDay = Array.from(dayMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Group by type
      const typeMap = new Map<string, number>();
      imports.forEach(imp => {
        const type = imp.import_type || 'unknown';
        typeMap.set(type, (typeMap.get(type) || 0) + 1);
      });
      const byType = Array.from(typeMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      return {
        total,
        successCount,
        errorCount,
        correctedCount,
        successRate,
        correctionRate,
        dailyAverage,
        bySource,
        byDay,
        byType,
      };
    },
  });
};
